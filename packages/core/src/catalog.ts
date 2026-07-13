import type { Fermentable, FermentableGroup, Hop, MiscType, MiscUnit, MiscUse, Yeast } from './types.js';

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

/** Display order for hop origins in pickers and the browser. */
export const HOP_ORIGINS = ['US', 'UK', 'DE', 'CZ', 'SI', 'JP', 'AU', 'NZ'] as const;

/** Built-in hop catalog (typical alpha acid %). */
export const HOPS: Hop[] = [
  // ---- United States ----
  { id: 'ahtanum', name: 'Ahtanum', alpha: 6.0, origin: 'US', profile: 'Grapefruit, floral, earthy' },
  { id: 'amarillo', name: 'Amarillo', alpha: 9.2, origin: 'US', profile: 'Orange, peach, floral' },
  { id: 'apollo', name: 'Apollo', alpha: 17.0, origin: 'US', profile: 'Resin, grapefruit, clean bittering' },
  { id: 'azacca', name: 'Azacca', alpha: 14.5, origin: 'US', profile: 'Mango, papaya, citrus' },
  { id: 'bravo', name: 'Bravo', alpha: 15.5, origin: 'US', profile: 'Orange, vanilla, clean bittering' },
  { id: 'calypso', name: 'Calypso', alpha: 12.0, origin: 'US', profile: 'Apple, pear, stone fruit' },
  { id: 'cascade', name: 'Cascade', alpha: 5.5, origin: 'US', profile: 'Grapefruit, floral, citrus' },
  { id: 'cashmere', name: 'Cashmere', alpha: 7.7, origin: 'US', profile: 'Lemon, lime, melon, smooth' },
  { id: 'centennial', name: 'Centennial', alpha: 10.0, origin: 'US', profile: 'Citrus, floral, resin' },
  { id: 'chinook', name: 'Chinook', alpha: 13.0, origin: 'US', profile: 'Pine, spice, grapefruit' },
  { id: 'citra', name: 'Citra', alpha: 12.0, origin: 'US', profile: 'Tropical fruit, citrus, lychee' },
  { id: 'cluster', name: 'Cluster', alpha: 7.0, origin: 'US', profile: 'Floral, spice, classic American' },
  { id: 'columbus', name: 'Columbus (CTZ)', alpha: 15.0, origin: 'US', profile: 'Dank, resin, black pepper' },
  { id: 'comet', name: 'Comet', alpha: 10.0, origin: 'US', profile: 'Wild grapefruit, grassy' },
  { id: 'crystal', name: 'Crystal', alpha: 4.3, origin: 'US', profile: 'Woody, floral, mild spice' },
  { id: 'el-dorado', name: 'El Dorado', alpha: 15.0, origin: 'US', profile: 'Candy, stone fruit, watermelon' },
  { id: 'horizon', name: 'Horizon', alpha: 12.0, origin: 'US', profile: 'Floral, citrus, clean bittering' },
  { id: 'idaho-7', name: 'Idaho 7', alpha: 13.0, origin: 'US', profile: 'Apricot, tropical, resinous pine' },
  { id: 'lemondrop', name: 'Lemondrop', alpha: 6.0, origin: 'US', profile: 'Lemon, mint, green tea' },
  { id: 'liberty', name: 'Liberty', alpha: 4.0, origin: 'US', profile: 'Noble-like, floral, mild spice' },
  { id: 'loral', name: 'Loral', alpha: 11.5, origin: 'US', profile: 'Floral, dark fruit, peppery' },
  { id: 'mosaic', name: 'Mosaic', alpha: 12.25, origin: 'US', profile: 'Blueberry, tropical, pine' },
  { id: 'mount-hood', name: 'Mount Hood', alpha: 6.0, origin: 'US', profile: 'Herbal, mild spice, noble-like' },
  { id: 'nugget', name: 'Nugget', alpha: 13.5, origin: 'US', profile: 'Herbal, resin, solid bittering' },
  { id: 'palisade', name: 'Palisade', alpha: 7.5, origin: 'US', profile: 'Apricot, grass, floral' },
  { id: 'sabro', name: 'Sabro', alpha: 15.0, origin: 'US', profile: 'Coconut, tangerine, cream' },
  { id: 'simcoe', name: 'Simcoe', alpha: 13.0, origin: 'US', profile: 'Pine, passionfruit, earthy' },
  { id: 'sterling', name: 'Sterling', alpha: 7.5, origin: 'US', profile: 'Herbal, spicy, Saaz-like' },
  { id: 'strata', name: 'Strata', alpha: 12.5, origin: 'US', profile: 'Strawberry, passionfruit, dank' },
  { id: 'summit', name: 'Summit', alpha: 17.5, origin: 'US', profile: 'Tangerine, earthy, pungent' },
  { id: 'talus', name: 'Talus', alpha: 8.5, origin: 'US', profile: 'Grapefruit, rose, pine' },
  { id: 'warrior', name: 'Warrior', alpha: 15.0, origin: 'US', profile: 'Clean bittering, mild resin' },
  { id: 'willamette', name: 'Willamette', alpha: 4.5, origin: 'US', profile: 'Earthy, floral, mild spice' },
  { id: 'zeus', name: 'Zeus', alpha: 15.0, origin: 'US', profile: 'Dank, pungent, black pepper' },
  // ---- United Kingdom ----
  { id: 'bramling-cross', name: 'Bramling Cross', alpha: 6.5, origin: 'UK', profile: 'Blackcurrant, lemon, spice' },
  { id: 'challenger', name: 'Challenger', alpha: 7.5, origin: 'UK', profile: 'Cedar, green tea, sweet fruit' },
  { id: 'ekg', name: 'East Kent Goldings', alpha: 5.0, origin: 'UK', profile: 'Earthy, honey, gentle spice' },
  { id: 'first-gold', name: 'First Gold', alpha: 7.5, origin: 'UK', profile: 'Orange marmalade, spice' },
  { id: 'fuggle', name: 'Fuggle', alpha: 4.5, origin: 'UK', profile: 'Earthy, woody, mild fruit' },
  { id: 'progress', name: 'Progress', alpha: 6.5, origin: 'UK', profile: 'Soft fruit, grassy, honey' },
  { id: 'target', name: 'Target', alpha: 10.5, origin: 'UK', profile: 'Sage, spice, assertive bittering' },
  { id: 'wgv', name: 'Whitbread Golding Variety', alpha: 6.0, origin: 'UK', profile: 'Earthy, fruity, robust' },
  // ---- Germany ----
  { id: 'hallertau', name: 'Hallertau Mittelfrüh', alpha: 4.0, origin: 'DE', profile: 'Floral, herbal, noble' },
  { id: 'hallertau-blanc', name: 'Hallertau Blanc', alpha: 10.5, origin: 'DE', profile: 'White wine, gooseberry, passionfruit' },
  { id: 'herkules', name: 'Herkules', alpha: 14.0, origin: 'DE', profile: 'Hoppy, pine, efficient bittering' },
  { id: 'huell-melon', name: 'Hüll Melon', alpha: 7.2, origin: 'DE', profile: 'Honeydew, strawberry' },
  { id: 'magnum', name: 'Magnum', alpha: 12.0, origin: 'DE', profile: 'Clean bittering' },
  { id: 'mandarina', name: 'Mandarina Bavaria', alpha: 8.5, origin: 'DE', profile: 'Tangerine, sweet citrus' },
  { id: 'northern-brewer', name: 'Northern Brewer', alpha: 8.5, origin: 'DE', profile: 'Mint, pine, rustic' },
  { id: 'perle', name: 'Perle', alpha: 8.0, origin: 'DE', profile: 'Mint, spice, clean' },
  { id: 'polaris', name: 'Polaris', alpha: 20.0, origin: 'DE', profile: 'Glacier mint, high alpha' },
  { id: 'saphir', name: 'Saphir', alpha: 3.8, origin: 'DE', profile: 'Tangerine, noble, soft' },
  { id: 'spalt', name: 'Spalt', alpha: 4.5, origin: 'DE', profile: 'Delicate, spicy, classic noble' },
  { id: 'tettnang', name: 'Tettnang', alpha: 4.5, origin: 'DE', profile: 'Herbal, spicy, noble' },
  // ---- Czechia / Slovenia / Japan ----
  { id: 'saaz', name: 'Saaz', alpha: 3.5, origin: 'CZ', profile: 'Spicy, herbal, classic noble' },
  { id: 'celeia', name: 'Celeia (Styrian Cardinal)', alpha: 4.5, origin: 'SI', profile: 'Floral, citrus, noble-like' },
  { id: 'styrian-goldings', name: 'Styrian Goldings', alpha: 5.5, origin: 'SI', profile: 'White pepper, floral, elegant' },
  { id: 'sorachi-ace', name: 'Sorachi Ace', alpha: 12.0, origin: 'JP', profile: 'Lemon, dill, buttercream' },
  // ---- Australia ----
  { id: 'ella', name: 'Ella', alpha: 15.0, origin: 'AU', profile: 'Anise, floral, grapefruit' },
  { id: 'galaxy', name: 'Galaxy', alpha: 14.0, origin: 'AU', profile: 'Passionfruit, peach, citrus' },
  { id: 'topaz', name: 'Topaz', alpha: 15.5, origin: 'AU', profile: 'Lychee, grassy, resinous' },
  { id: 'vic-secret', name: 'Vic Secret', alpha: 15.5, origin: 'AU', profile: 'Pineapple, pine, light herbal' },
  // ---- New Zealand ----
  { id: 'motueka', name: 'Motueka', alpha: 7.0, origin: 'NZ', profile: 'Lime, lemon, tropical' },
  { id: 'nelson', name: 'Nelson Sauvin', alpha: 12.0, origin: 'NZ', profile: 'White wine, gooseberry' },
  { id: 'pacific-gem', name: 'Pacific Gem', alpha: 14.5, origin: 'NZ', profile: 'Blackberry, oak, floral' },
  { id: 'pacific-jade', name: 'Pacific Jade', alpha: 13.0, origin: 'NZ', profile: 'Black pepper, citrus, soft bittering' },
  { id: 'rakau', name: 'Rakau', alpha: 10.5, origin: 'NZ', profile: 'Apricot, resinous pine' },
  { id: 'riwaka', name: 'Riwaka', alpha: 5.5, origin: 'NZ', profile: 'Grapefruit, lime zest, potent' },
  { id: 'southern-cross', name: 'Southern Cross', alpha: 13.0, origin: 'NZ', profile: 'Lemon zest, pine, spice' },
  { id: 'wai-iti', name: 'Wai-iti', alpha: 3.5, origin: 'NZ', profile: 'Mandarin, lime, stone fruit' },
  { id: 'waimea', name: 'Waimea', alpha: 16.5, origin: 'NZ', profile: 'Tangelo, pine, big bittering' },
  { id: 'wakatu', name: 'Wakatu', alpha: 7.5, origin: 'NZ', profile: 'Vanilla, lime, floral' },
];

/** Display order for yeast labs in pickers and the browser. */
export const YEAST_LABS = ['Fermentis', 'Lallemand', 'White Labs', 'Wyeast', 'Omega', 'Imperial'] as const;

const dry = (id: string, productId: string, name: string, attenuation: number, lo: number, hi: number, lab: string, description: string): Yeast =>
  ({ id, name, lab, productId, form: 'dry', attenuation, tempLowF: lo, tempHighF: hi, description });
const liquid = (id: string, productId: string, name: string, attenuation: number, lo: number, hi: number, lab: string, description: string): Yeast =>
  ({ id, name, lab, productId, form: 'liquid', attenuation, tempLowF: lo, tempHighF: hi, description });

/** Built-in yeast catalog (typical apparent attenuation and temperature ranges). */
export const YEASTS: Yeast[] = [
  // ---- Fermentis (dry) ----
  dry('us-05', 'US-05', 'SafAle US-05', 78, 59, 75, 'Fermentis', 'Clean American ale workhorse'),
  dry('s-04', 'S-04', 'SafAle S-04', 75, 59, 75, 'Fermentis', 'Fast, slightly fruity English ale'),
  dry('s-33', 'S-33', 'SafBrew S-33', 70, 59, 75, 'Fermentis', 'Fruity, full-bodied general ale'),
  dry('t-58', 'T-58', 'SafBrew T-58', 73, 59, 75, 'Fermentis', 'Spicy, peppery Belgian character'),
  dry('be-256', 'BE-256', 'SafBrew BE-256 (Abbaye)', 82, 59, 78, 'Fermentis', 'Fast abbey-style, high gravity tolerant'),
  dry('be-134', 'BE-134', 'SafBrew BE-134', 89, 64, 79, 'Fermentis', 'Dry, spicy saison strain'),
  dry('wb-06', 'WB-06', 'SafBrew WB-06', 86, 59, 75, 'Fermentis', 'Phenolic wheat beer strain'),
  dry('k-97', 'K-97', 'SafAle K-97', 77, 59, 77, 'Fermentis', 'German ale, kölsch-friendly, low esters'),
  dry('w-34-70', 'W-34/70', 'SafLager W-34/70', 82, 48, 72, 'Fermentis', 'Weihenstephan lager strain'),
  dry('s-23', 'S-23', 'SafLager S-23', 80, 48, 59, 'Fermentis', 'Fruity continental lager'),
  dry('s-189', 'S-189', 'SafLager S-189', 81, 48, 72, 'Fermentis', 'Clean, dry Swiss lager (Hürlimann)'),
  // ---- Lallemand (dry) ----
  dry('nottingham', 'Nottingham', 'Nottingham', 80, 50, 72, 'Lallemand', 'Neutral, high attenuation, flocculant'),
  dry('windsor', 'Windsor', 'Windsor', 68, 64, 72, 'Lallemand', 'Full-bodied, estery English ale'),
  dry('london-esb', 'London ESB', 'London ESB', 67, 64, 72, 'Lallemand', 'Malt-forward, classic bitter profile'),
  dry('bry-97', 'BRY-97', 'BRY-97 American West Coast', 77, 59, 72, 'Lallemand', 'Clean American ale, high flocculation'),
  dry('verdant', 'Verdant', 'Verdant IPA', 76, 64, 73, 'Lallemand', 'Soft, hazy-IPA ester profile'),
  dry('new-england', 'New England', 'New England', 77, 59, 72, 'Lallemand', 'Fruity East Coast IPA strain'),
  dry('voss-kveik', 'Voss', 'Voss Kveik', 80, 68, 98, 'Lallemand', 'Orange-citrus, ferments hot and fast'),
  dry('munich-classic', 'Munich Classic', 'Munich Classic', 78, 62, 72, 'Lallemand', 'Banana-forward German wheat'),
  dry('diamond-lager', 'Diamond', 'Diamond Lager', 80, 50, 59, 'Lallemand', 'Clean, crisp all-purpose lager'),
  dry('abbaye', 'Abbaye', 'Abbaye', 85, 63, 77, 'Lallemand', 'Belgian abbey esters and spice'),
  dry('belle-saison', 'Belle Saison', 'Belle Saison', 90, 63, 77, 'Lallemand', 'Very dry, expressive saison'),
  dry('koln', 'Köln', 'Köln Kölsch', 78, 57, 68, 'Lallemand', 'Delicate, lightly fruity kölsch'),
  dry('wit-lal', 'Wit', 'Wit', 74, 63, 77, 'Lallemand', 'Spicy, citrusy witbier strain'),
  dry('philly-sour', 'Philly Sour', 'Philly Sour', 77, 68, 77, 'Lallemand', 'Lactic acid + alcohol in one organism'),
  // ---- White Labs (liquid) ----
  liquid('wlp001', 'WLP001', 'California Ale', 76, 64, 73, 'White Labs', 'Classic clean American strain'),
  liquid('wlp002', 'WLP002', 'English Ale', 67, 65, 68, 'White Labs', 'Malty, sweet finish, very flocculant'),
  liquid('wlp004', 'WLP004', 'Irish Ale', 72, 65, 68, 'White Labs', 'Slight fruit, great in stouts'),
  liquid('wlp005', 'WLP005', 'British Ale', 70, 65, 70, 'White Labs', 'Malty English character'),
  liquid('wlp007', 'WLP007', 'Dry English Ale', 75, 65, 70, 'White Labs', 'High attenuation, clean British'),
  liquid('wlp013', 'WLP013', 'London Ale', 70, 66, 71, 'White Labs', 'Oaky ester, dry finish'),
  liquid('wlp029', 'WLP029', 'German Ale/Kölsch', 75, 65, 69, 'White Labs', 'Crisp kölsch and alt strain'),
  liquid('wlp090', 'WLP090', 'San Diego Super', 79, 65, 68, 'White Labs', 'Fast, clean, compact American'),
  liquid('wlp300', 'WLP300', 'Hefeweizen Ale', 74, 68, 72, 'White Labs', 'Banana and clove hefeweizen'),
  liquid('wlp400', 'WLP400', 'Belgian Wit Ale', 76, 67, 74, 'White Labs', 'Spicy, tart witbier strain'),
  liquid('wlp500', 'WLP500', 'Monastery Ale', 78, 65, 72, 'White Labs', 'Trappist fruit and spice'),
  liquid('wlp530', 'WLP530', 'Abbey Ale', 78, 66, 72, 'White Labs', 'High-gravity Belgian abbey'),
  liquid('wlp550', 'WLP550', 'Belgian Ale', 78, 68, 78, 'White Labs', 'Balanced phenols and fruit'),
  liquid('wlp565', 'WLP565', 'Belgian Saison I', 70, 68, 75, 'White Labs', 'Classic earthy, spicy saison'),
  liquid('wlp800', 'WLP800', 'Pilsner Lager', 74, 50, 55, 'White Labs', 'Classic Czech pilsner strain'),
  liquid('wlp810', 'WLP810', 'San Francisco Lager', 68, 58, 65, 'White Labs', 'California common / steam beer'),
  liquid('wlp830', 'WLP830', 'German Lager', 76, 50, 55, 'White Labs', 'The most popular German lager'),
  liquid('wlp833', 'WLP833', 'German Bock Lager', 73, 48, 55, 'White Labs', 'Malty bock and festbier'),
  // ---- Wyeast (liquid) ----
  liquid('wy1010', '1010', 'American Wheat', 77, 58, 74, 'Wyeast', 'Dry, crisp American wheat'),
  liquid('wy1028', '1028', 'London Ale', 75, 60, 72, 'Wyeast', 'Rich mineral British character'),
  liquid('wy1056', '1056', 'American Ale', 75, 60, 72, 'Wyeast', 'The chico strain, clean and versatile'),
  liquid('wy1084', '1084', 'Irish Ale', 73, 62, 72, 'Wyeast', 'Slight fruit, stout classic'),
  liquid('wy1098', '1098', 'British Ale', 75, 64, 72, 'Wyeast', 'Crisp, dry English ale'),
  liquid('wy1272', '1272', 'American Ale II', 74, 60, 72, 'Wyeast', 'Slightly nutty, tart American'),
  liquid('wy1318', '1318', 'London Ale III', 73, 64, 74, 'Wyeast', 'Soft, fruity, hazy-IPA favorite'),
  liquid('wy1450', '1450', "Denny's Favorite 50", 76, 60, 70, 'Wyeast', 'Silky mouthfeel, accentuates malt'),
  liquid('wy1968', '1968', 'London ESB Ale', 69, 64, 72, 'Wyeast', 'Very flocculant, malty ESB'),
  liquid('wy2124', '2124', 'Bohemian Lager', 75, 48, 58, 'Wyeast', 'Weihenstephan 34/70 family'),
  liquid('wy2206', '2206', 'Bavarian Lager', 75, 46, 58, 'Wyeast', 'Rich Munich malt profile'),
  liquid('wy2278', '2278', 'Czech Pils', 74, 50, 58, 'Wyeast', 'Dry finish, classic pilsner'),
  liquid('wy2308', '2308', 'Munich Lager', 74, 48, 56, 'Wyeast', 'Smooth, soft, well-rounded'),
  liquid('wy2565', '2565', 'Kölsch', 77, 56, 70, 'Wyeast', 'Slightly winey kölsch strain'),
  liquid('wy3068', '3068', 'Weihenstephan Weizen', 75, 64, 75, 'Wyeast', 'Classic German wheat strain'),
  liquid('wy3711', '3711', 'French Saison', 83, 65, 77, 'Wyeast', 'Reliable, dry, peppery saison'),
  liquid('wy3724', '3724', 'Belgian Saison', 85, 70, 95, 'Wyeast', 'Dupont strain, loves heat'),
  liquid('wy3787', '3787', 'Trappist High Gravity', 78, 64, 78, 'Wyeast', 'Westmalle-style abbey strain'),
  liquid('wy3944', '3944', 'Belgian Witbier', 74, 62, 75, 'Wyeast', 'Spicy phenol, honey notes'),
  // ---- Omega / Imperial (liquid) ----
  liquid('oyl-091', 'OYL-091', 'Hornindal Kveik', 78, 72, 98, 'Omega', 'Tropical candy, hot-fermenting kveik'),
  liquid('oyl-071', 'OYL-071', 'Lutra Kveik', 78, 68, 95, 'Omega', 'Ultra-clean pseudo-lager kveik'),
  liquid('a07', 'A07', 'Flagship', 75, 60, 72, 'Imperial', 'Clean American ale, chico family'),
  liquid('a38', 'A38', 'Juice', 74, 64, 74, 'Imperial', 'Fruity London III-style hazy strain'),
];

/** Quick-add templates for common misc additions (fully editable per recipe). */
export const MISC_CATALOG: Array<{ name: string; type: MiscType; use: MiscUse; amount: number; unit: MiscUnit; timeMin: number; note?: string }> = [
  { name: 'Whirlfloc tablet', type: 'fining', use: 'boil', amount: 1, unit: 'each', timeMin: 15 },
  { name: 'Irish moss', type: 'fining', use: 'boil', amount: 1, unit: 'tsp', timeMin: 15 },
  { name: 'Yeast nutrient', type: 'other', use: 'boil', amount: 1, unit: 'tsp', timeMin: 10 },
  { name: 'Gelatin (fining)', type: 'fining', use: 'secondary', amount: 1, unit: 'tsp', timeMin: 2, note: 'Bloom in cold water, add to chilled beer' },
  { name: 'Biofine Clear', type: 'fining', use: 'secondary', amount: 5, unit: 'ml', timeMin: 2 },
  { name: 'Coriander (crushed)', type: 'spice', use: 'boil', amount: 28, unit: 'g', timeMin: 5 },
  { name: 'Bitter orange peel', type: 'spice', use: 'boil', amount: 28, unit: 'g', timeMin: 5 },
  { name: 'Sweet orange peel', type: 'spice', use: 'boil', amount: 14, unit: 'g', timeMin: 5 },
  { name: 'Grains of paradise', type: 'spice', use: 'boil', amount: 5, unit: 'g', timeMin: 5 },
  { name: 'Cinnamon stick', type: 'spice', use: 'boil', amount: 1, unit: 'each', timeMin: 10 },
  { name: 'Vanilla bean (split)', type: 'flavor', use: 'secondary', amount: 2, unit: 'each', timeMin: 7 },
  { name: 'Cacao nibs', type: 'flavor', use: 'secondary', amount: 4, unit: 'oz', timeMin: 7 },
  { name: 'Oak cubes (medium toast)', type: 'flavor', use: 'secondary', amount: 1, unit: 'oz', timeMin: 14 },
  { name: 'Raspberry purée', type: 'fruit', use: 'secondary', amount: 3, unit: 'lb', timeMin: 7 },
  { name: 'Tart cherry purée', type: 'fruit', use: 'secondary', amount: 3, unit: 'lb', timeMin: 7 },
  { name: 'Lactic acid 88%', type: 'water agent', use: 'mash', amount: 4, unit: 'ml', timeMin: 60 },
  { name: 'Campden tablet (metabisulfite)', type: 'water agent', use: 'mash', amount: 0.5, unit: 'each', timeMin: 60, note: 'Dechlorinates up to ~10 gal' },
  { name: 'Sea salt (flaked)', type: 'spice', use: 'boil', amount: 10, unit: 'g', timeMin: 5, note: 'Gose' },
];

export const fermentableById = (id: string): Fermentable | undefined =>
  FERMENTABLES.find((f) => f.id === id);
export const hopById = (id: string): Hop | undefined => HOPS.find((h) => h.id === id);
export const yeastById = (id: string): Yeast | undefined => YEASTS.find((y) => y.id === id);
