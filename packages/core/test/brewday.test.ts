import { describe, expect, it } from 'vitest';
import {
  actualAbv,
  actualAttenuationPct,
  actualEfficiencyPct,
  generateBrewSteps,
  newRecipe,
  newSession,
  type Recipe,
} from '../src/index.js';

const recipe = (): Recipe =>
  newRecipe({
    name: 'Checklist IPA',
    fermentables: [
      { fermentableId: 'pale-2row', name: '2-Row Pale Malt', type: 'grain', potential: 1.037, lovibond: 1.8, mustMash: true, amountLb: 12 },
    ],
    hops: [
      { hopId: 'magnum', name: 'Magnum', alpha: 12, amountOz: 0.5, use: 'boil', timeMin: 60, form: 'pellet' },
      { hopId: 'citra', name: 'Citra', alpha: 12, amountOz: 1, use: 'boil', timeMin: 10, form: 'pellet' },
      { hopId: 'citra', name: 'Citra', alpha: 12, amountOz: 2, use: 'whirlpool', timeMin: 20, form: 'pellet' },
      { hopId: 'citra', name: 'Citra', alpha: 12, amountOz: 3, use: 'dry hop', timeMin: 3, form: 'pellet' },
    ],
    yeast: { yeastId: 'us-05', name: 'SafAle US-05', lab: 'Fermentis', productId: 'US-05', form: 'dry', attenuation: 78 },
    miscs: [{ name: 'Whirlfloc tablet', type: 'fining', use: 'boil', amount: 1, unit: 'each', timeMin: 15 }],
    water: {
      sourceName: 'Distilled / RO',
      source: { ca: 0, mg: 0, na: 0, so4: 0, cl: 0, hco3: 0 },
      targetId: 'hoppy-pale',
      salts: { gypsum: 5, cacl2: 2, epsom: 0, nacl: 0, nahco3: 0, caco3: 0 },
      lacticAcidMl: 3,
    },
  });

describe('brew day checklist', () => {
  const steps = generateBrewSteps(recipe());

  it('covers every phase in order', () => {
    const phases = [...new Set(steps.map((s) => s.phase))];
    expect(phases).toEqual(['Prep', 'Mash', 'Boil', 'Whirlpool', 'Fermentation', 'Packaging']);
  });

  it('includes water treatment when salts are dosed', () => {
    const treat = steps.find((s) => s.title === 'Treat brewing water');
    expect(treat?.detail).toContain('5 g gypsum');
    expect(treat?.detail).toContain('3 mL lactic 88%');
  });

  it('orders boil additions by time remaining and times the boil', () => {
    const boil = steps.filter((s) => s.phase === 'Boil');
    expect(boil[0]!.timerMin).toBe(60);
    const times = boil.slice(1).map((s) => s.title);
    expect(times[0]).toContain('@ 60 min: 0.5 oz Magnum');
    expect(times[1]).toContain('@ 15 min: 1 each Whirlfloc');
    expect(times[2]).toContain('@ 10 min: 1 oz Citra');
  });

  it('includes whirlpool, pitch, dry hop, and packaging steps', () => {
    expect(steps.some((s) => s.phase === 'Whirlpool' && s.timerMin === 20)).toBe(true);
    expect(steps.some((s) => s.title.startsWith('Pitch SafAle US-05'))).toBe(true);
    expect(steps.some((s) => s.title.includes('Dry hop day 3'))).toBe(true);
    expect(steps.find((s) => s.phase === 'Packaging')?.detail).toContain('PSI');
  });

  it('times mash rests', () => {
    const mash = steps.find((s) => s.phase === 'Mash');
    expect(mash?.timerMin).toBe(60);
    expect(mash?.detail).toContain('Strike');
  });
});

describe('brew sessions', () => {
  it('snapshots predictions from the recipe', () => {
    const s = newSession(recipe());
    expect(s.recipeName).toBe('Checklist IPA');
    expect(s.status).toBe('planned');
    expect(s.predicted.og).toBeGreaterThan(1.05);
    expect(s.predicted.efficiencyPct).toBe(72);
    expect(s.gravityReadings).toEqual([]);
  });

  it('computes actual efficiency, ABV, and attenuation from measurements', () => {
    const r = recipe();
    // 12 lb × 37 pts = 444 potential points. Measured 1.058 in 5 gal = 290 → 65.3%
    expect(actualEfficiencyPct(r, 1.058, 5)).toBeCloseTo(65.3, 1);
    expect(actualAbv(1.058, 1.012)).toBeCloseTo(6.04, 1);
    expect(actualAttenuationPct(1.058, 1.012)).toBeCloseTo(79.3, 1);
  });
});
