import type { FermentableAddition, HopAddition, Recipe, RecipeStats } from './types.js';

/** Convert specific gravity to gravity points (1.052 -> 52). */
export const sgToPoints = (sg: number): number => (sg - 1) * 1000;

/** Convert gravity points to specific gravity (52 -> 1.052). */
export const pointsToSg = (points: number): number => 1 + points / 1000;

/** Convert specific gravity to degrees Plato. */
export function sgToPlato(sg: number): number {
  return -616.868 + 1111.14 * sg - 630.272 * sg * sg + 135.997 * sg * sg * sg;
}

/** Convert degrees Plato to specific gravity. */
export function platoToSg(plato: number): number {
  return 1 + plato / (258.6 - (plato / 258.2) * 227.1);
}

/**
 * Original gravity from the grain bill.
 * Mash efficiency applies only to fermentables that must be mashed;
 * sugars and extracts contribute at 100%.
 */
export function originalGravity(
  fermentables: FermentableAddition[],
  batchSizeGal: number,
  efficiencyPct: number,
): number {
  if (batchSizeGal <= 0) return 1;
  let points = 0;
  for (const f of fermentables) {
    const potentialPoints = sgToPoints(f.potential);
    const eff = f.mustMash ? efficiencyPct / 100 : 1;
    points += (f.amountLb * potentialPoints * eff) / batchSizeGal;
  }
  return pointsToSg(points);
}

/** Final gravity from OG and apparent attenuation %. */
export function finalGravity(og: number, attenuationPct: number): number {
  const points = sgToPoints(og) * (1 - attenuationPct / 100);
  return pointsToSg(points);
}

/** Alcohol by volume % from OG/FG (standard 131.25 approximation). */
export function abv(og: number, fg: number): number {
  return Math.max(0, (og - fg) * 131.25);
}

/** Tinseth boil-time utilization factor. */
function tinsethTimeFactor(boilTimeMin: number): number {
  return (1 - Math.exp(-0.04 * boilTimeMin)) / 4.15;
}

/** Tinseth wort-gravity ("bigness") factor. */
function tinsethBignessFactor(boilGravity: number): number {
  return 1.65 * Math.pow(0.000125, boilGravity - 1);
}

/**
 * IBU contribution of one hop addition (Tinseth), in the finished batch volume.
 * Pellets get a customary +10% utilization bump. Whirlpool additions are
 * modeled at 50% of their nominal boil utilization at 20 min equivalent;
 * dry hops and mash hops contribute no IBUs.
 */
export function ibuForAddition(
  hop: HopAddition,
  batchSizeGal: number,
  boilGravity: number,
): number {
  if (batchSizeGal <= 0 || hop.amountOz <= 0) return 0;
  if (hop.use === 'dry hop' || hop.use === 'mash') return 0;

  let utilization: number;
  if (hop.use === 'whirlpool') {
    utilization = tinsethBignessFactor(boilGravity) * tinsethTimeFactor(Math.min(hop.timeMin, 20)) * 0.5;
  } else {
    // First-wort hops see the full boil; credit them slightly above a full-boil addition.
    const time = hop.use === 'first wort' ? hop.timeMin * 1.1 : hop.timeMin;
    utilization = tinsethBignessFactor(boilGravity) * tinsethTimeFactor(time);
  }
  if (hop.form === 'pellet') utilization *= 1.1;

  const mgPerLAlpha = (hop.alpha / 100) * hop.amountOz * 7490 / batchSizeGal;
  return utilization * mgPerLAlpha;
}

/** Total recipe IBUs (Tinseth). Uses average boil gravity approximation. */
export function totalIbu(
  hops: HopAddition[],
  batchSizeGal: number,
  boilSizeGal: number,
  og: number,
): number {
  // Average gravity of the boil: post-boil gravity scaled to pre-boil volume.
  const boilGravity =
    boilSizeGal > 0 ? pointsToSg((sgToPoints(og) * batchSizeGal) / boilSizeGal) : og;
  return hops.reduce((sum, h) => sum + ibuForAddition(h, batchSizeGal, boilGravity), 0);
}

/** Beer color in SRM using Morey's equation. */
export function srm(fermentables: FermentableAddition[], batchSizeGal: number): number {
  if (batchSizeGal <= 0) return 0;
  const mcu = fermentables.reduce((sum, f) => sum + (f.lovibond * f.amountLb) / batchSizeGal, 0);
  return 1.4922 * Math.pow(mcu, 0.6859);
}

/** Reference beer colors by SRM, used as interpolation stops. */
const SRM_COLOR_STOPS: Array<[number, string]> = [
  [1, '#FFE699'], [2, '#FFD878'], [3, '#FFCA5A'], [4, '#FFBF42'], [5, '#FBB123'],
  [6, '#F8A600'], [7, '#F39C00'], [8, '#EA8F00'], [9, '#E58500'], [10, '#DE7C00'],
  [11, '#D77200'], [12, '#CF6900'], [13, '#CB6200'], [14, '#C35900'], [15, '#BB5100'],
  [16, '#B54C00'], [17, '#B04500'], [18, '#A63E00'], [19, '#A13700'], [20, '#9B3200'],
  [21, '#952D00'], [22, '#8E2900'], [23, '#882300'], [24, '#821E00'], [25, '#7B1A00'],
  [26, '#771900'], [27, '#701400'], [28, '#6A0E00'], [29, '#660D00'], [30, '#5E0B00'],
  [35, '#4C0505'], [40, '#38030B'], [50, '#1A0505'],
];

const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const rgbToHex = (rgb: number[]): string =>
  `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('').toUpperCase()}`;

/**
 * CSS color for an SRM value, interpolated between reference colors so
 * fractional SRM values (and animations across the scale) change smoothly.
 */
export function srmToHex(srmValue: number): string {
  const stops = SRM_COLOR_STOPS;
  const value = Number.isFinite(srmValue) ? srmValue : 0;
  if (value <= stops[0]![0]) return stops[0]![1];
  for (let i = 1; i < stops.length; i++) {
    const [s1, h1] = stops[i]!;
    if (value <= s1) {
      const [s0, h0] = stops[i - 1]!;
      const t = (value - s0) / (s1 - s0);
      const a = hexToRgb(h0);
      const b = hexToRgb(h1);
      return rgbToHex(a.map((c, k) => c + (b[k]! - c) * t));
    }
  }
  return stops[stops.length - 1]![1];
}

/** Common-language name for a beer color. */
export function srmColorName(srmValue: number): string {
  if (srmValue < 2) return 'Pale straw';
  if (srmValue < 3) return 'Straw';
  if (srmValue < 4.5) return 'Pale gold';
  if (srmValue < 6) return 'Deep gold';
  if (srmValue < 9) return 'Pale amber';
  if (srmValue < 12) return 'Medium amber';
  if (srmValue < 15) return 'Deep amber';
  if (srmValue < 18) return 'Amber brown';
  if (srmValue < 21) return 'Brown';
  if (srmValue < 25) return 'Ruby brown';
  if (srmValue < 30) return 'Deep brown';
  if (srmValue < 40) return 'Black';
  return 'Opaque black';
}

/** Convert SRM to EBC (the European color scale). */
export const srmToEbc = (srmValue: number): number => srmValue * 1.97;

/** Calories per 12 oz serving from OG and FG. */
export function calories12oz(og: number, fg: number): number {
  const oe = sgToPlato(og); // original extract, °P
  const ae = sgToPlato(fg); // apparent extract, °P
  const re = 0.1808 * oe + 0.8192 * ae; // real extract, °P
  const abw = (0.79 * abv(og, fg)) / fg;
  const calPer100g = 6.9 * abw + 4.0 * (re - 0.1);
  // 12 oz = 354.88 ml; density = fg g/ml
  return Math.max(0, (calPer100g * fg * 354.88) / 100);
}

/** Bitterness-to-gravity balance ratio (BU:GU). */
export function buGuRatio(ibu: number, og: number): number {
  const points = sgToPoints(og);
  return points > 0 ? ibu / points : 0;
}

/** Compute the full stat block for a recipe. */
export function recipeStats(recipe: Recipe): RecipeStats {
  const og = originalGravity(recipe.fermentables, recipe.batchSizeGal, recipe.efficiencyPct);
  const attenuation = recipe.yeast?.attenuation ?? 75;
  const fg = finalGravity(og, attenuation);
  const ibu = totalIbu(recipe.hops, recipe.batchSizeGal, recipe.boilSizeGal, og);
  return {
    og,
    fg,
    abv: abv(og, fg),
    ibu,
    srm: srm(recipe.fermentables, recipe.batchSizeGal),
    calories: calories12oz(og, fg),
    totalGrainLb: recipe.fermentables.reduce((s, f) => s + f.amountLb, 0),
    buGu: buGuRatio(ibu, og),
  };
}

// ---------------------------------------------------------------------------
// Brew-day utilities
// ---------------------------------------------------------------------------

/**
 * Initial infusion (strike) water temperature, °F.
 * @param ratioQtPerLb water-to-grist ratio in quarts per pound
 * @param grainTempF   temperature of the dry grain
 * @param targetTempF  desired mash temperature
 */
export function strikeWaterTempF(
  ratioQtPerLb: number,
  grainTempF: number,
  targetTempF: number,
): number {
  return (0.2 / ratioQtPerLb) * (targetTempF - grainTempF) + targetTempF;
}

/** Total mash water volume in quarts. */
export function mashWaterQt(grainLb: number, ratioQtPerLb: number): number {
  return grainLb * ratioQtPerLb;
}

/**
 * Corn sugar (dextrose) needed for bottle priming, in grams.
 * @param beerGal      volume of beer being packaged, gallons
 * @param beerTempF    temperature of the beer at packaging (sets residual CO2)
 * @param targetVols   desired CO2 volumes
 */
export function primingSugarGrams(beerGal: number, beerTempF: number, targetVols: number): number {
  const residualVols =
    3.0378 - 0.050062 * beerTempF + 0.00026555 * beerTempF * beerTempF;
  const needed = Math.max(0, targetVols - residualVols);
  // 1 volume CO2 per gallon requires ~15.195 g corn sugar (91% fermentable dextrose)
  return needed * 15.195 * beerGal;
}

/**
 * Correct a hydrometer reading for sample temperature.
 * @param measuredSg   reading taken at sampleTempF
 * @param sampleTempF  sample temperature
 * @param calibTempF   hydrometer calibration temperature (usually 60 or 68 °F)
 */
export function hydrometerCorrection(
  measuredSg: number,
  sampleTempF: number,
  calibTempF = 60,
): number {
  const density = (t: number) =>
    1.00130346 - 1.34722124e-4 * t + 2.04052596e-6 * t * t - 2.32820948e-9 * t * t * t;
  return measuredSg * (density(sampleTempF) / density(calibTempF));
}

/**
 * Gravity after diluting (or boiling down) wort to a new volume.
 * Conservation of extract: points1 * vol1 = points2 * vol2.
 */
export function gravityAtVolume(sg: number, fromGal: number, toGal: number): number {
  if (toGal <= 0) return sg;
  return pointsToSg((sgToPoints(sg) * fromGal) / toGal);
}

// ---------------------------------------------------------------------------
// Unit conversions
// ---------------------------------------------------------------------------

export const lbToKg = (lb: number): number => lb * 0.45359237;
export const kgToLb = (kg: number): number => kg / 0.45359237;
export const ozToG = (oz: number): number => oz * 28.349523;
export const gToOz = (g: number): number => g / 28.349523;
export const galToL = (gal: number): number => gal * 3.785411784;
export const lToGal = (l: number): number => l / 3.785411784;
export const fToC = (f: number): number => ((f - 32) * 5) / 9;
export const cToF = (c: number): number => (c * 9) / 5 + 32;
