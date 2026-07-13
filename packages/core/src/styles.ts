import type { BeerStyle } from './types.js';

/**
 * BJCP 2021 style guidelines (core beer styles) used for range gauges in
 * the designer and the style browser. Vital ranges follow the guide;
 * descriptions are one-line summaries.
 */

const s = (
  id: string,
  name: string,
  category: string,
  og: [number, number],
  fg: [number, number],
  ibu: [number, number],
  srm: [number, number],
  abv: [number, number],
  description: string,
  examples: string,
): BeerStyle => ({
  id,
  name,
  category,
  og: { min: og[0], max: og[1] },
  fg: { min: fg[0], max: fg[1] },
  ibu: { min: ibu[0], max: ibu[1] },
  srm: { min: srm[0], max: srm[1] },
  abv: { min: abv[0], max: abv[1] },
  description,
  examples,
});

export const BEER_STYLES: BeerStyle[] = [
  // --- Standard American Beer ---
  s('american-light-lager', 'American Light Lager', 'Standard American Beer', [1.028, 1.04], [0.998, 1.008], [8, 12], [2, 3], [2.8, 4.2], 'Highly carbonated, very light-bodied lawnmower lager with minimal flavor.', 'Bud Light, Coors Light, Miller Lite'),
  s('american-lager', 'American Lager', 'Standard American Beer', [1.04, 1.05], [1.004, 1.01], [8, 18], [2, 3.5], [4.2, 5.3], 'Clean, crisp adjunct lager; more body than light lager but still neutral.', 'Budweiser, Coors Banquet, Miller High Life'),
  s('cream-ale', 'Cream Ale', 'Standard American Beer', [1.042, 1.055], [1.006, 1.012], [8, 20], [2, 5], [4.2, 5.6], 'Clean, smooth American ale brewed like a lager; corn adds gentle sweetness.', 'Genesee Cream Ale, Sun King Sunlight'),
  s('american-wheat', 'American Wheat Beer', 'Standard American Beer', [1.04, 1.055], [1.008, 1.013], [15, 30], [3, 6], [4.0, 5.5], 'Refreshing wheat beer with clean American yeast instead of German phenols.', 'Bell’s Oberon, Boulevard Unfiltered Wheat'),
  s('blonde-ale', 'Blonde Ale', 'Standard American Beer', [1.038, 1.054], [1.008, 1.013], [15, 28], [3, 6], [3.8, 5.5], 'Easy-drinking, approachable ale; malty sweetness with restrained hops.', 'Kona Big Wave, Firestone 805'),
  // --- International & Czech Lager ---
  s('international-pale-lager', 'International Pale Lager', 'International Lager', [1.042, 1.05], [1.008, 1.012], [18, 25], [2, 6], [4.5, 6.0], 'Premium all-malt pale lager, a bit more flavor than mass-market versions.', 'Heineken, Stella Artois, Asahi Super Dry'),
  s('czech-premium-pale-lager', 'Czech Premium Pale Lager', 'Czech Lager', [1.044, 1.06], [1.013, 1.017], [30, 45], [3.5, 6], [4.2, 5.8], 'Rich, hoppy Czech pilsner; Saaz spice over bready malt with soft water.', 'Pilsner Urquell, Budvar, Staropramen'),
  // --- Pale Malty/Bitter European Lager ---
  s('munich-helles', 'Munich Helles', 'Pale Malty European Lager', [1.044, 1.048], [1.006, 1.012], [16, 22], [3, 5], [4.7, 5.4], 'Soft, grainy-sweet malt showcase; hops only for balance.', 'Augustiner Lagerbier Hell, Weihenstephaner Original'),
  s('festbier', 'Festbier', 'Pale Malty European Lager', [1.054, 1.057], [1.01, 1.012], [18, 25], [4, 7], [5.8, 6.3], 'Modern Oktoberfest: strong golden lager, smooth malty depth.', 'Paulaner Wiesn, Hacker-Pschorr Festbier'),
  s('maibock', 'Helles Bock (Maibock)', 'Pale Malty European Lager', [1.064, 1.072], [1.011, 1.018], [23, 35], [6, 11], [6.3, 7.4], 'Strong pale bock; rich malt with enough hops to stay lively.', 'Ayinger Maibock, Hofbräu Maibock'),
  s('german-pils', 'German Pils', 'Pale Bitter European Beer', [1.044, 1.05], [1.008, 1.013], [22, 40], [2, 4], [4.4, 5.2], 'Crisp, dry, bitter German lager with floral noble hop character.', 'Jever Pilsener, Bitburger, Rothaus'),
  s('kolsch', 'Kölsch', 'Pale Bitter European Beer', [1.044, 1.05], [1.007, 1.011], [18, 30], [3.5, 5], [4.4, 5.2], 'Delicate, brilliantly clear hybrid ale from Cologne; subtle fruit.', 'Gäffel, Reissdorf, Füchschen'),
  s('dortmunder', 'German Helles Exportbier', 'Pale Bitter European Beer', [1.048, 1.056], [1.01, 1.015], [20, 30], [4, 7], [4.8, 6.0], 'Dortmund export: balance point between Helles malt and Pils bitterness.', 'DAB Original, Dortmunder Kronen'),
  // --- Amber/Dark European Lager & Bock ---
  s('marzen', 'Märzen', 'Amber Malty European Lager', [1.054, 1.06], [1.01, 1.014], [18, 24], [8, 17], [5.6, 6.3], 'Traditional Oktoberfest: elegant toasty Munich malt, dry finish.', 'Ayinger Oktober Fest-Märzen, Paulaner Oktoberfest'),
  s('rauchbier', 'Rauchbier', 'Amber Malty European Lager', [1.05, 1.057], [1.012, 1.016], [20, 30], [12, 22], [4.8, 6.0], 'Bamberg smoked Märzen; balanced beechwood campfire over rich malt.', 'Schlenkerla Märzen, Spezial Rauchbier'),
  s('munich-dunkel', 'Munich Dunkel', 'Dark European Lager', [1.048, 1.056], [1.01, 1.016], [18, 28], [14, 28], [4.5, 5.6], 'Smooth brown lager: deep bready-toasty Munich malt, never roasty-harsh.', 'Ayinger Altbairisch Dunkel, Hofbräu Dunkel'),
  s('schwarzbier', 'Schwarzbier', 'Dark European Lager', [1.046, 1.052], [1.01, 1.016], [20, 35], [17, 30], [4.4, 5.4], 'Black lager: gentle roast and dark chocolate over a crisp, light body.', 'Köstritzer, Mönchshof Schwarzbier'),
  s('dunkles-bock', 'Dunkles Bock', 'Strong European Beer', [1.064, 1.072], [1.013, 1.019], [20, 27], [14, 22], [6.3, 7.2], 'Strong dark lager; rich melanoidin depth with restrained sweetness.', 'Einbecker Ur-Bock Dunkel, Aass Bock'),
  s('doppelbock', 'Doppelbock', 'Strong European Beer', [1.072, 1.112], [1.016, 1.024], [16, 26], [6, 25], [7.0, 10.0], 'Liquid bread: very strong, very malty lager, dark versions add caramel depth.', 'Ayinger Celebrator, Paulaner Salvator'),
  // --- German Wheat ---
  s('hefeweizen', 'Weissbier (Hefeweizen)', 'German Wheat Beer', [1.044, 1.053], [1.008, 1.014], [8, 15], [2, 6], [4.3, 5.6], 'Banana and clove over fluffy wheat; effervescent and refreshing.', 'Weihenstephaner Hefeweissbier, Schneider Weisse'),
  s('dunkles-weissbier', 'Dunkles Weissbier', 'German Wheat Beer', [1.044, 1.056], [1.008, 1.014], [10, 18], [14, 23], [4.3, 5.6], 'Dark wheat: banana-clove yeast plus caramel and bread crust.', 'Franziskaner Hefe-Weisse Dunkel, Erdinger Dunkel'),
  s('weizenbock', 'Weizenbock', 'German Wheat Beer', [1.064, 1.09], [1.015, 1.022], [15, 30], [6, 25], [6.5, 9.0], 'Strong wheat bock; rich dark fruit, bready wheat, warming finish.', 'Schneider Aventinus, Weihenstephaner Vitus'),
  // --- British Bitter & Pale ---
  s('ordinary-bitter', 'Ordinary Bitter', 'British Bitter', [1.03, 1.039], [1.007, 1.011], [25, 35], [8, 14], [3.2, 3.8], 'Low-gravity session pub ale; bitter but balanced, drinkable by the pint.', 'Fuller’s Chiswick, Adnams Southwold'),
  s('best-bitter', 'Best Bitter', 'British Bitter', [1.04, 1.048], [1.008, 1.012], [25, 40], [8, 16], [3.8, 4.6], 'The classic English pub pint: biscuity malt, earthy hops, dry finish.', 'Fuller’s London Pride, Timothy Taylor Landlord'),
  s('strong-bitter', 'Strong Bitter (ESB)', 'British Bitter', [1.048, 1.06], [1.01, 1.016], [30, 50], [8, 18], [4.6, 6.2], 'Bigger, maltier bitter with English hop character throughout.', 'Fuller’s ESB, Shepherd Neame Bishop’s Finger'),
  s('british-golden-ale', 'British Golden Ale', 'Pale Commonwealth Beer', [1.038, 1.053], [1.006, 1.012], [20, 45], [2, 6], [3.8, 5.0], 'Hop-forward pale British session beer, crisp and refreshing.', 'Oakham JHB, Fuller’s Summer Ale'),
  s('english-ipa', 'English IPA', 'Pale Commonwealth Beer', [1.05, 1.075], [1.01, 1.018], [40, 60], [6, 14], [5.0, 7.5], 'The original IPA: earthy, floral English hops with bready malt.', 'Meantime IPA, Worthington White Shield'),
  // --- Brown British Beer ---
  s('dark-mild', 'Dark Mild', 'Brown British Beer', [1.03, 1.038], [1.008, 1.013], [10, 25], [12, 25], [3.0, 3.8], 'Gentle, malty session dark ale; caramel and light chocolate.', 'Moorhouse’s Black Cat, Theakston Traditional Mild'),
  s('british-brown', 'British Brown Ale', 'Brown British Beer', [1.04, 1.052], [1.008, 1.013], [20, 30], [12, 22], [4.2, 5.9], 'Malty, caramelly, nutty brown ale; restrained roast.', 'Newcastle Brown Ale, Samuel Smith Nut Brown'),
  s('english-porter', 'English Porter', 'Brown British Beer', [1.04, 1.052], [1.008, 1.014], [18, 35], [20, 30], [4.0, 5.4], 'Brown-black ale of chocolate and caramel; soft and moderately sweet.', 'Fuller’s London Porter, Samuel Smith Taddy Porter'),
  // --- Scottish & Irish ---
  s('scottish-export', 'Scottish Export', 'Scottish Ale', [1.04, 1.06], [1.01, 1.016], [15, 30], [13, 22], [3.9, 6.0], 'Malt-focused amber Scottish ale; clean, gently caramelly.', 'Belhaven Scottish Ale, McEwan’s Export'),
  s('irish-red', 'Irish Red Ale', 'Irish Beer', [1.036, 1.046], [1.01, 1.014], [18, 28], [9, 14], [3.8, 5.0], 'Easy-drinking amber with toffee and a dry roasted-grain finish.', 'Smithwick’s, Kilkenny Irish Beer'),
  s('irish-stout', 'Irish Stout', 'Irish Beer', [1.036, 1.044], [1.007, 1.011], [25, 45], [25, 40], [3.8, 5.0], 'Dry roasty session stout, coffee-like, silky on nitro.', 'Guinness Draught, Murphy’s, Beamish'),
  s('wee-heavy', 'Wee Heavy', 'Strong British Ale', [1.07, 1.13], [1.018, 1.04], [17, 35], [14, 25], [6.5, 10.0], 'Strong Scotch ale: deep caramel, kettle-caramelized richness.', 'Traquair House Ale, Founders Backwoods Bastard'),
  // --- Dark British ---
  s('sweet-stout', 'Sweet Stout', 'Dark British Beer', [1.044, 1.06], [1.012, 1.024], [20, 40], [30, 40], [4.0, 6.0], 'Milk stout: lactose sweetness rounds dark roast into cream and mocha.', 'Left Hand Milk Stout, Mackeson’s XXX'),
  s('oatmeal-stout', 'Oatmeal Stout', 'Dark British Beer', [1.045, 1.065], [1.01, 1.018], [25, 40], [22, 40], [4.2, 5.9], 'Silky stout with oat smoothness; coffee-and-cream balance.', 'Samuel Smith Oatmeal Stout, Anderson Valley Barney Flats'),
  s('foreign-extra-stout', 'Foreign Extra Stout', 'Dark British Beer', [1.056, 1.075], [1.01, 1.018], [50, 70], [30, 40], [6.3, 8.0], 'Export-strength stout: bigger roast, fruit, and bitterness.', 'Guinness Foreign Extra, Lion Stout'),
  s('english-barleywine', 'English Barleywine', 'Strong British Ale', [1.08, 1.12], [1.018, 1.03], [35, 70], [8, 22], [8.0, 12.0], 'Massive, complex English malt showcase that ages for years.', 'J.W. Lees Harvest Ale, Fuller’s Golden Pride'),
  s('imperial-stout', 'Imperial Stout', 'Strong British Ale', [1.075, 1.115], [1.018, 1.03], [50, 90], [30, 40], [8.0, 12.0], 'Intense black ale: dark fruit, espresso, chocolate, warming alcohol.', 'North Coast Old Rasputin, Bell’s Expedition'),
  // --- Pale American Ale ---
  s('american-pale-ale', 'American Pale Ale', 'Pale American Ale', [1.045, 1.06], [1.01, 1.015], [30, 50], [5, 10], [4.5, 6.2], 'Citrusy American hops over a clean, supportive pale malt base.', 'Sierra Nevada Pale Ale, Deschutes Mirror Pond'),
  // --- Amber & Brown American ---
  s('american-amber', 'American Amber Ale', 'Amber and Brown American Beer', [1.045, 1.06], [1.01, 1.015], [25, 40], [10, 17], [4.5, 6.2], 'Caramel malt depth balanced by citrus American hops.', 'Troegs HopBack Amber, Deschutes Cinder Cone'),
  s('california-common', 'California Common', 'Amber and Brown American Beer', [1.048, 1.054], [1.011, 1.014], [30, 45], [10, 14], [4.5, 5.5], 'Steam beer: lager fermented warm; toasty malt, rustic minty hops.', 'Anchor Steam'),
  s('american-brown', 'American Brown Ale', 'Amber and Brown American Beer', [1.045, 1.06], [1.01, 1.016], [20, 30], [18, 35], [4.3, 6.2], 'Chocolate-nutty brown with an American hop overlay.', 'Bell’s Best Brown, Brooklyn Brown Ale'),
  // --- American Porter & Stout ---
  s('american-porter', 'American Porter', 'American Porter and Stout', [1.05, 1.07], [1.012, 1.018], [25, 50], [22, 40], [4.8, 6.5], 'Robust dark ale: bigger roast and hops than its English parent.', 'Deschutes Black Butte, Founders Porter'),
  s('american-stout', 'American Stout', 'American Porter and Stout', [1.05, 1.075], [1.01, 1.022], [35, 75], [30, 40], [5.0, 7.0], 'Aggressive roast and citrus-pine hops in a strong stout frame.', 'Sierra Nevada Stout, Avery Out of Bounds'),
  // --- IPA family ---
  s('american-ipa', 'American IPA', 'IPA', [1.056, 1.07], [1.008, 1.014], [40, 70], [6, 14], [5.5, 7.5], 'Decidedly hoppy and bitter; citrus/pine/tropical American hops, dry finish.', 'Bell’s Two Hearted, Russian River Blind Pig'),
  s('session-ipa', 'Session IPA', 'IPA', [1.038, 1.05], [1.006, 1.012], [30, 55], [4, 8], [3.8, 5.0], 'All the hop character of an IPA at a session-friendly strength.', 'Founders All Day IPA, Lagunitas DayTime'),
  s('hazy-ipa', 'Hazy IPA', 'IPA', [1.06, 1.085], [1.01, 1.015], [25, 60], [3, 7], [6.0, 9.0], 'Juicy, opaque, soft-bittered IPA bursting with tropical hop saturation.', 'Tree House Julius, Trillium Congress Street'),
  s('black-ipa', 'Black IPA', 'IPA', [1.05, 1.085], [1.01, 1.018], [50, 90], [25, 40], [5.5, 9.0], 'IPA hop intensity with a deceptive dark color and gentle roast.', 'Stone Sublimely Self-Righteous, Firestone Wookey Jack'),
  s('double-ipa', 'Double IPA', 'Strong American Ale', [1.065, 1.085], [1.008, 1.018], [60, 100], [6, 14], [7.5, 10.0], 'Intensely hoppy, strong, yet drinkable; danger in a glass.', 'Russian River Pliny the Elder, Bell’s Hopslam'),
  s('american-strong-ale', 'American Strong Ale', 'Strong American Ale', [1.062, 1.09], [1.014, 1.024], [50, 100], [7, 19], [6.3, 10.0], 'Big malt and big American hops slugging it out.', 'Stone Arrogant Bastard, Bear Republic Red Rocket'),
  s('american-barleywine', 'American Barleywine', 'Strong American Ale', [1.08, 1.12], [1.016, 1.03], [50, 100], [9, 18], [8.0, 12.0], 'Barleywine with the hop dial turned to American excess.', 'Sierra Nevada Bigfoot, Avery Hog Heaven'),
  // --- Belgian & French ---
  s('belgian-wit', 'Witbier', 'Belgian Ale', [1.044, 1.052], [1.008, 1.012], [8, 20], [2, 4], [4.5, 5.5], 'Hazy spiced wheat: coriander and orange peel over soft grain.', 'Hoegaarden, Allagash White, St. Bernardus Wit'),
  s('belgian-pale', 'Belgian Pale Ale', 'Belgian Ale', [1.048, 1.054], [1.01, 1.014], [20, 30], [8, 14], [4.8, 5.5], 'Moderately malty, gently fruity-spicy everyday Belgian ale.', 'De Koninck, Palm Speciale'),
  s('belgian-blond', 'Belgian Blond Ale', 'Strong Belgian Ale', [1.062, 1.075], [1.008, 1.018], [15, 30], [4, 7], [6.0, 7.5], 'Smooth, honeyed golden ale with subtle yeast spice.', 'Leffe Blond, Affligem Blond, La Trappe Blond'),
  s('saison', 'Saison', 'Strong Belgian Ale', [1.048, 1.065], [1.002, 1.008], [20, 35], [5, 14], [5.0, 7.0], 'Dry, effervescent farmhouse ale; pepper, citrus, and hay.', 'Saison Dupont, Boulevard Tank 7'),
  s('belgian-dubbel', 'Belgian Dubbel', 'Trappist Ale', [1.062, 1.075], [1.008, 1.018], [15, 25], [10, 17], [6.0, 7.6], 'Rich raisin-and-plum abbey ale; dry despite deep malt.', 'Westmalle Dubbel, Chimay Red, St. Bernardus Prior 8'),
  s('belgian-tripel', 'Belgian Tripel', 'Trappist Ale', [1.075, 1.085], [1.008, 1.014], [20, 40], [4.5, 7], [7.5, 9.5], 'Strong golden abbey ale: spicy, fruity, deceptively light-bodied.', 'Westmalle Tripel, Chimay White, Karmeliet'),
  s('belgian-golden-strong', 'Belgian Golden Strong Ale', 'Strong Belgian Ale', [1.07, 1.095], [1.005, 1.016], [22, 35], [3, 6], [7.5, 10.5], 'Pale, sparkling, devilishly strong; pear and pepper.', 'Duvel, Delirium Tremens, Piraat'),
  s('belgian-dark-strong', 'Belgian Dark Strong Ale', 'Trappist Ale', [1.075, 1.11], [1.01, 1.024], [20, 35], [12, 22], [8.0, 12.0], 'The quad: dark fruit, caramel, spice, and warming strength.', 'Westvleteren 12, Rochefort 10, St. Bernardus Abt 12'),
  // --- Sour & Historical ---
  s('berliner-weisse', 'Berliner Weisse', 'European Sour Ale', [1.028, 1.032], [1.003, 1.006], [3, 8], [2, 3], [2.8, 3.8], 'Bracingly tart, bone-dry low-alcohol wheat sparkler.', 'Berliner Kindl Weisse, Bayerischer Bahnhof'),
  s('flanders-red', 'Flanders Red Ale', 'European Sour Ale', [1.048, 1.057], [1.002, 1.012], [10, 25], [10, 16], [4.6, 6.5], 'Wine-like sour red aged on oak; cherry, balsamic complexity.', 'Rodenbach Grand Cru, Duchesse de Bourgogne'),
  s('gose', 'Gose', 'Historical Beer', [1.036, 1.056], [1.006, 1.01], [5, 12], [3, 4], [4.2, 4.8], 'Tart wheat beer with coriander and a saline snap.', 'Leipziger Gose, Anderson Valley Gose'),
  // --- Catch-all ---
  s('freestyle', 'Freestyle / Experimental', 'Specialty Beer', [1.03, 1.12], [0.998, 1.03], [0, 120], [1, 45], [2.5, 14.0], 'No rules — wide-open ranges for experimental recipes.', ''),
];

export function styleById(id: string): BeerStyle | undefined {
  return BEER_STYLES.find((st) => st.id === id);
}

/** Unique style categories in display order. */
export const STYLE_CATEGORIES: string[] = [...new Set(BEER_STYLES.map((st) => st.category))];
