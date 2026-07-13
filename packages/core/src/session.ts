import { abv, recipeStats, sgToPoints } from './calc.js';
import { styleById } from './styles.js';
import type { Recipe } from './types.js';

/** Lifecycle of a brew session (a single batch of a recipe). */
export type SessionStatus = 'planned' | 'brew day' | 'fermenting' | 'conditioning' | 'completed';

export const SESSION_STATUSES: SessionStatus[] = [
  'planned',
  'brew day',
  'fermenting',
  'conditioning',
  'completed',
];

export interface GravityReading {
  date: string;
  sg: number;
  tempF?: number;
  note?: string;
}

/** One brewed batch: predictions snapshotted at creation, actuals logged over time. */
export interface BrewSession {
  id: string;
  recipeId: string;
  recipeName: string;
  styleName: string;
  brewDate: string;
  status: SessionStatus;
  predicted: {
    og: number;
    fg: number;
    abv: number;
    ibu: number;
    srm: number;
    efficiencyPct: number;
    batchSizeGal: number;
  };
  measuredPreBoilSg?: number;
  measuredOg?: number;
  measuredFg?: number;
  actualVolumeGal?: number;
  gravityReadings: GravityReading[];
  notes: string;
  /** Indices of completed brew-day checklist steps */
  stepsDone: number[];
  createdAt: string;
  updatedAt: string;
}

function generateId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  return c?.randomUUID ? c.randomUUID() : `s-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** Start a session for a recipe, snapshotting its predicted vitals. */
export function newSession(recipe: Recipe): BrewSession {
  const stats = recipeStats(recipe);
  const now = new Date().toISOString();
  return {
    id: generateId(),
    recipeId: recipe.id,
    recipeName: recipe.name,
    styleName: styleById(recipe.styleId)?.name ?? 'Unknown style',
    brewDate: now.slice(0, 10),
    status: 'planned',
    predicted: {
      og: stats.og,
      fg: stats.fg,
      abv: stats.abv,
      ibu: stats.ibu,
      srm: stats.srm,
      efficiencyPct: recipe.efficiencyPct,
      batchSizeGal: recipe.batchSizeGal,
    },
    gravityReadings: [],
    notes: '',
    stepsDone: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Actual mash efficiency achieved, from the measured OG and volume:
 * points collected vs. the grist's theoretical maximum.
 */
export function actualEfficiencyPct(
  recipe: Recipe,
  measuredOg: number,
  actualVolumeGal: number,
): number {
  const potentialPoints = recipe.fermentables.reduce(
    (s, f) => s + f.amountLb * sgToPoints(f.potential),
    0,
  );
  if (potentialPoints <= 0 || actualVolumeGal <= 0) return 0;
  return (sgToPoints(measuredOg) * actualVolumeGal * 100) / potentialPoints;
}

/** Actual ABV from measured gravities. */
export function actualAbv(measuredOg: number, measuredFg: number): number {
  return abv(measuredOg, measuredFg);
}

/** Apparent attenuation % from measured gravities. */
export function actualAttenuationPct(measuredOg: number, measuredFg: number): number {
  const ogPts = sgToPoints(measuredOg);
  return ogPts > 0 ? ((ogPts - sgToPoints(measuredFg)) / ogPts) * 100 : 0;
}
