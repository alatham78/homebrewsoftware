import { describe, expect, it } from 'vitest';
import {
  BEER_STYLES,
  newRecipe,
  parseBeerXml,
  recipeStats,
  STYLE_CATEGORIES,
  toBeerXml,
} from '../src/index.js';

describe('BeerXML import', () => {
  it('round-trips a recipe through export and import', () => {
    const original = newRecipe({
      name: 'Round & Trip <Ale>',
      author: 'Tester',
      styleId: 'american-ipa',
      batchSizeGal: 5,
      boilSizeGal: 6.5,
      boilTimeMin: 60,
      efficiencyPct: 74,
      fermentables: [
        { fermentableId: 'pale-2row', name: '2-Row Pale Malt', type: 'grain', potential: 1.037, lovibond: 1.8, mustMash: true, amountLb: 12 },
        { fermentableId: 'corn-sugar', name: 'Corn Sugar (Dextrose)', type: 'sugar', potential: 1.046, lovibond: 0, mustMash: false, amountLb: 0.5 },
      ],
      hops: [
        { hopId: 'citra', name: 'Citra', alpha: 12, amountOz: 1, use: 'boil', timeMin: 60, form: 'pellet' },
        { hopId: 'citra', name: 'Citra', alpha: 12, amountOz: 2, use: 'dry hop', timeMin: 4, form: 'pellet' },
      ],
      yeast: { yeastId: 'us-05', name: 'SafAle US-05', lab: 'Fermentis', productId: 'US-05', form: 'dry', attenuation: 78 },
      miscs: [{ name: 'Whirlfloc tablet', type: 'fining', use: 'boil', amount: 1, unit: 'each', timeMin: 15 }],
      mash: {
        mashTempF: 150, mashTimeMin: 75, ratioQtPerLb: 1.5, spargeType: 'batch',
        steps: [
          { name: 'Beta rest', type: 'infusion', tempF: 148, timeMin: 45 },
          { name: 'Alpha rest', type: 'temperature', tempF: 158, timeMin: 30 },
        ],
      },
    });

    const [imported] = parseBeerXml(toBeerXml(original));
    expect(imported).toBeDefined();
    expect(imported!.name).toBe('Round & Trip <Ale>');
    expect(imported!.styleId).toBe('american-ipa');
    expect(imported!.batchSizeGal).toBeCloseTo(5, 1);
    expect(imported!.boilSizeGal).toBeCloseTo(6.5, 1);
    expect(imported!.efficiencyPct).toBe(74);

    expect(imported!.fermentables).toHaveLength(2);
    expect(imported!.fermentables[0]!.amountLb).toBeCloseTo(12, 1);
    expect(imported!.fermentables[0]!.fermentableId).toBe('pale-2row'); // catalog re-match
    expect(imported!.fermentables[0]!.potential).toBeCloseTo(1.037, 3);
    expect(imported!.fermentables[1]!.mustMash).toBe(false);

    expect(imported!.hops).toHaveLength(2);
    expect(imported!.hops[0]!.amountOz).toBeCloseTo(1, 1);
    expect(imported!.hops[1]!.use).toBe('dry hop');
    expect(imported!.hops[1]!.timeMin).toBe(4); // exported as minutes, back to days

    expect(imported!.yeast?.attenuation).toBe(78);
    expect(imported!.yeast?.form).toBe('dry');

    expect(imported!.miscs).toHaveLength(1);
    expect(imported!.miscs![0]!.use).toBe('boil');

    expect(imported!.mash.steps).toHaveLength(2);
    expect(imported!.mash.steps![0]!.tempF).toBeCloseTo(148, 0);
    expect(imported!.mash.steps![1]!.type).toBe('temperature');

    // Stats should agree closely after the round trip
    const a = recipeStats(original);
    const b = recipeStats(imported!);
    expect(b.og).toBeCloseTo(a.og, 3);
    expect(Math.abs(b.ibu - a.ibu)).toBeLessThan(2);
  });

  it('imports a minimal third-party file with entities and unknown style', () => {
    const xml = `<?xml version="1.0"?>
<RECIPES><RECIPE>
  <NAME>Grandma&apos;s &amp; Grandpa&apos;s Bitter</NAME>
  <TYPE>All Grain</TYPE>
  <BATCH_SIZE>20.82</BATCH_SIZE>
  <BOIL_SIZE>26.5</BOIL_SIZE>
  <BOIL_TIME>90</BOIL_TIME>
  <STYLE><NAME>Some Unknown Style</NAME></STYLE>
  <FERMENTABLES><FERMENTABLE>
    <NAME>Maris Otter</NAME><TYPE>Grain</TYPE><AMOUNT>4.0</AMOUNT><YIELD>82.5</YIELD><COLOR>3</COLOR>
  </FERMENTABLE></FERMENTABLES>
  <HOPS><HOP>
    <NAME>Fuggle</NAME><ALPHA>4.5</ALPHA><AMOUNT>0.0567</AMOUNT><USE>Boil</USE><TIME>60</TIME><FORM>Leaf</FORM>
  </HOP></HOPS>
  <YEASTS></YEASTS>
</RECIPE></RECIPES>`;
    const [r] = parseBeerXml(xml);
    expect(r!.name).toBe("Grandma's & Grandpa's Bitter");
    expect(r!.styleId).toBe('freestyle');
    expect(r!.batchSizeGal).toBeCloseTo(5.5, 1);
    expect(r!.boilTimeMin).toBe(90);
    expect(r!.fermentables[0]!.amountLb).toBeCloseTo(8.82, 1);
    expect(r!.fermentables[0]!.potential).toBeCloseTo(1.038, 3);
    expect(r!.fermentables[0]!.fermentableId).toBe('pale-maris-otter'); // name match
    expect(r!.hops[0]!.amountOz).toBeCloseTo(2, 1);
    expect(r!.hops[0]!.form).toBe('leaf');
    expect(r!.yeast).toBeNull();
  });

  it('returns an empty array for non-BeerXML input', () => {
    expect(parseBeerXml('not xml at all')).toHaveLength(0);
  });
});

describe('expanded style guide', () => {
  it('covers 60+ styles across many categories with descriptions', () => {
    expect(BEER_STYLES.length).toBeGreaterThanOrEqual(60);
    expect(STYLE_CATEGORIES.length).toBeGreaterThanOrEqual(20);
    const described = BEER_STYLES.filter((st) => (st.description ?? '').length > 10);
    expect(described.length).toBeGreaterThanOrEqual(60);
  });

  it('keeps legacy style ids', () => {
    const ids = new Set(BEER_STYLES.map((st) => st.id));
    for (const legacy of [
      'american-light-lager', 'cream-ale', 'american-wheat', 'german-pils', 'munich-helles',
      'festbier', 'hefeweizen', 'kolsch', 'best-bitter', 'english-porter', 'irish-stout',
      'sweet-stout', 'american-pale-ale', 'american-amber', 'american-brown', 'american-ipa',
      'hazy-ipa', 'double-ipa', 'american-stout', 'imperial-stout', 'belgian-wit',
      'belgian-tripel', 'saison', 'gose', 'freestyle',
    ]) {
      expect(ids.has(legacy), `missing legacy style ${legacy}`).toBe(true);
    }
  });

  it('has coherent ranges on every style', () => {
    for (const st of BEER_STYLES) {
      expect(st.og.min, st.id).toBeLessThanOrEqual(st.og.max);
      expect(st.fg.min, st.id).toBeLessThanOrEqual(st.fg.max);
      expect(st.abv.min, st.id).toBeLessThan(st.abv.max);
      expect(st.ibu.min, st.id).toBeLessThanOrEqual(st.ibu.max);
    }
  });
});
