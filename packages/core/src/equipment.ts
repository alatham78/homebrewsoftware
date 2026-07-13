import type { EquipmentProfile, MashProfile, Recipe } from './types.js';

/**
 * Equipment-driven volume predictions. All volumes in US gallons unless
 * noted. The chain, working backward from the fermenter:
 *
 *   post-boil  = batch + kettle deadspace
 *   pre-boil   = post-boil + boil-off × hours
 *   mash water = pre-boil + grain absorption + lauter deadspace
 *   strike     = ratio × grist;  sparge = mash water − strike
 */

export const EQUIPMENT_PRESETS: Array<EquipmentProfile & { id: string }> = [
  {
    id: 'kettle-10',
    name: 'Standard 10 gal kettle + cooler',
    boilOffGalPerHour: 1.0,
    kettleDeadspaceGal: 0.5,
    lauterDeadspaceGal: 0.25,
    grainAbsorptionGalPerLb: 0.12,
    fermenterLossGal: 0.25,
  },
  {
    id: 'biab',
    name: 'BIAB (full volume, squeezed bag)',
    boilOffGalPerHour: 1.0,
    kettleDeadspaceGal: 0.25,
    lauterDeadspaceGal: 0,
    grainAbsorptionGalPerLb: 0.08,
    fermenterLossGal: 0.25,
  },
  {
    id: 'all-in-one',
    name: 'All-in-one electric (Foundry/Grainfather class)',
    boilOffGalPerHour: 0.75,
    kettleDeadspaceGal: 0.5,
    lauterDeadspaceGal: 0,
    grainAbsorptionGalPerLb: 0.1,
    fermenterLossGal: 0.25,
  },
  {
    id: 'three-vessel',
    name: 'Three-vessel 10 gal system',
    boilOffGalPerHour: 1.25,
    kettleDeadspaceGal: 0.75,
    lauterDeadspaceGal: 0.5,
    grainAbsorptionGalPerLb: 0.12,
    fermenterLossGal: 0.5,
  },
];

export function defaultEquipment(): EquipmentProfile {
  const { id: _id, ...profile } = EQUIPMENT_PRESETS[0]!;
  return { ...profile };
}

export interface VolumeBreakdown {
  /** Wort at the end of the boil (before kettle losses), gal */
  postBoilGal: number;
  /** Suggested pre-boil volume for the recipe's boil time, gal */
  preBoilGal: number;
  /** Total brewing water for the day (strike + sparge), gal */
  totalWaterGal: number;
  /** Strike/mash water, quarts */
  strikeQt: number;
  /** Sparge water, gal (0 for full-volume mashes) */
  spargeGal: number;
  /** Expected packaged volume after fermenter losses, gal */
  packagedGal: number;
}

export function volumeBreakdown(
  batchSizeGal: number,
  boilTimeMin: number,
  totalGrainLb: number,
  equipment: EquipmentProfile,
  mash: Pick<MashProfile, 'ratioQtPerLb' | 'spargeType'>,
): VolumeBreakdown {
  const postBoilGal = batchSizeGal + equipment.kettleDeadspaceGal;
  const preBoilGal = postBoilGal + (equipment.boilOffGalPerHour * boilTimeMin) / 60;
  const totalWaterGal =
    preBoilGal + equipment.grainAbsorptionGalPerLb * totalGrainLb + equipment.lauterDeadspaceGal;

  const fullVolume = (mash.spargeType ?? 'batch') === 'none';
  const strikeQt = fullVolume ? totalWaterGal * 4 : mash.ratioQtPerLb * totalGrainLb;
  const spargeGal = fullVolume ? 0 : Math.max(0, totalWaterGal - strikeQt / 4);

  return {
    postBoilGal,
    preBoilGal,
    totalWaterGal,
    strikeQt,
    spargeGal,
    packagedGal: Math.max(0, batchSizeGal - equipment.fermenterLossGal),
  };
}

/** Suggested pre-boil volume for a recipe with an equipment profile. */
export function suggestedBoilSizeGal(recipe: Recipe): number | undefined {
  if (!recipe.equipment) return undefined;
  const grain = recipe.fermentables.reduce((s, f) => s + f.amountLb, 0);
  return volumeBreakdown(
    recipe.batchSizeGal,
    recipe.boilTimeMin,
    grain,
    recipe.equipment,
    recipe.mash,
  ).preBoilGal;
}

/**
 * Water to add for an infusion mash step (Palmer):
 *   Wa = (T2 − T1) × (0.2 × G + Wm) / (Tw − T2)
 * @param currentTempF  mash temperature before the step
 * @param targetTempF   step target temperature
 * @param grainLb       grist weight
 * @param currentWaterQt water already in the mash, quarts
 * @param infusionTempF temperature of the added water (default boiling-ish 210)
 * @returns quarts of infusion water (Infinity-guarded)
 */
export function infusionVolumeQt(
  currentTempF: number,
  targetTempF: number,
  grainLb: number,
  currentWaterQt: number,
  infusionTempF = 210,
): number {
  if (infusionTempF <= targetTempF) return NaN;
  return ((targetTempF - currentTempF) * (0.2 * grainLb + currentWaterQt)) / (infusionTempF - targetTempF);
}

/**
 * Rough decoction size: the thick fraction to pull and boil to hit the next
 * rest. Traditional rule-of-thumb estimate — expect to adjust on brew day.
 */
export function decoctionVolumeQt(
  currentTempF: number,
  targetTempF: number,
  totalMashQt: number,
): number {
  if (targetTempF <= currentTempF) return 0;
  return totalMashQt * ((targetTempF - currentTempF) / (212 - currentTempF)) * 1.35;
}
