import { describe, expect, it } from 'vitest';
import {
  decoctionVolumeQt,
  defaultEquipment,
  EQUIPMENT_PRESETS,
  infusionVolumeQt,
  newRecipe,
  presetProfile,
  suggestedBoilSizeGal,
  toBeerXml,
  volumeBreakdown,
} from '../src/index.js';

describe('equipment volume math', () => {
  const eq = defaultEquipment(); // 1.0 gal/hr boil-off, 0.5 kettle, 0.25 lauter, 0.12 gal/lb, 0.25 ferm loss

  it('walks volumes backward from the fermenter', () => {
    const v = volumeBreakdown(5, 60, 12, eq, { ratioQtPerLb: 1.5, spargeType: 'batch' });
    expect(v.postBoilGal).toBeCloseTo(5.5, 2);
    expect(v.preBoilGal).toBeCloseTo(6.5, 2);
    expect(v.totalWaterGal).toBeCloseTo(6.5 + 1.44 + 0.25, 2);
    expect(v.strikeQt).toBeCloseTo(18, 2);
    expect(v.spargeGal).toBeCloseTo(v.totalWaterGal - 4.5, 2);
    expect(v.packagedGal).toBeCloseTo(4.75, 2);
  });

  it('puts all water in the strike for full-volume (BIAB) mashes', () => {
    const v = volumeBreakdown(5, 60, 12, eq, { ratioQtPerLb: 1.5, spargeType: 'none' });
    expect(v.spargeGal).toBe(0);
    expect(v.strikeQt).toBeCloseTo(v.totalWaterGal * 4, 5);
  });

  it('suggests the boil size for a recipe with equipment', () => {
    const recipe = newRecipe();
    expect(suggestedBoilSizeGal(recipe)).toBeCloseTo(5.5 + 1, 2); // no grain yet
    expect(suggestedBoilSizeGal({ ...recipe, equipment: undefined })).toBeUndefined();
  });

  it('ships sane presets', () => {
    expect(EQUIPMENT_PRESETS.length).toBeGreaterThanOrEqual(9);
    for (const p of EQUIPMENT_PRESETS) {
      expect(p.boilOffGalPerHour).toBeGreaterThan(0);
      expect(p.grainAbsorptionGalPerLb).toBeGreaterThan(0);
    }
  });

  it('covers the Blichmann Pro Pilot HERMS lineup with fly sparge defaults', () => {
    const blichmann = EQUIPMENT_PRESETS.filter((p) => p.id.startsWith('blichmann-pilot'));
    expect(blichmann.map((p) => p.id)).toEqual([
      'blichmann-pilot-5',
      'blichmann-pilot-10',
      'blichmann-pilot-15',
      'blichmann-pilot-20',
      'blichmann-pilot-1bbl',
    ]);
    for (const p of blichmann) {
      expect(p.defaultSpargeType, p.id).toBe('fly'); // AutoSparge
      expect('defaultSpargeType' in presetProfile(p)).toBe(false); // stripped from recipes
    }
    // Bigger systems boil off and lose more
    const boilOffs = blichmann.map((p) => p.boilOffGalPerHour);
    expect([...boilOffs].sort((a, b) => a - b)).toEqual(boilOffs);
  });
});

describe('step mash calculations', () => {
  it('computes infusion volume (Palmer)', () => {
    // Raise 12 lb + 18 qt from 152 to 168 with 210F water:
    // (16)(0.2*12+18)/(210-168) = 16*20.4/42 = 7.77 qt
    expect(infusionVolumeQt(152, 168, 12, 18)).toBeCloseTo(7.77, 1);
    expect(Number.isNaN(infusionVolumeQt(152, 168, 12, 18, 160))).toBe(true);
  });

  it('estimates decoction pull size', () => {
    const qt = decoctionVolumeQt(148, 162, 22);
    expect(qt).toBeGreaterThan(4);
    expect(qt).toBeLessThan(12);
    expect(decoctionVolumeQt(162, 150, 22)).toBe(0);
  });
});

describe('miscs and mash steps in BeerXML', () => {
  it('exports misc additions and every mash step', () => {
    const recipe = newRecipe({
      name: 'Wit',
      miscs: [
        { name: 'Coriander (crushed)', type: 'spice', use: 'boil', amount: 28, unit: 'g', timeMin: 5 },
        { name: 'Vanilla bean', type: 'flavor', use: 'secondary', amount: 2, unit: 'each', timeMin: 7 },
      ],
      mash: {
        mashTempF: 122,
        mashTimeMin: 15,
        ratioQtPerLb: 1.4,
        spargeType: 'batch',
        steps: [
          { name: 'Protein rest', type: 'infusion', tempF: 122, timeMin: 15 },
          { name: 'Saccharification', type: 'infusion', tempF: 149, timeMin: 45 },
          { name: 'Mash out', type: 'temperature', tempF: 168, timeMin: 10 },
        ],
      },
    });
    const xml = toBeerXml(recipe);
    expect(xml).toContain('<NAME>Coriander (crushed)</NAME>');
    expect(xml).toContain('<AMOUNT>0.0280</AMOUNT>'); // 28 g in kg
    expect(xml).toContain('<AMOUNT_IS_WEIGHT>FALSE</AMOUNT_IS_WEIGHT>'); // vanilla in "each"
    expect(xml).toContain('<NAME>Protein rest</NAME>');
    expect(xml).toContain('<TYPE>Temperature</TYPE>');
    expect((xml.match(/<MASH_STEP>/g) ?? []).length).toBe(3);
  });
});
