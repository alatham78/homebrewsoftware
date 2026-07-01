/**
 * Domain model for BrewHaus recipes.
 *
 * Conventions (US homebrew units, converted at the UI layer as needed):
 *  - volumes in US gallons
 *  - fermentable weights in pounds (lb)
 *  - hop weights in ounces (oz)
 *  - temperatures in °F
 *  - gravities as specific gravity (e.g. 1.052)
 */

export type FermentableType = 'grain' | 'sugar' | 'extract' | 'dry extract' | 'adjunct';

export interface Fermentable {
  id: string;
  name: string;
  type: FermentableType;
  /** Extract potential as specific gravity per lb/gal, e.g. 1.037 */
  potential: number;
  /** Color contribution in degrees Lovibond */
  lovibond: number;
  /** Whether the fermentable must be mashed (mash efficiency applies) */
  mustMash: boolean;
}

export interface FermentableAddition {
  fermentableId: string;
  name: string;
  type: FermentableType;
  potential: number;
  lovibond: number;
  mustMash: boolean;
  /** Weight in pounds */
  amountLb: number;
}

export type HopUse = 'boil' | 'whirlpool' | 'dry hop' | 'first wort' | 'mash';
export type HopForm = 'pellet' | 'leaf' | 'plug';

export interface Hop {
  id: string;
  name: string;
  /** Typical alpha acid percentage, e.g. 12.5 */
  alpha: number;
  origin: string;
  profile: string;
}

export interface HopAddition {
  hopId: string;
  name: string;
  /** Alpha acid % for this lot */
  alpha: number;
  /** Weight in ounces */
  amountOz: number;
  use: HopUse;
  /** Boil/steep time in minutes (days for dry hop, informational) */
  timeMin: number;
  form: HopForm;
}

export type YeastForm = 'dry' | 'liquid';

export interface Yeast {
  id: string;
  name: string;
  lab: string;
  productId: string;
  form: YeastForm;
  /** Typical apparent attenuation %, e.g. 78 */
  attenuation: number;
  tempLowF: number;
  tempHighF: number;
  description: string;
}

export interface YeastAddition {
  yeastId: string;
  name: string;
  lab: string;
  productId: string;
  form: YeastForm;
  attenuation: number;
}

export interface MashProfile {
  /** Single infusion mash temperature, °F */
  mashTempF: number;
  /** Mash duration, minutes */
  mashTimeMin: number;
  /** Water-to-grist ratio, quarts per pound */
  ratioQtPerLb: number;
}

export interface StyleRange {
  min: number;
  max: number;
}

export interface BeerStyle {
  id: string;
  name: string;
  category: string;
  og: StyleRange;
  fg: StyleRange;
  ibu: StyleRange;
  srm: StyleRange;
  abv: StyleRange;
}

export interface Recipe {
  id: string;
  name: string;
  author: string;
  styleId: string;
  /** Volume into the fermenter, gallons */
  batchSizeGal: number;
  /** Pre-boil volume, gallons */
  boilSizeGal: number;
  boilTimeMin: number;
  /** Mash extraction efficiency %, e.g. 72 */
  efficiencyPct: number;
  fermentables: FermentableAddition[];
  hops: HopAddition[];
  yeast: YeastAddition | null;
  mash: MashProfile;
  /** Target CO2 volumes for packaging */
  carbonationVols: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeStats {
  og: number;
  fg: number;
  abv: number;
  ibu: number;
  srm: number;
  /** Calories per 12 oz serving */
  calories: number;
  /** Total grain bill weight, lb */
  totalGrainLb: number;
  /** IBU / (OG points) balance ratio */
  buGu: number;
}
