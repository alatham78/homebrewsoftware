import { sgToPlato } from './calc.js';
import type { YeastForm } from './types.js';

/**
 * Yeast pitch rate and starter estimates.
 * Pitch rates follow the White/Zainasheff convention (million cells per mL
 * per °Plato); starter growth uses a simplified Braukaiser-style stir-plate
 * model. These are planning estimates, not lab counts.
 */

export type BeerFerment = 'ale' | 'hybrid' | 'lager';

const PITCH_RATE: Record<BeerFerment, number> = { ale: 0.75, hybrid: 1.0, lager: 1.5 };

const ML_PER_GAL = 3785.411784;

/** Cells needed (billions) to pitch a batch at the standard rate. */
export function cellsNeededBillion(og: number, volumeGal: number, ferment: BeerFerment): number {
  const plato = Math.max(0, sgToPlato(og));
  return (PITCH_RATE[ferment] * volumeGal * ML_PER_GAL * plato) / 1000;
}

/**
 * Viable cells (billions) in `packs` packages of age `ageDays`.
 * Liquid packs (~100 B) lose ≈21.5%/month; dry (~200 B per 11.5 g sachet at
 * ~10 B/g × 20 g? — convention: ~10 B/g, 11.5 g ≈ 100–200 B) keeps far
 * better (~5%/year). Defaults: liquid 100 B/pack, dry 200 B/pack.
 */
export function packCellsBillion(
  packs: number,
  ageDays: number,
  form: YeastForm,
  billionsPerPack?: number,
): number {
  const perPack = billionsPerPack ?? (form === 'dry' ? 200 : 100);
  const viability =
    form === 'dry'
      ? Math.max(0.7, 1 - 0.05 * (ageDays / 365))
      : Math.max(0.1, 1 - 0.215 * (ageDays / 30));
  return packs * perPack * viability;
}

/**
 * Final cell count (billions) after a stir-plate starter of `liters` at
 * ~1.037 (100 g DME per liter). Growth ≈1.4 B per gram of extract, capped
 * by both a 6× multiplication limit and a ~200 B/L culture density ceiling.
 */
export function starterFinalBillion(initialBillion: number, liters: number): number {
  if (liters <= 0 || initialBillion <= 0) return initialBillion;
  const extractGrams = liters * 100;
  const growth = Math.min(1.4 * extractGrams, initialBillion * 5);
  return Math.min(initialBillion + growth, initialBillion + 200 * liters);
}

export interface StarterPlan {
  liters: number;
  finalBillion: number;
  sufficient: boolean;
}

/** Smallest standard starter that reaches the needed count (0 = pitch directly). */
export function recommendStarter(neededBillion: number, availableBillion: number): StarterPlan {
  const sizes = [0, 1, 1.5, 2, 3, 4];
  for (const liters of sizes) {
    const finalBillion = liters === 0 ? availableBillion : starterFinalBillion(availableBillion, liters);
    if (finalBillion >= neededBillion) return { liters, finalBillion, sufficient: true };
  }
  return { liters: 4, finalBillion: starterFinalBillion(availableBillion, 4), sufficient: false };
}
