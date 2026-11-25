import { describe, expect, it } from 'vitest';
import {
  abv,
  buGuRatio,
  calories12oz,
  finalGravity,
  gravityAtVolume,
  hydrometerCorrection,
  ibuForAddition,
  newRecipe,
  originalGravity,
  platoToSg,
  primingSugarGrams,
  recipeStats,
  sgToPlato,
  srm,
  srmColorName,
  srmToEbc,
  srmToHex,
  strikeWaterTempF,
  toBeerXml,
  totalIbu,
} from '../src/index.js';
import type { FermentableAddition, HopAddition } from '../src/index.js';

const paleMalt = (amountLb: number): FermentableAddition => ({
  fermentableId: 'pale-2row',
  name: '2-Row Pale Malt (US)',
  type: 'grain',
  potential: 1.037,
  lovibond: 1.8,
  mustMash: true,
  amountLb,
});

const sugar = (amountLb: number): FermentableAddition => ({
  fermentableId: 'corn-sugar',
  name: 'Corn Sugar',
  type: 'sugar',
  potential: 1.046,
  lovibond: 0,
  mustMash: false,
  amountLb,
});

const boilHop = (oz: number, time: number, alpha: number): HopAddition => ({
  hopId: 'cascade',
  name: 'Cascade',
  alpha,
  amountOz: oz,
  use: 'boil',
  timeMin: time,
  form: 'pellet',
});

describe('gravity', () => {
  it('computes OG with mash efficiency on grains', () => {
    // 10 lb of 1.037 potential at 72% eff in 5 gal: 10*37*0.72/5 = 53.28 pts
    const og = originalGravity([paleMalt(10)], 5, 72);
    expect(og).toBeCloseTo(1.05328, 4);
  });

  it('applies 100% efficiency to sugars', () => {
    // 1 lb dextrose in 5 gal: 46/5 = 9.2 pts regardless of efficiency
    const og = originalGravity([sugar(1)], 5, 50);
    expect(og).toBeCloseTo(1.0092, 4);
  });

  it('computes FG from attenuation', () => {
    const fg = finalGravity(1.05, 75);
    expect(fg).toBeCloseTo(1.0125, 4);
  });

  it('computes ABV', () => {
    expect(abv(1.05, 1.01)).toBeCloseTo(5.25, 2);
  });

  it('round-trips Plato and SG', () => {
    const sg = 1.048;
    expect(platoToSg(sgToPlato(sg))).toBeCloseTo(sg, 4);
    expect(sgToPlato(1.04)).toBeCloseTo(10, 1);
  });

  it('conserves extract when diluting', () => {
    // 1.080 at 3 gal diluted to 6 gal -> 1.040
    expect(gravityAtVolume(1.08, 3, 6)).toBeCloseTo(1.04, 4);
  });
});

describe('IBU (Tinseth)', () => {
  it('matches the reference utilization table for a 60 min addition', () => {
    // Tinseth utilization at 1.050 boil gravity, 60 min = 0.231 (leaf):
    // 1.65*0.000125^0.05 * (1-e^-2.4)/4.15 = 0.2307.
    // 1 oz of 10% AA leaf hops in 5 gal: 0.10 * 7490 / 5 * 0.2307 = ~34.6 IBU
    const hop: HopAddition = { ...boilHop(1, 60, 10), form: 'leaf' };
    const ibu = ibuForAddition(hop, 5, 1.05);
    expect(ibu).toBeCloseTo(34.6, 0);
  });

  it('gives zero IBUs for dry hops', () => {
    const hop: HopAddition = { ...boilHop(2, 3, 12), use: 'dry hop' };
    expect(ibuForAddition(hop, 5, 1.05)).toBe(0);
  });

  it('credits whirlpool additions at reduced utilization', () => {
    const wp: HopAddition = { ...boilHop(1, 20, 10), use: 'whirlpool' };
    const boil20: HopAddition = boilHop(1, 20, 10);
    const wpIbu = ibuForAddition(wp, 5, 1.05);
    expect(wpIbu).toBeGreaterThan(0);
    expect(wpIbu).toBeCloseTo(ibuForAddition(boil20, 5, 1.05) * 0.5, 5);
  });

  it('longer boils extract more bitterness', () => {
    const short = ibuForAddition(boilHop(1, 10, 10), 5, 1.05);
    const long = ibuForAddition(boilHop(1, 60, 10), 5, 1.05);
    expect(long).toBeGreaterThan(short * 2);
  });

  it('sums additions in totalIbu', () => {
    const hops = [boilHop(1, 60, 10), boilHop(1, 10, 5)];
    const total = totalIbu(hops, 5, 6.5, 1.05);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeCloseTo(
      ibuForAddition(hops[0]!, 5, totalBoilGravity(1.05, 5, 6.5)) +
        ibuForAddition(hops[1]!, 5, totalBoilGravity(1.05, 5, 6.5)),
      6,
    );
  });
});

function totalBoilGravity(og: number, batch: number, boil: number): number {
  return 1 + ((og - 1) * batch) / boil;
}

describe('color (Morey)', () => {
  it('computes SRM for a simple pale grist', () => {
    // 10 lb of 1.8L in 5 gal: MCU = 3.6, SRM = 1.4922 * 3.6^0.6859 = ~3.6
    expect(srm([paleMalt(10)], 5)).toBeCloseTo(3.59, 1);
  });

  it('maps SRM to a hex color', () => {
    expect(srmToHex(4)).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(srmToHex(4)).not.toBe(srmToHex(30));
  });

  it('interpolates smoothly between reference colors', () => {
    expect(srmToHex(4)).toBe('#FFBF42'); // exact stops are preserved
    expect(srmToHex(5)).toBe('#FBB123');
    const mid = srmToHex(4.5);
    expect(mid).not.toBe(srmToHex(4));
    expect(mid).not.toBe(srmToHex(5));
    // halfway between #FFBF42 and #FBB123
    expect(mid).toBe('#FDB833');
  });

  it('darkens monotonically across the whole scale', () => {
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
    };
    let prev = Infinity;
    for (let s = 1; s <= 50; s += 0.25) {
      const l = luminance(srmToHex(s));
      // Rounding to 8-bit channels can tick green up one step (~0.72 luminance).
      expect(l, `SRM ${s}`).toBeLessThanOrEqual(prev + 1);
      prev = l;
    }
    expect(srmToHex(0)).toBe(srmToHex(1));
    expect(srmToHex(80)).toBe('#1A0505');
    expect(srmToHex(Number.NaN)).toBe(srmToHex(1));
  });

  it('names beer colors and converts to EBC', () => {
    expect(srmColorName(3.5)).toBe('Pale gold');
    expect(srmColorName(13)).toBe('Deep amber');
    expect(srmColorName(35)).toBe('Black');
    expect(srmToEbc(10)).toBeCloseTo(19.7, 5);
  });
});

describe('brew-day utilities', () => {
  it('computes strike water temperature', () => {
    // Classic example: 1.5 qt/lb, 70F grain, 152F target -> ~162.9F
    expect(strikeWaterTempF(1.5, 70, 152)).toBeCloseTo(162.93, 1);
  });

  it('computes priming sugar in a sane range', () => {
    // 5 gal at 68F to 2.4 vols is ~4-5 oz corn sugar (113-142 g)
    const grams = primingSugarGrams(5, 68, 2.4);
    expect(grams).toBeGreaterThan(100);
    expect(grams).toBeLessThan(150);
  });

  it('corrects hydrometer readings for temperature', () => {
    const corrected = hydrometerCorrection(1.05, 100, 60);
    expect(corrected).toBeGreaterThan(1.05); // warm sample reads low
    expect(hydrometerCorrection(1.05, 60, 60)).toBeCloseTo(1.05, 6);
  });

  it('estimates calories per 12 oz', () => {
    // A 1.050 -> 1.010 beer is ~165 kcal per 12 oz
    const cal = calories12oz(1.05, 1.01);
    expect(cal).toBeGreaterThan(150);
    expect(cal).toBeLessThan(185);
  });

  it('computes BU:GU balance', () => {
    expect(buGuRatio(50, 1.05)).toBeCloseTo(1.0, 5);
  });
});

describe('recipeStats', () => {
  it('produces a coherent stat block for a pale ale', () => {
    const recipe = newRecipe({
      name: 'Test Pale',
      fermentables: [paleMalt(10), { ...paleMalt(1), lovibond: 40, name: 'Crystal 40' }],
      hops: [boilHop(1, 60, 12), boilHop(1, 10, 5.5)],
      yeast: {
        yeastId: 'us-05', name: 'SafAle US-05', lab: 'Fermentis',
        productId: 'US-05', form: 'dry', attenuation: 78,
      },
    });
    const stats = recipeStats(recipe);
    expect(stats.og).toBeGreaterThan(1.05);
    expect(stats.og).toBeLessThan(1.07);
    expect(stats.fg).toBeLessThan(stats.og);
    expect(stats.abv).toBeGreaterThan(4.5);
    expect(stats.ibu).toBeGreaterThan(30);
    expect(stats.srm).toBeGreaterThan(4);
    expect(stats.totalGrainLb).toBeCloseTo(11, 5);
  });

  it('handles an empty recipe without NaN', () => {
    const stats = recipeStats(newRecipe());
    expect(stats.og).toBe(1);
    expect(Number.isFinite(stats.ibu)).toBe(true);
    expect(Number.isFinite(stats.srm)).toBe(true);
    expect(stats.abv).toBe(0);
  });
});

describe('BeerXML export', () => {
  it('produces valid-looking BeerXML with escaped entities', () => {
    const recipe = newRecipe({
      name: 'Hops & Dreams <IPA>',
      fermentables: [paleMalt(12)],
      hops: [boilHop(1, 60, 12)],
      yeast: {
        yeastId: 'us-05', name: 'SafAle US-05', lab: 'Fermentis',
        productId: 'US-05', form: 'dry', attenuation: 78,
      },
    });
    const xml = toBeerXml(recipe);
    expect(xml).toContain('<NAME>Hops &amp; Dreams &lt;IPA&gt;</NAME>');
    expect(xml).toContain('<BATCH_SIZE>18.93</BATCH_SIZE>'); // 5 gal in liters
    expect(xml).toContain('<USE>Boil</USE>');
    expect(xml).toContain('<STYLE_GUIDE>BJCP 2021</STYLE_GUIDE>');
  });
});
