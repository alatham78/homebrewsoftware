import type { Fermentable, FermentableGroup, Hop, Yeast } from './types.js';

/** Display order for fermentable groups in pickers and the browser. */
export const FERMENTABLE_GROUPS: FermentableGroup[] = [
  'Base malt',
  'Crystal & caramel',
  'Roasted',
  'Specialty',
  'Adjunct',
  'Sugar',
  'Extract',
  'Custom',
];

const base = (id: string, name: string, potential: number, lovibond: number, origin: string): Fermentable =>
  ({ id, name, type: 'grain', potential, lovibond, mustMash: true, group: 'Base malt', origin });
const crystal = (id: string, name: string, potential: number, lovibond: number, origin: string): Fermentable =>
  ({ id, name, type: 'grain', potential, lovibond, mustMash: true, group: 'Crystal & caramel', origin });
const roasted = (id: string, name: string, potential: number, lovibond: number, origin: string): Fermentable =>
  ({ id, name, type: 'grain', potential, lovibond, mustMash: true, group: 'Roasted', origin });
const specialty = (id: string, name: string, potential: number, lovibond: number, origin: string): Fermentable =>
  ({ id, name, type: 'grain', potential, lovibond, mustMash: true, group: 'Specialty', origin });
const adjunct = (id: string, name: string, potential: number, lovibond: number, origin: string): Fermentable =>
  ({ id, name, type: 'adjunct', potential, lovibond, mustMash: true, group: 'Adjunct', origin });
const sugar = (id: string, name: string, potential: number, lovibond: number, origin: string): Fermentable =>
  ({ id, name, type: 'sugar', potential, lovibond, mustMash: false, group: 'Sugar', origin });
const lme = (id: string, name: string, potential: number, lovibond: number, origin: string): Fermentable =>
  ({ id, name, type: 'extract', potential, lovibond, mustMash: false, group: 'Extract', origin });
const dme = (id: string, name: string, potential: number, lovibond: number, origin: string): Fermentable =>
  ({ id, name, type: 'dry extract', potential, lovibond, mustMash: false, group: 'Extract', origin });

/**
 * Built-in fermentable catalog (potential as SG per lb/gal, color in °L).
 * Values are typical published numbers for each product; exact lots vary,
 * and every value can be overridden per-recipe or via a custom ingredient.
 */
export const FERMENTABLES: Fermentable[] = [
  // ---- Base malts ----
  base('pale-2row', '2-Row Pale Malt', 1.037, 1.8, 'US'),
  base('pale-6row', '6-Row Pale Malt', 1.035, 1.8, 'US'),
  base('pale-ale-malt', 'Pale Ale Malt', 1.036, 3.5, 'Briess (US)'),
  base('pilsen-us', 'Pilsen Malt', 1.037, 1.2, 'Briess (US)'),
  base('pale-maris-otter', 'Maris Otter', 1.038, 3.0, 'UK'),
  base('golden-promise', 'Golden Promise', 1.038, 2.4, 'Simpsons (UK)'),
  base('pearl-pale', 'Pearl / Optic Pale Malt', 1.038, 2.2, 'UK'),
  base('mild-ale-malt', 'Mild Ale Malt', 1.037, 4.0, 'UK'),
  base('pilsner-de', 'Pilsner Malt', 1.037, 1.6, 'Weyermann (DE)'),
  base('pilsner-be', 'Pilsner Malt', 1.037, 1.6, 'Dingemans (BE)'),
  base('belgian-pale-ale', 'Pale Ale Malt', 1.038, 3.2, 'Dingemans (BE)'),
  base('vienna', 'Vienna Malt', 1.036, 3.5, 'Weyermann (DE)'),
  base('munich-10', 'Munich Malt I (10L)', 1.035, 10, 'Weyermann (DE)'),
  base('munich-20', 'Munich Malt II (Dark, 20L)', 1.035, 20, 'Weyermann (DE)'),
  base('wheat-malt', 'Wheat Malt', 1.039, 2.0, 'Weyermann (DE)'),
  base('white-wheat', 'White Wheat Malt', 1.040, 2.4, 'US'),
  base('red-wheat', 'Red Wheat Malt', 1.038, 2.3, 'US'),
  base('rye-malt', 'Rye Malt', 1.029, 3.7, 'US'),
  base('spelt-malt', 'Spelt Malt', 1.036, 3.0, 'DE'),
  base('oat-malt', 'Oat Malt', 1.033, 2.0, 'Simpsons (UK)'),

  // ---- Crystal & caramel ----
  crystal('crystal-10', 'Caramel/Crystal 10L', 1.035, 10, 'Briess (US)'),
  crystal('crystal-20', 'Caramel/Crystal 20L', 1.035, 20, 'Briess (US)'),
  crystal('crystal-30', 'Caramel/Crystal 30L', 1.035, 30, 'Briess (US)'),
  crystal('crystal-40', 'Caramel/Crystal 40L', 1.034, 40, 'Briess (US)'),
  crystal('crystal-60', 'Caramel/Crystal 60L', 1.034, 60, 'Briess (US)'),
  crystal('crystal-80', 'Caramel/Crystal 80L', 1.034, 80, 'Briess (US)'),
  crystal('crystal-120', 'Caramel/Crystal 120L', 1.033, 120, 'Briess (US)'),
  crystal('crystal-150', 'Caramel/Crystal 150L', 1.033, 150, 'Briess (US)'),
  crystal('carapils', 'Carapils (Dextrine)', 1.033, 1.5, 'Briess (US)'),
  crystal('carafoam', 'CaraFoam', 1.033, 1.8, 'Weyermann (DE)'),
  crystal('carahell', 'CaraHell', 1.034, 11, 'Weyermann (DE)'),
  crystal('carared', 'CaraRed', 1.034, 20, 'Weyermann (DE)'),
  crystal('caraamber', 'CaraAmber', 1.034, 27, 'Weyermann (DE)'),
  crystal('caramunich-1', 'CaraMunich I', 1.034, 37, 'Weyermann (DE)'),
  crystal('caramunich-2', 'CaraMunich II', 1.034, 46, 'Weyermann (DE)'),
  crystal('caramunich', 'CaraMunich III', 1.034, 57, 'Weyermann (DE)'),
  crystal('caraaroma', 'CaraAroma', 1.034, 130, 'Weyermann (DE)'),
  crystal('carawheat', 'CaraWheat', 1.034, 45, 'Weyermann (DE)'),
  crystal('carabohemian', 'CaraBohemian', 1.034, 75, 'Weyermann (DE)'),
  crystal('crystal-light-uk', 'Crystal Light', 1.034, 45, 'Simpsons (UK)'),
  crystal('crystal-medium-uk', 'Crystal Medium', 1.034, 65, 'Simpsons (UK)'),
  crystal('crystal-dark-uk', 'Crystal Dark', 1.034, 80, 'Simpsons (UK)'),
  crystal('crystal-extra-dark-uk', 'Extra Dark Crystal', 1.033, 120, 'Crisp (UK)'),
  crystal('drc', 'Double Roasted Crystal (DRC)', 1.032, 130, 'Simpsons (UK)'),
  crystal('golden-naked-oats', 'Golden Naked Oats', 1.033, 10, 'Simpsons (UK)'),
  crystal('caravienne', 'CaraVienne (Cara 20)', 1.034, 21, 'Dingemans (BE)'),
  crystal('special-b', 'Special B', 1.030, 115, 'Dingemans (BE)'),

  // ---- Roasted ----
  roasted('chocolate', 'Chocolate Malt', 1.034, 425, 'UK'),
  roasted('chocolate-us', 'Chocolate Malt', 1.034, 350, 'US'),
  roasted('pale-chocolate', 'Pale Chocolate Malt', 1.034, 225, 'UK'),
  roasted('chocolate-wheat', 'Chocolate Wheat', 1.033, 400, 'Weyermann (DE)'),
  roasted('chocolate-rye', 'Chocolate Rye', 1.032, 250, 'Weyermann (DE)'),
  roasted('carafa-1', 'Carafa Special I (dehusked)', 1.032, 340, 'Weyermann (DE)'),
  roasted('carafa-2', 'Carafa Special II (dehusked)', 1.032, 430, 'Weyermann (DE)'),
  roasted('carafa-3', 'Carafa Special III (dehusked)', 1.031, 525, 'Weyermann (DE)'),
  roasted('roasted-barley', 'Roasted Barley', 1.025, 300, 'UK'),
  roasted('black-patent', 'Black Patent Malt', 1.025, 500, 'UK'),
  roasted('midnight-wheat', 'Midnight Wheat', 1.033, 550, 'Briess (US)'),
  roasted('blackprinz', 'Blackprinz (dehusked)', 1.033, 500, 'Briess (US)'),
  roasted('coffee-malt', 'Coffee / Kiln Coffee Malt', 1.034, 150, 'UK'),

  // ---- Specialty ----
  specialty('victory', 'Victory / Biscuit Malt', 1.034, 25, 'Briess (US)'),
  specialty('biscuit-be', 'Biscuit Malt', 1.035, 23, 'Dingemans (BE)'),
  specialty('honey-malt', 'Honey Malt', 1.037, 25, 'Gambrinus (CA)'),
  specialty('melanoidin', 'Melanoidin Malt', 1.037, 27, 'Weyermann (DE)'),
  specialty('aromatic', 'Aromatic Malt', 1.036, 19, 'Dingemans (BE)'),
  specialty('amber-malt', 'Amber Malt', 1.032, 27, 'Crisp (UK)'),
  specialty('brown-malt', 'Brown Malt', 1.032, 65, 'Crisp (UK)'),
  specialty('special-roast', 'Special Roast', 1.033, 50, 'Briess (US)'),
  specialty('rauchmalz', 'Smoked Malt (Beechwood)', 1.037, 3.0, 'Weyermann (DE)'),
  specialty('peated-malt', 'Peated Malt', 1.035, 2.0, 'UK'),
  specialty('acid-malt', 'Acidulated Malt', 1.027, 3.0, 'Weyermann (DE)'),
  specialty('chit-malt', 'Chit Malt', 1.033, 1.5, 'DE'),

  // ---- Adjuncts ----
  adjunct('flaked-oats', 'Flaked Oats', 1.033, 1.0, ''),
  adjunct('flaked-barley', 'Flaked Barley', 1.032, 2.0, ''),
  adjunct('flaked-wheat', 'Flaked Wheat', 1.034, 1.6, ''),
  adjunct('flaked-corn', 'Flaked Corn (Maize)', 1.037, 0.5, ''),
  adjunct('flaked-rice', 'Flaked Rice', 1.038, 0.5, ''),
  adjunct('flaked-rye', 'Flaked Rye', 1.034, 3.0, ''),
  adjunct('torrified-wheat', 'Torrified Wheat', 1.036, 2.0, 'UK'),
  adjunct('raw-wheat', 'Raw (Unmalted) Wheat', 1.036, 2.0, ''),
  adjunct('oat-hulls', 'Oat Hulls (lautering aid)', 1.0, 0, ''),

  // ---- Sugars ----
  sugar('corn-sugar', 'Corn Sugar (Dextrose)', 1.046, 0, ''),
  sugar('table-sugar', 'Table Sugar (Sucrose)', 1.046, 0, ''),
  sugar('brown-sugar-light', 'Brown Sugar (Light)', 1.046, 8, ''),
  sugar('brown-sugar-dark', 'Brown Sugar (Dark)', 1.046, 40, ''),
  sugar('demerara', 'Demerara / Turbinado Sugar', 1.046, 10, ''),
  sugar('invert-2', 'Invert Sugar Syrup No. 2', 1.046, 17, 'UK'),
  sugar('invert-3', 'Invert Sugar Syrup No. 3', 1.046, 65, 'UK'),
  sugar('honey', 'Honey', 1.035, 1.0, ''),
  sugar('maple-syrup', 'Maple Syrup', 1.030, 3.0, ''),
  sugar('molasses', 'Molasses', 1.036, 80, ''),
  sugar('treacle', 'Black Treacle', 1.036, 100, 'UK'),
  sugar('candi-clear', 'Belgian Candi Sugar (Clear)', 1.036, 1, 'BE'),
  sugar('candi-amber', 'Belgian Candi Sugar (Amber)', 1.036, 40, 'BE'),
  sugar('candi-dark', 'Belgian Candi Sugar (Dark)', 1.036, 80, 'BE'),
  sugar('candi-syrup-d45', 'Candi Syrup D-45', 1.032, 45, 'BE'),
  sugar('candi-syrup-d90', 'Candi Syrup D-90', 1.032, 90, 'BE'),
  sugar('candi-syrup-d180', 'Candi Syrup D-180', 1.032, 180, 'BE'),
  sugar('lactose', 'Lactose (Milk Sugar)', 1.041, 0, ''),
  sugar('rice-syrup-solids', 'Rice Syrup Solids', 1.040, 1, ''),
  sugar('agave', 'Agave Nectar', 1.034, 1, ''),

  // ---- Extracts ----
  lme('lme-light', 'Liquid Malt Extract — Light', 1.036, 4, ''),
  lme('lme-gold', 'Liquid Malt Extract — Gold', 1.036, 6, ''),
  lme('lme-amber', 'Liquid Malt Extract — Amber', 1.036, 12, ''),
  lme('lme-dark', 'Liquid Malt Extract — Dark', 1.036, 20, ''),
  lme('lme-wheat', 'Liquid Malt Extract — Wheat', 1.036, 4, ''),
  lme('lme-pilsen', 'Liquid Malt Extract — Pilsen', 1.036, 2, ''),
  lme('lme-munich', 'Liquid Malt Extract — Munich', 1.036, 9, ''),
  dme('dme-light', 'Dry Malt Extract — Light', 1.044, 4, ''),
  dme('dme-gold', 'Dry Malt Extract — Gold', 1.044, 6, ''),
  dme('dme-amber', 'Dry Malt Extract — Amber', 1.044, 12, ''),
  dme('dme-dark', 'Dry Malt Extract — Dark', 1.044, 20, ''),
  dme('dme-wheat', 'Dry Malt Extract — Wheat', 1.044, 3, ''),
  dme('dme-pilsen', 'Dry Malt Extract — Pilsen', 1.044, 2, ''),
];

/** Built-in hop catalog (typical alpha acid %). */
export const HOPS: Hop[] = [
  { id: 'cascade', name: 'Cascade', alpha: 5.5, origin: 'US', profile: 'Grapefruit, floral, citrus' },
  { id: 'centennial', name: 'Centennial', alpha: 10.0, origin: 'US', profile: 'Citrus, floral, resin' },
  { id: 'citra', name: 'Citra', alpha: 12.0, origin: 'US', profile: 'Tropical fruit, citrus, lychee' },
  { id: 'mosaic', name: 'Mosaic', alpha: 12.25, origin: 'US', profile: 'Blueberry, tropical, pine' },
  { id: 'simcoe', name: 'Simcoe', alpha: 13.0, origin: 'US', profile: 'Pine, passionfruit, earthy' },
  { id: 'amarillo', name: 'Amarillo', alpha: 9.2, origin: 'US', profile: 'Orange, peach, floral' },
  { id: 'galaxy', name: 'Galaxy', alpha: 14.0, origin: 'AU', profile: 'Passionfruit, peach, citrus' },
  { id: 'nelson', name: 'Nelson Sauvin', alpha: 12.0, origin: 'NZ', profile: 'White wine, gooseberry' },
  { id: 'el-dorado', name: 'El Dorado', alpha: 15.0, origin: 'US', profile: 'Candy, stone fruit, watermelon' },
  { id: 'chinook', name: 'Chinook', alpha: 13.0, origin: 'US', profile: 'Pine, spice, grapefruit' },
  { id: 'columbus', name: 'Columbus (CTZ)', alpha: 15.0, origin: 'US', profile: 'Dank, resin, black pepper' },
  { id: 'magnum', name: 'Magnum', alpha: 12.0, origin: 'DE', profile: 'Clean bittering' },
  { id: 'warrior', name: 'Warrior', alpha: 15.0, origin: 'US', profile: 'Clean bittering, mild resin' },
  { id: 'willamette', name: 'Willamette', alpha: 4.5, origin: 'US', profile: 'Earthy, floral, mild spice' },
  { id: 'ekg', name: 'East Kent Goldings', alpha: 5.0, origin: 'UK', profile: 'Earthy, honey, gentle spice' },
  { id: 'fuggle', name: 'Fuggle', alpha: 4.5, origin: 'UK', profile: 'Earthy, woody, mild fruit' },
  { id: 'saaz', name: 'Saaz', alpha: 3.5, origin: 'CZ', profile: 'Spicy, herbal, classic noble' },
  { id: 'hallertau', name: 'Hallertau Mittelfrüh', alpha: 4.0, origin: 'DE', profile: 'Floral, herbal, noble' },
  { id: 'tettnang', name: 'Tettnang', alpha: 4.5, origin: 'DE', profile: 'Herbal, spicy, noble' },
  { id: 'motueka', name: 'Motueka', alpha: 7.0, origin: 'NZ', profile: 'Lime, lemon, tropical' },
  { id: 'sabro', name: 'Sabro', alpha: 15.0, origin: 'US', profile: 'Coconut, tangerine, cream' },
  { id: 'strata', name: 'Strata', alpha: 12.5, origin: 'US', profile: 'Strawberry, passionfruit, dank' },
];

/** Built-in yeast catalog. */
export const YEASTS: Yeast[] = [
  { id: 'us-05', name: 'SafAle US-05', lab: 'Fermentis', productId: 'US-05', form: 'dry', attenuation: 78, tempLowF: 59, tempHighF: 75, description: 'Clean American ale workhorse' },
  { id: 's-04', name: 'SafAle S-04', lab: 'Fermentis', productId: 'S-04', form: 'dry', attenuation: 75, tempLowF: 59, tempHighF: 75, description: 'Fast, slightly fruity English ale' },
  { id: 'w-34-70', name: 'SafLager W-34/70', lab: 'Fermentis', productId: 'W-34/70', form: 'dry', attenuation: 82, tempLowF: 48, tempHighF: 72, description: 'Weihenstephan lager strain' },
  { id: 's-23', name: 'SafLager S-23', lab: 'Fermentis', productId: 'S-23', form: 'dry', attenuation: 80, tempLowF: 48, tempHighF: 59, description: 'Fruity continental lager' },
  { id: 'wb-06', name: 'SafBrew WB-06', lab: 'Fermentis', productId: 'WB-06', form: 'dry', attenuation: 86, tempLowF: 59, tempHighF: 75, description: 'Phenolic wheat beer strain' },
  { id: 'be-134', name: 'SafBrew BE-134', lab: 'Fermentis', productId: 'BE-134', form: 'dry', attenuation: 89, tempLowF: 64, tempHighF: 79, description: 'Dry, spicy saison strain' },
  { id: 'verdant', name: 'Verdant IPA', lab: 'Lallemand', productId: 'Verdant', form: 'dry', attenuation: 76, tempLowF: 64, tempHighF: 73, description: 'Soft, hazy-IPA ester profile' },
  { id: 'nottingham', name: 'Nottingham', lab: 'Lallemand', productId: 'Nottingham', form: 'dry', attenuation: 80, tempLowF: 50, tempHighF: 72, description: 'Neutral, high attenuation, flocculant' },
  { id: 'voss-kveik', name: 'Voss Kveik', lab: 'Lallemand', productId: 'Voss', form: 'dry', attenuation: 80, tempLowF: 68, tempHighF: 98, description: 'Orange-citrus, ferments hot and fast' },
  { id: 'wlp001', name: 'California Ale', lab: 'White Labs', productId: 'WLP001', form: 'liquid', attenuation: 76, tempLowF: 64, tempHighF: 73, description: 'Classic clean American strain' },
  { id: 'wlp002', name: 'English Ale', lab: 'White Labs', productId: 'WLP002', form: 'liquid', attenuation: 67, tempLowF: 65, tempHighF: 68, description: 'Malty, sweet finish, very flocculant' },
  { id: 'wlp300', name: 'Hefeweizen Ale', lab: 'White Labs', productId: 'WLP300', form: 'liquid', attenuation: 74, tempLowF: 68, tempHighF: 72, description: 'Banana and clove hefeweizen' },
  { id: 'wy1056', name: 'American Ale', lab: 'Wyeast', productId: '1056', form: 'liquid', attenuation: 75, tempLowF: 60, tempHighF: 72, description: 'The chico strain, clean and versatile' },
  { id: 'wy1318', name: 'London Ale III', lab: 'Wyeast', productId: '1318', form: 'liquid', attenuation: 73, tempLowF: 64, tempHighF: 74, description: 'Soft, fruity, hazy-IPA favorite' },
  { id: 'wy3068', name: 'Weihenstephan Weizen', lab: 'Wyeast', productId: '3068', form: 'liquid', attenuation: 75, tempLowF: 64, tempHighF: 75, description: 'Classic German wheat strain' },
  { id: 'wy3711', name: 'French Saison', lab: 'Wyeast', productId: '3711', form: 'liquid', attenuation: 83, tempLowF: 65, tempHighF: 77, description: 'Reliable, dry, peppery saison' },
];

export const fermentableById = (id: string): Fermentable | undefined =>
  FERMENTABLES.find((f) => f.id === id);
export const hopById = (id: string): Hop | undefined => HOPS.find((h) => h.id === id);
export const yeastById = (id: string): Yeast | undefined => YEASTS.find((y) => y.id === id);
