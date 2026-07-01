import type { Fermentable, Hop, Yeast } from './types.js';

/** Built-in fermentable catalog (potential as SG per lb/gal, color in °L). */
export const FERMENTABLES: Fermentable[] = [
  { id: 'pale-2row', name: '2-Row Pale Malt (US)', type: 'grain', potential: 1.037, lovibond: 1.8, mustMash: true },
  { id: 'pale-maris-otter', name: 'Maris Otter (UK)', type: 'grain', potential: 1.038, lovibond: 3.0, mustMash: true },
  { id: 'pilsner-de', name: 'Pilsner Malt (German)', type: 'grain', potential: 1.037, lovibond: 1.6, mustMash: true },
  { id: 'vienna', name: 'Vienna Malt', type: 'grain', potential: 1.036, lovibond: 3.5, mustMash: true },
  { id: 'munich-10', name: 'Munich Malt (10L)', type: 'grain', potential: 1.035, lovibond: 10, mustMash: true },
  { id: 'wheat-malt', name: 'Wheat Malt (German)', type: 'grain', potential: 1.039, lovibond: 2.0, mustMash: true },
  { id: 'white-wheat', name: 'White Wheat Malt (US)', type: 'grain', potential: 1.040, lovibond: 2.4, mustMash: true },
  { id: 'flaked-oats', name: 'Flaked Oats', type: 'adjunct', potential: 1.033, lovibond: 1.0, mustMash: true },
  { id: 'flaked-wheat', name: 'Flaked Wheat', type: 'adjunct', potential: 1.034, lovibond: 1.6, mustMash: true },
  { id: 'flaked-corn', name: 'Flaked Corn (Maize)', type: 'adjunct', potential: 1.037, lovibond: 0.5, mustMash: true },
  { id: 'flaked-rice', name: 'Flaked Rice', type: 'adjunct', potential: 1.038, lovibond: 0.5, mustMash: true },
  { id: 'crystal-20', name: 'Caramel/Crystal 20L', type: 'grain', potential: 1.035, lovibond: 20, mustMash: true },
  { id: 'crystal-40', name: 'Caramel/Crystal 40L', type: 'grain', potential: 1.034, lovibond: 40, mustMash: true },
  { id: 'crystal-60', name: 'Caramel/Crystal 60L', type: 'grain', potential: 1.034, lovibond: 60, mustMash: true },
  { id: 'crystal-120', name: 'Caramel/Crystal 120L', type: 'grain', potential: 1.033, lovibond: 120, mustMash: true },
  { id: 'caramunich', name: 'CaraMunich III', type: 'grain', potential: 1.034, lovibond: 57, mustMash: true },
  { id: 'carapils', name: 'Carapils (Dextrine)', type: 'grain', potential: 1.033, lovibond: 1.5, mustMash: true },
  { id: 'victory', name: 'Victory / Biscuit Malt', type: 'grain', potential: 1.034, lovibond: 25, mustMash: true },
  { id: 'honey-malt', name: 'Honey Malt', type: 'grain', potential: 1.037, lovibond: 25, mustMash: true },
  { id: 'chocolate', name: 'Chocolate Malt (UK)', type: 'grain', potential: 1.034, lovibond: 425, mustMash: true },
  { id: 'pale-chocolate', name: 'Pale Chocolate Malt', type: 'grain', potential: 1.034, lovibond: 225, mustMash: true },
  { id: 'roasted-barley', name: 'Roasted Barley', type: 'grain', potential: 1.025, lovibond: 300, mustMash: true },
  { id: 'black-patent', name: 'Black Patent Malt', type: 'grain', potential: 1.025, lovibond: 500, mustMash: true },
  { id: 'midnight-wheat', name: 'Midnight Wheat', type: 'grain', potential: 1.033, lovibond: 550, mustMash: true },
  { id: 'acid-malt', name: 'Acidulated Malt', type: 'grain', potential: 1.027, lovibond: 3.0, mustMash: true },
  { id: 'corn-sugar', name: 'Corn Sugar (Dextrose)', type: 'sugar', potential: 1.046, lovibond: 0, mustMash: false },
  { id: 'table-sugar', name: 'Table Sugar (Sucrose)', type: 'sugar', potential: 1.046, lovibond: 0, mustMash: false },
  { id: 'honey', name: 'Honey', type: 'sugar', potential: 1.035, lovibond: 1.0, mustMash: false },
  { id: 'lactose', name: 'Lactose (Milk Sugar)', type: 'sugar', potential: 1.041, lovibond: 0, mustMash: false },
  { id: 'candi-syrup-d90', name: 'Belgian Candi Syrup D-90', type: 'sugar', potential: 1.032, lovibond: 90, mustMash: false },
  { id: 'lme-light', name: 'Light Liquid Malt Extract', type: 'extract', potential: 1.036, lovibond: 4, mustMash: false },
  { id: 'dme-light', name: 'Light Dry Malt Extract', type: 'dry extract', potential: 1.044, lovibond: 4, mustMash: false },
  { id: 'dme-wheat', name: 'Wheat Dry Malt Extract', type: 'dry extract', potential: 1.044, lovibond: 3, mustMash: false },
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
