import { describe, expect, it } from 'vitest';
import { FERMENTABLE_GROUPS, FERMENTABLES, HOPS, YEASTS } from '../src/index.js';

describe('ingredient catalog', () => {
  it('has a comprehensive fermentable list', () => {
    expect(FERMENTABLES.length).toBeGreaterThanOrEqual(100);
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
