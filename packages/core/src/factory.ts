import type { Recipe } from './types.js';

function generateId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  return c?.randomUUID ? c.randomUUID() : `r-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** Create a sensible blank recipe (5 gal batch, 60 min boil, 72% efficiency). */
export function newRecipe(partial: Partial<Recipe> = {}): Recipe {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: 'New Recipe',
    author: '',
    styleId: 'american-pale-ale',
    batchSizeGal: 5,
    boilSizeGal: 6.5,
    boilTimeMin: 60,
    efficiencyPct: 72,
    fermentables: [],
    hops: [],
    yeast: null,
    mash: { mashTempF: 152, mashTimeMin: 60, ratioQtPerLb: 1.5 },
    carbonationVols: 2.4,
    notes: '',
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}
