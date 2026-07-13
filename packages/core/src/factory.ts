import { defaultEquipment } from './equipment.js';
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
    miscs: [],
    mash: {
      mashTempF: 152,
      mashTimeMin: 60,
      ratioQtPerLb: 1.5,
      steps: [{ name: 'Saccharification', type: 'infusion', tempF: 152, timeMin: 60 }],
      spargeType: 'batch',
    },
    equipment: defaultEquipment(),
    carbonationVols: 2.4,
    water: {
      sourceName: 'Distilled / RO',
      source: { ca: 0, mg: 0, na: 0, so4: 0, cl: 0, hco3: 0 },
      targetId: 'balanced',
      salts: { gypsum: 0, cacl2: 0, epsom: 0, nacl: 0, nahco3: 0, caco3: 0 },
      lacticAcidMl: 0,
    },
    notes: '',
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}
