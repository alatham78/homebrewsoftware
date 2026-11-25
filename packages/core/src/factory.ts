import { defaultEquipmentPreset, presetProfile, volumeBreakdown } from './equipment.js';
import type { Recipe } from './types.js';

/** Batch size new recipes start with, gallons into the fermenter. */
export const DEFAULT_BATCH_SIZE_GAL = 5;

function generateId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  return c?.randomUUID ? c.randomUUID() : `r-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/**
 * Create a recipe on the default rig: DEFAULT_BATCH_SIZE_GAL batch, 60 min
 * boil, 72% efficiency, the default equipment preset with its sparge method,
 * and a pre-boil volume derived from that equipment.
 */
export function newRecipe(partial: Partial<Recipe> = {}): Recipe {
  const now = new Date().toISOString();
  const preset = defaultEquipmentPreset();
  const equipment = presetProfile(preset);
  const spargeType = preset.defaultSpargeType ?? 'batch';
  const boilTimeMin = 60;
  const preBoilGal = volumeBreakdown(DEFAULT_BATCH_SIZE_GAL, boilTimeMin, 0, equipment, {
    ratioQtPerLb: 1.5,
    spargeType,
  }).preBoilGal;

  const recipe: Recipe = {
    id: generateId(),
    name: 'New Recipe',
    author: '',
    styleId: 'american-pale-ale',
    batchSizeGal: DEFAULT_BATCH_SIZE_GAL,
    boilSizeGal: Math.round(preBoilGal * 100) / 100,
    boilTimeMin,
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
      spargeType,
    },
    equipment,
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

  // A partial may carry an explicit undefined id (e.g. JSON imports asking for a fresh one).
  if (!recipe.id) recipe.id = generateId();
  // A partial mash without a sparge method inherits the default rig's.
  if (!recipe.mash.spargeType) recipe.mash = { ...recipe.mash, spargeType };
  return recipe;
}
