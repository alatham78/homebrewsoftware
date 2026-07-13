import { gravityAtVolume, recipeStats, strikeWaterTempF } from './calc.js';
import { infusionVolumeQt, decoctionVolumeQt, defaultEquipment, volumeBreakdown } from './equipment.js';
import { kegPsi, primingSugarGramsFor } from './packaging.js';
import { cellsNeededBillion } from './pitching.js';
import { SALT_INFO, SALT_KEYS } from './water.js';
import type { MashStep, Recipe } from './types.js';

export type BrewPhase = 'Prep' | 'Mash' | 'Boil' | 'Whirlpool' | 'Fermentation' | 'Packaging';

export interface BrewStep {
  phase: BrewPhase;
  title: string;
  detail?: string;
  /** When set, the step gets a countdown timer (minutes) */
  timerMin?: number;
}

const fmtQt = (qt: number) => `${qt.toFixed(1)} qt (${(qt / 4).toFixed(2)} gal)`;

/** Generate an ordered brew-day checklist from a recipe. */
export function generateBrewSteps(recipe: Recipe): BrewStep[] {
  const steps: BrewStep[] = [];
  const stats = recipeStats(recipe);
  const equipment = recipe.equipment ?? defaultEquipment();
  const vb = volumeBreakdown(
    recipe.batchSizeGal,
    recipe.boilTimeMin,
    stats.totalGrainLb,
    equipment,
    recipe.mash,
  );
  const mashSteps: MashStep[] =
    recipe.mash.steps && recipe.mash.steps.length > 0
      ? recipe.mash.steps
      : [{ name: 'Saccharification', type: 'infusion', tempF: recipe.mash.mashTempF, timeMin: recipe.mash.mashTimeMin }];

  // --- Prep ---
  steps.push({
    phase: 'Prep',
    title: `Measure ${vb.totalWaterGal.toFixed(2)} gal of brewing water`,
    detail:
      recipe.mash.spargeType === 'none'
        ? 'Full-volume mash — all water goes in the tun'
        : `${fmtQt(vb.strikeQt)} strike + ${vb.spargeGal.toFixed(2)} gal sparge`,
  });
  const salts = recipe.water?.salts;
  if (salts && SALT_KEYS.some((k) => (salts[k] ?? 0) > 0)) {
    const parts = SALT_KEYS.filter((k) => (salts[k] ?? 0) > 0).map(
      (k) => `${salts[k]} g ${SALT_INFO[k].name.toLowerCase()}`,
    );
    if ((recipe.water?.lacticAcidMl ?? 0) > 0) parts.push(`${recipe.water!.lacticAcidMl} mL lactic 88%`);
    steps.push({ phase: 'Prep', title: 'Treat brewing water', detail: parts.join(', ') });
  }
  steps.push({
    phase: 'Prep',
    title: `Weigh and mill ${stats.totalGrainLb.toFixed(1)} lb of grain`,
    detail: recipe.fermentables
      .filter((f) => f.mustMash)
      .map((f) => `${f.amountLb} lb ${f.name}`)
      .join(' · '),
  });

  // --- Mash ---
  let waterQt = recipe.mash.ratioQtPerLb * stats.totalGrainLb;
  if (recipe.mash.spargeType === 'none') waterQt = vb.totalWaterGal * 4;
  let prevTemp = 70;
  mashSteps.forEach((step, i) => {
    let detail: string;
    if (i === 0) {
      const strikeTemp = strikeWaterTempF(waterQt / Math.max(stats.totalGrainLb, 0.1), 70, step.tempF);
      detail = `Strike with ${fmtQt(waterQt)} at ${strikeTemp.toFixed(0)} °F, hold ${step.tempF} °F`;
    } else if (step.type === 'infusion') {
      const qt = infusionVolumeQt(prevTemp, step.tempF, stats.totalGrainLb, waterQt);
      detail = Number.isFinite(qt) && qt > 0
        ? `Add ${fmtQt(qt)} boiling water to reach ${step.tempF} °F`
        : `Raise to ${step.tempF} °F`;
      if (Number.isFinite(qt) && qt > 0) waterQt += qt;
    } else if (step.type === 'decoction') {
      const pull = decoctionVolumeQt(prevTemp, step.tempF, waterQt + stats.totalGrainLb * 0.32);
      detail = `Pull, boil, and return ~${fmtQt(pull)} of thick mash to reach ${step.tempF} °F`;
    } else {
      detail = `Apply heat to reach ${step.tempF} °F`;
    }
    const mashMiscs = i === 0 ? (recipe.miscs ?? []).filter((m) => m.use === 'mash') : [];
    if (mashMiscs.length > 0) {
      detail += ` · add ${mashMiscs.map((m) => `${m.amount} ${m.unit} ${m.name}`).join(', ')}`;
    }
    steps.push({
      phase: 'Mash',
      title: `${step.name} — ${step.tempF} °F for ${step.timeMin} min`,
      detail,
      timerMin: step.timeMin,
    });
    prevTemp = step.tempF;
  });
  if ((recipe.mash.spargeType ?? 'batch') !== 'none') {
    steps.push({
      phase: 'Mash',
      title: `${recipe.mash.spargeType === 'fly' ? 'Fly' : 'Batch'} sparge with ${vb.spargeGal.toFixed(2)} gal`,
      detail: `Collect ${vb.preBoilGal.toFixed(2)} gal pre-boil · target ${gravityAtVolume(stats.og, recipe.batchSizeGal, vb.preBoilGal).toFixed(3)} SG`,
    });
  } else {
    steps.push({
      phase: 'Mash',
      title: 'Remove grain bag and drain',
      detail: `Collect ~${vb.preBoilGal.toFixed(2)} gal · target ${gravityAtVolume(stats.og, recipe.batchSizeGal, vb.preBoilGal).toFixed(3)} SG`,
    });
  }

  // --- Boil ---
  steps.push({
    phase: 'Boil',
    title: `Boil ${recipe.boilTimeMin} min`,
    detail: 'Additions below are minutes remaining on this timer',
    timerMin: recipe.boilTimeMin,
  });
  const boilAdditions: Array<{ time: number; text: string }> = [];
  for (const h of recipe.hops) {
    if (h.use === 'boil') boilAdditions.push({ time: h.timeMin, text: `${h.amountOz} oz ${h.name} (${h.alpha}% AA)` });
    if (h.use === 'first wort')
      boilAdditions.push({ time: recipe.boilTimeMin, text: `${h.amountOz} oz ${h.name} — first wort, add before the boil` });
  }
  for (const m of (recipe.miscs ?? []).filter((m) => m.use === 'boil'))
    boilAdditions.push({ time: m.timeMin, text: `${m.amount} ${m.unit} ${m.name}` });
  boilAdditions
    .sort((a, b) => b.time - a.time)
    .forEach((a) => steps.push({ phase: 'Boil', title: `@ ${a.time} min: ${a.text}` }));

  // --- Whirlpool ---
  const whirlpoolHops = recipe.hops.filter((h) => h.use === 'whirlpool');
  const whirlpoolMiscs = (recipe.miscs ?? []).filter((m) => m.use === 'whirlpool');
  if (whirlpoolHops.length > 0 || whirlpoolMiscs.length > 0) {
    const maxTime = Math.max(
      ...whirlpoolHops.map((h) => h.timeMin),
      ...whirlpoolMiscs.map((m) => m.timeMin),
      0,
    );
    steps.push({
      phase: 'Whirlpool',
      title: `Whirlpool / hop stand ${maxTime} min`,
      detail: [...whirlpoolHops.map((h) => `${h.amountOz} oz ${h.name}`), ...whirlpoolMiscs.map((m) => `${m.amount} ${m.unit} ${m.name}`)].join(' · '),
      timerMin: maxTime,
    });
  }

  // --- Fermentation ---
  steps.push({
    phase: 'Fermentation',
    title: `Chill and transfer ${recipe.batchSizeGal} gal to the fermenter`,
    detail: `Target OG ${stats.og.toFixed(3)} — take a sample and record it`,
  });
  if (recipe.yeast) {
    steps.push({
      phase: 'Fermentation',
      title: `Pitch ${recipe.yeast.name}`,
      detail: `~${Math.round(cellsNeededBillion(stats.og, recipe.batchSizeGal, 'ale'))} B cells (ale rate) · aerate well`,
    });
  }
  for (const h of recipe.hops.filter((h) => h.use === 'dry hop'))
    steps.push({ phase: 'Fermentation', title: `Dry hop day ${h.timeMin}: ${h.amountOz} oz ${h.name}` });
  for (const m of (recipe.miscs ?? []).filter((m) => m.use === 'primary' || m.use === 'secondary'))
    steps.push({ phase: 'Fermentation', title: `${m.use} day ${m.timeMin}: ${m.amount} ${m.unit} ${m.name}` });

  // --- Packaging ---
  steps.push({
    phase: 'Packaging',
    title: `Carbonate to ${recipe.carbonationVols} vols`,
    detail: `Bottles: ${primingSugarGramsFor('corn', recipe.batchSizeGal, 68, recipe.carbonationVols).toFixed(0)} g corn sugar (68 °F beer) · Keg: ${kegPsi(38, recipe.carbonationVols).toFixed(1)} PSI at 38 °F`,
  });
  for (const m of (recipe.miscs ?? []).filter((m) => m.use === 'packaging'))
    steps.push({ phase: 'Packaging', title: `Add ${m.amount} ${m.unit} ${m.name}` });

  return steps;
}
