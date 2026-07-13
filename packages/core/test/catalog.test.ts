import { describe, expect, it } from 'vitest';
import { FERMENTABLE_GROUPS, FERMENTABLES, HOPS, YEASTS } from '../src/index.js';

describe('ingredient catalog', () => {
  it('has comprehensive ingredient lists', () => {
    expect(FERMENTABLES.length).toBeGreaterThanOrEqual(100);
    expect(HOPS.length).toBeGreaterThanOrEqual(60);
    expect(YEASTS.length).toBeGreaterThanOrEqual(60);
  });

  it('has unique ids across all catalogs', () => {
    for (const list of [FERMENTABLES, HOPS, YEASTS] as const) {
      const ids = list.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('keeps legacy ids used by saved recipes', () => {
    const ids = new Set(FERMENTABLES.map((f) => f.id));
    for (const legacy of [
      'pale-2row', 'pale-maris-otter', 'pilsner-de', 'vienna', 'munich-10',
      'wheat-malt', 'white-wheat', 'flaked-oats', 'flaked-wheat', 'flaked-corn',
      'crystal-20', 'crystal-40', 'crystal-60', 'crystal-120', 'caramunich',
      'carapils', 'victory', 'honey-malt', 'chocolate', 'pale-chocolate',
      'roasted-barley', 'black-patent', 'midnight-wheat', 'acid-malt',
      'corn-sugar', 'table-sugar', 'honey', 'lactose', 'candi-syrup-d90',
      'lme-light', 'dme-light', 'dme-wheat',
    ]) {
      expect(ids.has(legacy), `missing legacy id ${legacy}`).toBe(true);
    }

    const hopIds = new Set(HOPS.map((h) => h.id));
    for (const legacy of ['cascade', 'citra', 'galaxy', 'magnum', 'ekg', 'saaz', 'mosaic', 'simcoe']) {
      expect(hopIds.has(legacy), `missing legacy hop id ${legacy}`).toBe(true);
    }

    const yeastIds = new Set(YEASTS.map((y) => y.id));
    for (const legacy of ['us-05', 's-04', 'w-34-70', 'wy1318', 'wlp001', 'verdant', 'voss-kveik']) {
      expect(yeastIds.has(legacy), `missing legacy yeast id ${legacy}`).toBe(true);
    }
  });

  it('has plausible values on every hop and yeast', () => {
    for (const h of HOPS) {
      expect(h.alpha, h.id).toBeGreaterThan(0);
      expect(h.alpha, h.id).toBeLessThanOrEqual(25);
    }
    for (const y of YEASTS) {
      expect(y.attenuation, y.id).toBeGreaterThanOrEqual(60);
      expect(y.attenuation, y.id).toBeLessThanOrEqual(95);
      expect(y.tempLowF, y.id).toBeLessThan(y.tempHighF);
    }
  });

  it('has plausible values and a known group on every fermentable', () => {
    for (const f of FERMENTABLES) {
      expect(f.potential, f.id).toBeGreaterThanOrEqual(1.0);
      expect(f.potential, f.id).toBeLessThanOrEqual(1.05);
      expect(f.lovibond, f.id).toBeGreaterThanOrEqual(0);
      expect(f.lovibond, f.id).toBeLessThanOrEqual(600);
      expect(f.group && FERMENTABLE_GROUPS.includes(f.group), f.id).toBe(true);
    }
  });
});
