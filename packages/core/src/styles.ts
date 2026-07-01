import type { BeerStyle } from './types.js';

/** Subset of BJCP 2021 style guidelines used for range gauges in the designer. */
export const BEER_STYLES: BeerStyle[] = [
  { id: 'american-light-lager', name: 'American Light Lager', category: 'Standard American Beer', og: { min: 1.028, max: 1.040 }, fg: { min: 0.998, max: 1.008 }, ibu: { min: 8, max: 12 }, srm: { min: 2, max: 3 }, abv: { min: 2.8, max: 4.2 } },
  { id: 'cream-ale', name: 'Cream Ale', category: 'Standard American Beer', og: { min: 1.042, max: 1.055 }, fg: { min: 1.006, max: 1.012 }, ibu: { min: 8, max: 20 }, srm: { min: 2, max: 5 }, abv: { min: 4.2, max: 5.6 } },
  { id: 'american-wheat', name: 'American Wheat Beer', category: 'Standard American Beer', og: { min: 1.040, max: 1.055 }, fg: { min: 1.008, max: 1.013 }, ibu: { min: 15, max: 30 }, srm: { min: 3, max: 6 }, abv: { min: 4.0, max: 5.5 } },
  { id: 'german-pils', name: 'German Pils', category: 'Pale Bitter European Beer', og: { min: 1.044, max: 1.050 }, fg: { min: 1.008, max: 1.013 }, ibu: { min: 22, max: 40 }, srm: { min: 2, max: 4 }, abv: { min: 4.4, max: 5.2 } },
  { id: 'munich-helles', name: 'Munich Helles', category: 'Pale Malty European Lager', og: { min: 1.044, max: 1.048 }, fg: { min: 1.006, max: 1.012 }, ibu: { min: 16, max: 22 }, srm: { min: 3, max: 5 }, abv: { min: 4.7, max: 5.4 } },
  { id: 'festbier', name: 'Festbier', category: 'Pale Malty European Lager', og: { min: 1.054, max: 1.057 }, fg: { min: 1.010, max: 1.012 }, ibu: { min: 18, max: 25 }, srm: { min: 4, max: 7 }, abv: { min: 5.8, max: 6.3 } },
  { id: 'hefeweizen', name: 'Weissbier (Hefeweizen)', category: 'German Wheat Beer', og: { min: 1.044, max: 1.053 }, fg: { min: 1.008, max: 1.014 }, ibu: { min: 8, max: 15 }, srm: { min: 2, max: 6 }, abv: { min: 4.3, max: 5.6 } },
  { id: 'kolsch', name: 'Kölsch', category: 'Pale Bitter European Beer', og: { min: 1.044, max: 1.050 }, fg: { min: 1.007, max: 1.011 }, ibu: { min: 18, max: 30 }, srm: { min: 3.5, max: 5 }, abv: { min: 4.4, max: 5.2 } },
  { id: 'best-bitter', name: 'Best Bitter', category: 'British Bitter', og: { min: 1.040, max: 1.048 }, fg: { min: 1.008, max: 1.012 }, ibu: { min: 25, max: 40 }, srm: { min: 8, max: 16 }, abv: { min: 3.8, max: 4.6 } },
  { id: 'english-porter', name: 'English Porter', category: 'Brown British Beer', og: { min: 1.040, max: 1.052 }, fg: { min: 1.008, max: 1.014 }, ibu: { min: 18, max: 35 }, srm: { min: 20, max: 30 }, abv: { min: 4.0, max: 5.4 } },
  { id: 'irish-stout', name: 'Irish Stout', category: 'Irish Beer', og: { min: 1.036, max: 1.044 }, fg: { min: 1.007, max: 1.011 }, ibu: { min: 25, max: 45 }, srm: { min: 25, max: 40 }, abv: { min: 3.8, max: 5.0 } },
  { id: 'sweet-stout', name: 'Sweet Stout', category: 'Dark British Beer', og: { min: 1.044, max: 1.060 }, fg: { min: 1.012, max: 1.024 }, ibu: { min: 20, max: 40 }, srm: { min: 30, max: 40 }, abv: { min: 4.0, max: 6.0 } },
  { id: 'american-pale-ale', name: 'American Pale Ale', category: 'Pale American Ale', og: { min: 1.045, max: 1.060 }, fg: { min: 1.010, max: 1.015 }, ibu: { min: 30, max: 50 }, srm: { min: 5, max: 10 }, abv: { min: 4.5, max: 6.2 } },
  { id: 'american-amber', name: 'American Amber Ale', category: 'Amber and Brown American Beer', og: { min: 1.045, max: 1.060 }, fg: { min: 1.010, max: 1.015 }, ibu: { min: 25, max: 40 }, srm: { min: 10, max: 17 }, abv: { min: 4.5, max: 6.2 } },
  { id: 'american-brown', name: 'American Brown Ale', category: 'Amber and Brown American Beer', og: { min: 1.045, max: 1.060 }, fg: { min: 1.010, max: 1.016 }, ibu: { min: 20, max: 30 }, srm: { min: 18, max: 35 }, abv: { min: 4.3, max: 6.2 } },
  { id: 'american-ipa', name: 'American IPA', category: 'IPA', og: { min: 1.056, max: 1.070 }, fg: { min: 1.008, max: 1.014 }, ibu: { min: 40, max: 70 }, srm: { min: 6, max: 14 }, abv: { min: 5.5, max: 7.5 } },
  { id: 'hazy-ipa', name: 'Hazy IPA', category: 'IPA', og: { min: 1.060, max: 1.085 }, fg: { min: 1.010, max: 1.015 }, ibu: { min: 25, max: 60 }, srm: { min: 3, max: 7 }, abv: { min: 6.0, max: 9.0 } },
  { id: 'double-ipa', name: 'Double IPA', category: 'Strong American Ale', og: { min: 1.065, max: 1.085 }, fg: { min: 1.008, max: 1.018 }, ibu: { min: 60, max: 100 }, srm: { min: 6, max: 14 }, abv: { min: 7.5, max: 10.0 } },
  { id: 'american-stout', name: 'American Stout', category: 'American Porter and Stout', og: { min: 1.050, max: 1.075 }, fg: { min: 1.010, max: 1.022 }, ibu: { min: 35, max: 75 }, srm: { min: 30, max: 40 }, abv: { min: 5.0, max: 7.0 } },
  { id: 'imperial-stout', name: 'Imperial Stout', category: 'Strong British Ale', og: { min: 1.075, max: 1.115 }, fg: { min: 1.018, max: 1.030 }, ibu: { min: 50, max: 90 }, srm: { min: 30, max: 40 }, abv: { min: 8.0, max: 12.0 } },
  { id: 'belgian-wit', name: 'Witbier', category: 'Belgian Ale', og: { min: 1.044, max: 1.052 }, fg: { min: 1.008, max: 1.012 }, ibu: { min: 8, max: 20 }, srm: { min: 2, max: 4 }, abv: { min: 4.5, max: 5.5 } },
  { id: 'belgian-tripel', name: 'Belgian Tripel', category: 'Strong Belgian Ale', og: { min: 1.075, max: 1.085 }, fg: { min: 1.008, max: 1.014 }, ibu: { min: 20, max: 40 }, srm: { min: 4.5, max: 7 }, abv: { min: 7.5, max: 9.5 } },
  { id: 'saison', name: 'Saison', category: 'Strong Belgian Ale', og: { min: 1.048, max: 1.065 }, fg: { min: 1.002, max: 1.008 }, ibu: { min: 20, max: 35 }, srm: { min: 5, max: 14 }, abv: { min: 5.0, max: 7.0 } },
  { id: 'gose', name: 'Gose', category: 'Historical Beer', og: { min: 1.036, max: 1.056 }, fg: { min: 1.006, max: 1.010 }, ibu: { min: 5, max: 12 }, srm: { min: 3, max: 4 }, abv: { min: 4.2, max: 4.8 } },
  { id: 'freestyle', name: 'Freestyle / Experimental', category: 'Specialty Beer', og: { min: 1.030, max: 1.120 }, fg: { min: 0.998, max: 1.030 }, ibu: { min: 0, max: 120 }, srm: { min: 1, max: 45 }, abv: { min: 2.5, max: 14.0 } },
];

export function styleById(id: string): BeerStyle | undefined {
  return BEER_STYLES.find((s) => s.id === id);
}
