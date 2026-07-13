import { describe, expect, it } from 'vitest';
import {
  applySalts,
  emptySalts,
  estimateMashPh,
  lacticAcidForTargetPh,
  parseWardLabsReport,
  residualAlkalinity,
  suggestSalts,
  sulfateChlorideDescriptor,
  sulfateChlorideRatio,
  totalBrewingWaterGal,
  waterTargetById,
  ZERO_WATER,
  type FermentableAddition,
  type WaterProfile,
} from '../src/index.js';

const paleMalt = (amountLb: number, lovibond = 1.8, name = 'Pale'): FermentableAddition => ({
  fermentableId: 'x',
  name,
  type: 'grain',
  potential: 1.037,
  lovibond,
  mustMash: true,
  amountLb,
});

describe('salt additions', () => {
  it('computes gypsum ion contributions (1 g in 1 gal)', () => {
    const result = applySalts(ZERO_WATER, { ...emptySalts(), gypsum: 1 }, 1);
    expect(result.ca).toBeCloseTo(61.5, 1);
    expect(result.so4).toBeCloseTo(147.4, 1);
    expect(result.cl).toBe(0);
  });

  it('scales with volume and stacks salts', () => {
    const result = applySalts(ZERO_WATER, { ...emptySalts(), gypsum: 5, cacl2: 2 }, 5);
    expect(result.ca).toBeCloseTo(61.5 + (72.0 * 2) / 5, 1);
    expect(result.so4).toBeCloseTo(147.4, 1);
    expect(result.cl).toBeCloseTo((127.4 * 2) / 5, 1);
  });

  it('suggests non-negative salts that land near the target from RO', () => {
    const target = waterTargetById('hoppy-pale')!.profile;
    const salts = suggestSalts(ZERO_WATER, target, 7);
    for (const v of Object.values(salts)) expect(v).toBeGreaterThanOrEqual(0);
    expect(salts.gypsum).toBeGreaterThan(0);
    const result = applySalts(ZERO_WATER, salts, 7);
    expect(Math.abs(result.so4 - target.so4)).toBeLessThan(25);
    expect(Math.abs(result.cl - target.cl)).toBeLessThan(20);
    expect(Math.abs(result.ca - target.ca)).toBeLessThan(30);
  });

  it('does not chase ions that are already above target', () => {
    const salty: WaterProfile = { ca: 200, mg: 40, na: 150, so4: 500, cl: 300, hco3: 200 };
    const target = waterTargetById('crisp-lager')!.profile;
    const salts = suggestSalts(salty, target, 6);
    const total = Object.values(salts).reduce((a, b) => a + b, 0);
    expect(total).toBeLessThan(1); // nothing meaningful to add
  });
});

describe('water characterization', () => {
  it('computes sulfate:chloride balance', () => {
    expect(sulfateChlorideRatio({ ...ZERO_WATER, so4: 250, cl: 80 })).toBeCloseTo(3.125, 2);
    expect(sulfateChlorideDescriptor(3.1)).toBe('hoppy');
    expect(sulfateChlorideDescriptor(0.5)).toBe('malty');
    expect(sulfateChlorideDescriptor(1.2)).toBe('balanced');
    expect(sulfateChlorideRatio(ZERO_WATER)).toBe(1); // undefined balance, treat neutral
  });

  it('computes residual alkalinity', () => {
    // Palmer: RA = alkalinity(asCaCO3) - Ca/1.4 - Mg/1.7
    const munich: WaterProfile = { ca: 77, mg: 17, na: 4, so4: 18, cl: 8, hco3: 295 };
    const ra = residualAlkalinity(munich);
    expect(ra).toBeCloseTo(295 * (50 / 61) - 77 / 1.4 - 17 / 1.7, 1);
    expect(ra).toBeGreaterThan(150); // Munich water is alkaline
    expect(residualAlkalinity(ZERO_WATER)).toBe(0);
  });
});

describe('mash pH estimate', () => {
  it('puts a pale grist in RO water near 5.7', () => {
    const ph = estimateMashPh([paleMalt(10)], ZERO_WATER, 1.5);
    expect(ph).toBeGreaterThan(5.6);
    expect(ph).toBeLessThan(5.8);
  });

  it('drops with roasted malt and rises with alkaline water', () => {
    const paleOnly = estimateMashPh([paleMalt(10)], ZERO_WATER, 1.5);
    const withRoast = estimateMashPh(
      [paleMalt(9), paleMalt(1, 300, 'Roasted Barley')],
      ZERO_WATER,
      1.5,
    );
    expect(withRoast).toBeLessThan(paleOnly);

    const dublin: WaterProfile = { ca: 118, mg: 4, na: 12, so4: 55, cl: 19, hco3: 319 };
    const alkaline = estimateMashPh([paleMalt(10)], dublin, 1.5);
    expect(alkaline).toBeGreaterThan(paleOnly);
  });

  it('lactic acid lowers pH and the suggestion roughly closes the gap', () => {
    const dublin: WaterProfile = { ca: 118, mg: 4, na: 12, so4: 55, cl: 19, hco3: 319 };
    const before = estimateMashPh([paleMalt(10)], dublin, 1.5);
    const ml = lacticAcidForTargetPh(before, 5.4, 10);
    expect(ml).toBeGreaterThan(0);
    const after = estimateMashPh([paleMalt(10)], dublin, 1.5, ml);
    expect(after).toBeCloseTo(5.4, 1);
    expect(lacticAcidForTargetPh(5.3, 5.4, 10)).toBe(0);
  });

  it('treats acidulated malt as an acid', () => {
    const withAcid = estimateMashPh(
      [paleMalt(9.5), paleMalt(0.5, 3, 'Acidulated Malt')],
      ZERO_WATER,
      1.5,
    );
    expect(withAcid).toBeLessThan(estimateMashPh([paleMalt(10)], ZERO_WATER, 1.5));
  });
});

describe('brewing water volume', () => {
  it('adds grain absorption to the boil volume', () => {
    expect(totalBrewingWaterGal(6.5, 12)).toBeCloseTo(6.5 + 1.44, 2);
  });
});

describe('Ward Labs report parsing', () => {
  const report = `
    Ward Laboratories, Inc.
    W-6 Household Mineral Test

    pH 7.6
    Total Dissolved Solids (TDS) Est, ppm 183
    Electrical Conductivity, mmho/cm 0.31
    Cations / Anions, me/L 3.0 / 3.1

    Sodium, Na 8
    Potassium, K 1
    Calcium, Ca 29
    Magnesium, Mg 6
    Total Hardness, CaCO3 96
    Nitrate, NO3-N 0.1 (SAFE)
    Sulfate, SO4-S 6
    Chloride, Cl 3
    Carbonate, CO3 < 1.0
    Bicarbonate, HCO3 44
    Total Alkalinity, CaCO3 40
    Total Phosphorus, P 0.02
    Total Iron, Fe < 0.01
  `;

  it('extracts the six brewing ions with SO4-S converted to SO4', () => {
    const { profile, ph, alkalinity, hardness } = parseWardLabsReport(report);
    expect(profile.na).toBe(8);
    expect(profile.ca).toBe(29);
    expect(profile.mg).toBe(6);
    expect(profile.so4).toBeCloseTo(18, 0); // 6 ppm as S × 2.996
    expect(profile.cl).toBe(3);
    expect(profile.hco3).toBe(44);
    expect(ph).toBe(7.6);
    expect(alkalinity).toBe(40);
    expect(hardness).toBe(96);
  });

  it('derives HCO3 from total alkalinity when no bicarbonate line exists', () => {
    const { profile } = parseWardLabsReport('Calcium, Ca 20\nTotal Alkalinity, CaCO3 100');
    expect(profile.hco3).toBeCloseTo(122, 0);
  });

  it('takes plain sulfate lines as-is (non-Ward reports)', () => {
    const { profile } = parseWardLabsReport('Sulfate 45');
    expect(profile.so4).toBe(45);
  });

  it('returns an empty profile for garbage input', () => {
    const { profile } = parseWardLabsReport('hello world, no data here');
    expect(Object.keys(profile)).toHaveLength(0);
  });
});
