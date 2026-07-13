import type { FermentableAddition, SaltAdditions, WaterProfile } from './types.js';

/**
 * Brewing water chemistry: salt additions, profile targeting, residual
 * alkalinity, sulfate:chloride balance, and a simplified mash pH model.
 *
 * All ion concentrations are ppm (mg/L); salt amounts are grams dosed into
 * the total brewing water; volumes are US gallons.
 */

export const ZERO_WATER: WaterProfile = { ca: 0, mg: 0, na: 0, so4: 0, cl: 0, hco3: 0 };

export const WATER_IONS = ['ca', 'mg', 'na', 'so4', 'cl', 'hco3'] as const;

export const ION_LABELS: Record<keyof WaterProfile, string> = {
  ca: 'Ca²⁺',
  mg: 'Mg²⁺',
  na: 'Na⁺',
  so4: 'SO₄²⁻',
  cl: 'Cl⁻',
  hco3: 'HCO₃⁻',
};

export interface NamedWaterProfile {
  id: string;
  name: string;
  note: string;
  profile: WaterProfile;
}

/** Classic city source-water profiles plus a blank RO baseline. */
export const WATER_SOURCES: NamedWaterProfile[] = [
  { id: 'ro', name: 'Distilled / RO', note: 'Blank slate — build up from zero', profile: { ...ZERO_WATER } },
  { id: 'pilsen', name: 'Pilsen', note: 'Famously soft; delicate lagers', profile: { ca: 7, mg: 2, na: 2, so4: 5, cl: 5, hco3: 15 } },
  { id: 'munich', name: 'Munich', note: 'Moderate carbonate; malty lagers', profile: { ca: 77, mg: 17, na: 4, so4: 18, cl: 8, hco3: 295 } },
  { id: 'vienna', name: 'Vienna', note: 'Hard, carbonate-rich', profile: { ca: 163, mg: 68, na: 8, so4: 216, cl: 39, hco3: 243 } },
  { id: 'london', name: 'London', note: 'Moderately hard; porters and bitters', profile: { ca: 52, mg: 32, na: 86, so4: 32, cl: 34, hco3: 104 } },
  { id: 'dublin', name: 'Dublin', note: 'High alkalinity; dry stouts', profile: { ca: 118, mg: 4, na: 12, so4: 55, cl: 19, hco3: 319 } },
  { id: 'burton', name: 'Burton-on-Trent', note: 'Gypsum-loaded; historic pale ales', profile: { ca: 275, mg: 40, na: 25, so4: 610, cl: 35, hco3: 270 } },
  { id: 'dortmund', name: 'Dortmund', note: 'Hard all around; export lager', profile: { ca: 230, mg: 15, na: 40, so4: 330, cl: 130, hco3: 235 } },
];

/** Style-oriented target profiles (what you're building toward). */
export const WATER_TARGETS: NamedWaterProfile[] = [
  { id: 'hoppy-pale', name: 'Hoppy pale / West Coast IPA', note: 'Sulfate-forward, crisp bitterness', profile: { ca: 110, mg: 5, na: 10, so4: 250, cl: 80, hco3: 40 } },
  { id: 'juicy-neipa', name: 'Juicy / hazy IPA', note: 'Chloride-forward, soft and full', profile: { ca: 110, mg: 10, na: 15, so4: 75, cl: 150, hco3: 40 } },
  { id: 'balanced', name: 'Balanced ale', note: 'Neutral all-rounder', profile: { ca: 80, mg: 5, na: 15, so4: 100, cl: 100, hco3: 40 } },
  { id: 'malty-amber', name: 'Malty amber / brown', note: 'Chloride tilt supports malt', profile: { ca: 60, mg: 10, na: 15, so4: 55, cl: 110, hco3: 80 } },
  { id: 'dark-stout', name: 'Dark beer / stout', note: 'Some alkalinity to balance roast', profile: { ca: 75, mg: 10, na: 30, so4: 70, cl: 100, hco3: 150 } },
  { id: 'crisp-lager', name: 'Crisp lager', note: 'Soft, low mineral', profile: { ca: 50, mg: 5, na: 5, so4: 55, cl: 65, hco3: 20 } },
];

export const waterTargetById = (id: string): NamedWaterProfile | undefined =>
  WATER_TARGETS.find((t) => t.id === id);

export interface SaltInfo {
  name: string;
  formula: string;
  /** ppm contributed per gram of salt per gallon of water */
  ppmPerGramPerGal: Partial<WaterProfile>;
  note?: string;
}

export const SALT_INFO: Record<keyof SaltAdditions, SaltInfo> = {
  gypsum: { name: 'Gypsum', formula: 'CaSO₄·2H₂O', ppmPerGramPerGal: { ca: 61.5, so4: 147.4 } },
  cacl2: { name: 'Calcium chloride', formula: 'CaCl₂·2H₂O', ppmPerGramPerGal: { ca: 72.0, cl: 127.4 } },
  epsom: { name: 'Epsom salt', formula: 'MgSO₄·7H₂O', ppmPerGramPerGal: { mg: 26.0, so4: 103.0 } },
  nacl: { name: 'Canning salt', formula: 'NaCl', ppmPerGramPerGal: { na: 103.9, cl: 160.3 } },
  nahco3: { name: 'Baking soda', formula: 'NaHCO₃', ppmPerGramPerGal: { na: 72.3, hco3: 191.9 } },
  caco3: {
    name: 'Chalk',
    formula: 'CaCO₃',
    ppmPerGramPerGal: { ca: 105.8, hco3: 322.1 },
    note: 'Dissolves poorly — prefer baking soda for alkalinity',
  },
};

export const SALT_KEYS = Object.keys(SALT_INFO) as Array<keyof SaltAdditions>;

export function emptySalts(): SaltAdditions {
  return { gypsum: 0, cacl2: 0, epsom: 0, nacl: 0, nahco3: 0, caco3: 0 };
}

/** Resulting water profile after dosing salts into `waterGal` of source water. */
export function applySalts(
  source: WaterProfile,
  salts: SaltAdditions,
  waterGal: number,
): WaterProfile {
  const result: WaterProfile = { ...source };
  if (waterGal <= 0) return result;
  for (const key of SALT_KEYS) {
    const grams = salts[key];
    if (grams <= 0) continue;
    for (const ion of WATER_IONS) {
      const ppmPerGal = SALT_INFO[key].ppmPerGramPerGal[ion];
      if (ppmPerGal) result[ion] += (ppmPerGal * grams) / waterGal;
    }
  }
  return result;
}

/**
 * Suggest salt additions that move `source` toward `target` using
 * non-negative least squares (cyclic coordinate descent) over the five
 * everyday salts (chalk is excluded — it barely dissolves).
 * Ions already above target can't be removed by salts; the solver simply
 * won't chase them. Amounts are rounded to 0.1 g.
 */
export function suggestSalts(
  source: WaterProfile,
  target: WaterProfile,
  waterGal: number,
): SaltAdditions {
  const salts = emptySalts();
  if (waterGal <= 0) return salts;
  const solveKeys: Array<keyof SaltAdditions> = ['gypsum', 'cacl2', 'epsom', 'nacl', 'nahco3'];

  // Column vectors: ppm contributed per gram of each salt in this volume.
  const columns = solveKeys.map((key) =>
    WATER_IONS.map((ion) => (SALT_INFO[key].ppmPerGramPerGal[ion] ?? 0) / waterGal),
  );
  // Residual starts as the deficit toward the target.
  const residual = WATER_IONS.map((ion) => target[ion] - source[ion]);
  const x = new Array<number>(solveKeys.length).fill(0);

  for (let sweep = 0; sweep < 200; sweep++) {
    for (let j = 0; j < solveKeys.length; j++) {
      const col = columns[j]!;
      let num = 0;
      let den = 0;
      for (let i = 0; i < residual.length; i++) {
        num += col[i]! * residual[i]!;
        den += col[i]! * col[i]!;
      }
      if (den === 0) continue;
      const step = Math.max(0, x[j]! + num / den) - x[j]!;
      if (step === 0) continue;
      x[j] = x[j]! + step;
      for (let i = 0; i < residual.length; i++) residual[i] = residual[i]! - step * col[i]!;
    }
  }

  solveKeys.forEach((key, j) => {
    salts[key] = Math.round(x[j]! * 10) / 10;
  });
  return salts;
}

/** Sulfate:chloride ratio. Returns Infinity when chloride is zero. */
export function sulfateChlorideRatio(p: WaterProfile): number {
  if (p.cl <= 0) return p.so4 > 0 ? Infinity : 1;
  return p.so4 / p.cl;
}

export function sulfateChlorideDescriptor(ratio: number): string {
  if (ratio < 0.5) return 'very malty';
  if (ratio < 1) return 'malty';
  if (ratio <= 2) return 'balanced';
  if (ratio <= 4) return 'hoppy';
  return 'very hoppy';
}

/** Residual alkalinity, ppm as CaCO3 (Kolbach, via Palmer's simplification). */
export function residualAlkalinity(p: WaterProfile): number {
  const alkalinity = p.hco3 * (50 / 61);
  return alkalinity - p.ca / 1.4 - p.mg / 1.7;
}

/** Estimated distilled-water mash pH of a single fermentable. */
function fermentableDiPh(f: FermentableAddition): number {
  if (/acid/i.test(f.name)) return 3.4; // acidulated malt (~2% lactic)
  const l = f.lovibond;
  if (l >= 200) return 4.65; // roasted
  if (l >= 20) return 5.0 - 0.0022 * l; // crystal-ish
  return 5.75 - 0.011 * l; // base malts
}

/** mEq of acid per mL of 88% lactic acid (density 1.209, MW 90.08). */
const LACTIC_MEQ_PER_ML = (1.209 * 0.88 * 1000) / 90.08; // ≈ 11.81

/** Approximate grist buffering capacity, mEq per kg per pH unit. */
const GRIST_BUFFER = 40;

/**
 * Estimated single-infusion mash pH (room-temperature basis).
 * A simplified model: weight-averaged distilled-water grist pH, shifted up
 * by residual alkalinity (scaled by mash thickness) and down by lactic acid.
 * Treat it as guidance to ±0.1 — always confirm with a meter.
 */
export function estimateMashPh(
  fermentables: FermentableAddition[],
  water: WaterProfile,
  ratioQtPerLb: number,
  lacticAcidMl = 0,
): number {
  const mashed = fermentables.filter((f) => f.mustMash && f.amountLb > 0);
  const totalLb = mashed.reduce((s, f) => s + f.amountLb, 0);
  if (totalLb === 0) return 5.75;

  const diPh = mashed.reduce((s, f) => s + fermentableDiPh(f) * f.amountLb, 0) / totalLb;

  const raMeqPerL = residualAlkalinity(water) / 50;
  const litersPerKg = ratioQtPerLb * 2.086; // qt/lb → L/kg
  const waterShift = raMeqPerL * litersPerKg * 0.035;

  const grainKg = totalLb * 0.45359237;
  const acidShift = (lacticAcidMl * LACTIC_MEQ_PER_ML) / (GRIST_BUFFER * grainKg);

  return Math.min(6.2, Math.max(4.5, diPh + waterShift - acidShift));
}

/** mL of 88% lactic acid to move the mash from `currentPh` down to `targetPh`. */
export function lacticAcidForTargetPh(
  currentPh: number,
  targetPh: number,
  totalGrainLb: number,
): number {
  if (currentPh <= targetPh || totalGrainLb <= 0) return 0;
  const grainKg = totalGrainLb * 0.45359237;
  const ml = ((currentPh - targetPh) * GRIST_BUFFER * grainKg) / LACTIC_MEQ_PER_ML;
  return Math.round(ml * 10) / 10;
}

/** Total brewing water: pre-boil volume plus grain absorption (~0.12 gal/lb). */
export function totalBrewingWaterGal(boilSizeGal: number, totalGrainLb: number): number {
  return boilSizeGal + 0.12 * totalGrainLb;
}

export interface WardLabsResult {
  profile: Partial<WaterProfile>;
  ph?: number;
  /** Total alkalinity, ppm as CaCO3 */
  alkalinity?: number;
  /** Total hardness, ppm as CaCO3 */
  hardness?: number;
}

const lastNumber = (line: string): number | undefined => {
  const matches = line.match(/-?\d+(?:\.\d+)?/g);
  if (!matches || matches.length === 0) return undefined;
  return Number(matches[matches.length - 1]);
};

/**
 * Parse a pasted Ward Laboratories household/brewer's water report
 * (e.g. the W-6 panel). Handles Ward's sulfur-basis sulfate line
 * ("Sulfate, SO4-S") by converting to SO4 (×2.996). When no bicarbonate
 * line is present, HCO3 is derived from total alkalinity (×61/50).
 */
export function parseWardLabsReport(text: string): WardLabsResult {
  const result: WardLabsResult = { profile: {} };
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const value = lastNumber(line);
    if (value === undefined || value < 0) continue;

    if (/calcium/i.test(line) && !/carbonate|caco3/i.test(line)) result.profile.ca = value;
    else if (/magnesium/i.test(line)) result.profile.mg = value;
    else if (/sodium/i.test(line)) result.profile.na = value;
    else if (/sulfate|sulphate/i.test(line)) {
      result.profile.so4 = /so4\s*-\s*s\b|so4-s/i.test(line) ? Math.round(value * 2.996 * 10) / 10 : value;
    } else if (/chloride/i.test(line)) result.profile.cl = value;
    else if (/bicarbonate|hco3/i.test(line) && !/alkalinity/i.test(line)) result.profile.hco3 = value;
    else if (/total\s+alkalinity/i.test(line)) result.alkalinity = value;
    else if (/total\s+hardness/i.test(line)) result.hardness = value;
    else if (/^ph\b|\bph\s*$|\bph[^a-z]/i.test(line) && /ph/i.test(line.slice(0, 12))) result.ph = value;
  }
  if (result.profile.hco3 === undefined && result.alkalinity !== undefined) {
    result.profile.hco3 = Math.round(result.alkalinity * (61 / 50) * 10) / 10;
  }
  return result;
}
