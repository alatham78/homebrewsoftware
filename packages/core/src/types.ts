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

export type FermentableGroup =
  | 'Base malt'
  | 'Crystal & caramel'
  | 'Roasted'
  | 'Specialty'
  | 'Adjunct'
  | 'Sugar'
  | 'Extract'
  | 'Custom';

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
  /** Catalog group used to organize pickers and the ingredient browser */
  group?: FermentableGroup;
  /** Maltster / brand / country of origin */
  origin?: string;
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

export type MashStepType = 'infusion' | 'temperature' | 'decoction';

export interface MashStep {
  name: string;
  type: MashStepType;
  tempF: number;
  timeMin: number;
}

export type SpargeType = 'batch' | 'fly' | 'none';

export interface MashProfile {
  /** Primary saccharification temperature, °F (kept in sync with the first step) */
  mashTempF: number;
  /** Primary rest duration, minutes */
  mashTimeMin: number;
  /** Water-to-grist ratio, quarts per pound */
  ratioQtPerLb: number;
  /** Multi-step schedule; absent/empty means single infusion at mashTempF */
  steps?: MashStep[];
  /** Sparge method ('none' = full-volume/BIAB) */
  spargeType?: SpargeType;
}

/** Equipment losses and rates that drive volume/gravity predictions. */
export interface EquipmentProfile {
  name: string;
  /** Evaporation during the boil, gal/hour */
  boilOffGalPerHour: number;
  /** Wort left behind in the kettle (trub + deadspace), gal */
  kettleDeadspaceGal: number;
  /** Water unrecoverable from the mash tun, gal */
  lauterDeadspaceGal: number;
  /** Water absorbed by grain, gal/lb (BIAB with a squeeze runs lower) */
  grainAbsorptionGalPerLb: number;
  /** Beer lost to the fermenter (trub, racking), gal */
  fermenterLossGal: number;
}

export type MiscType = 'spice' | 'fining' | 'water agent' | 'herb' | 'flavor' | 'fruit' | 'other';
export type MiscUse = 'mash' | 'boil' | 'whirlpool' | 'primary' | 'secondary' | 'packaging';
export type MiscUnit = 'g' | 'oz' | 'tsp' | 'tbsp' | 'ml' | 'each' | 'lb';

export interface MiscAddition {
  name: string;
  type: MiscType;
  use: MiscUse;
  amount: number;
  unit: MiscUnit;
  /** Minutes for mash/boil/whirlpool; days for fermenter additions */
  timeMin: number;
  note?: string;
}

/** Brewing water ion concentrations, ppm (mg/L). */
export interface WaterProfile {
  ca: number;
  mg: number;
  na: number;
  so4: number;
  cl: number;
  hco3: number;
}

/** Brewing salt additions in grams, dosed into the total brewing water. */
export interface SaltAdditions {
  /** Gypsum, CaSO4·2H2O */
  gypsum: number;
  /** Calcium chloride, CaCl2·2H2O */
  cacl2: number;
  /** Epsom salt, MgSO4·7H2O */
  epsom: number;
  /** Canning/table salt, NaCl */
  nacl: number;
  /** Baking soda, NaHCO3 */
  nahco3: number;
  /** Chalk, CaCO3 */
  caco3: number;
}

/** Water treatment attached to a recipe. */
export interface RecipeWater {
  /** Display name of the source profile (preset, or a saved lab report) */
  sourceName: string;
  /** Ion profile of the untreated source water */
  source: WaterProfile;
  /** id of the target style profile preset */
  targetId: string;
  salts: SaltAdditions;
  /** mL of 88% lactic acid added to the mash */
  lacticAcidMl: number;
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
  /** Misc additions: spices, finings, nutrients, fruit… (absent on old recipes) */
  miscs?: MiscAddition[];
  mash: MashProfile;
  /** Equipment losses/rates (absent on recipes saved before this feature) */
  equipment?: EquipmentProfile;
  /** Target CO2 volumes for packaging */
  carbonationVols: number;
  /** Water chemistry (absent on recipes saved before the water feature) */
  water?: RecipeWater;
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
