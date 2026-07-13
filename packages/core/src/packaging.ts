import { abv, platoToSg, primingSugarGrams, sgToPlato } from './calc.js';

/**
 * Packaging & measurement helpers: keg force carbonation, alternate priming
 * sugars, and refractometer (Brix) conversions.
 */

/**
 * Regulator pressure (PSI) to hold `vols` CO2 at serving temperature.
 * Standard fitted carbonation-chart polynomial.
 */
export function kegPsi(tempF: number, vols: number): number {
  return (
    -16.6999 -
    0.0101059 * tempF +
    0.00116512 * tempF * tempF +
    0.173354 * tempF * vols +
    4.24267 * vols -
    0.0684226 * vols * vols
  );
}

export interface PrimingSugar {
  id: string;
  name: string;
  /** Grams needed relative to corn sugar for the same CO2 */
  factor: number;
}

export const PRIMING_SUGARS: PrimingSugar[] = [
  { id: 'corn', name: 'Corn sugar (dextrose)', factor: 1.0 },
  { id: 'table', name: 'Table sugar (sucrose)', factor: 0.91 },
  { id: 'dme', name: 'Dry malt extract', factor: 1.54 },
  { id: 'honey', name: 'Honey', factor: 1.25 },
];

/** Priming sugar grams for a given sugar type. */
export function primingSugarGramsFor(
  sugarId: string,
  beerGal: number,
  beerTempF: number,
  targetVols: number,
): number {
  const sugar = PRIMING_SUGARS.find((s) => s.id === sugarId) ?? PRIMING_SUGARS[0]!;
  return primingSugarGrams(beerGal, beerTempF, targetVols) * sugar.factor;
}

/** Default wort correction factor for refractometers. */
export const DEFAULT_WCF = 1.04;

/** Convert a refractometer Brix reading of unfermented wort to SG. */
export function brixToSg(brix: number, wcf = DEFAULT_WCF): number {
  return platoToSg(brix / wcf);
}

/** SG to Brix (≈ Plato) for display. */
export function sgToBrix(sg: number): number {
  return sgToPlato(sg);
}

/**
 * FG from refractometer readings during/after fermentation
 * (Sean Terrill's linear correlation, alcohol-corrected).
 */
export function fgFromRefractometer(obBrix: number, fbBrix: number, wcf = DEFAULT_WCF): number {
  const ob = obBrix / wcf;
  const fb = fbBrix / wcf;
  return 1.0 - 0.00085683 * ob + 0.0034941 * fb;
}

/** ABV from original and final refractometer readings. */
export function abvFromRefractometer(obBrix: number, fbBrix: number, wcf = DEFAULT_WCF): number {
  return abv(brixToSg(obBrix, wcf), fgFromRefractometer(obBrix, fbBrix, wcf));
}
