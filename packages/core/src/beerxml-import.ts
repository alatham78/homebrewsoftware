import { newRecipe } from './factory.js';
import { BEER_STYLES } from './styles.js';
import { FERMENTABLES, HOPS } from './catalog.js';
import type {
  FermentableAddition,
  FermentableType,
  HopAddition,
  HopForm,
  HopUse,
  MashStep,
  MiscAddition,
  MiscType,
  MiscUse,
  Recipe,
  YeastAddition,
} from './types.js';

/**
 * BeerXML 1.0 import (the format BeerSmith, Brewfather, Brewers Friend, etc.
 * export). Implemented with a small tag scanner rather than a DOM so it runs
 * identically in the browser and in Node tests. BeerXML is metric: kg, liters,
 * °C; we convert to the app's US units.
 */

const KG_TO_LB = 1 / 0.45359237;
const KG_TO_OZ = 1 / 0.028349523;
const L_TO_GAL = 1 / 3.785411784;

function unescapeXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Inner contents of every <TAG>…</TAG> block (case-insensitive, non-greedy). */
function blocks(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}\\s*>([\\s\\S]*?)</${tag}\\s*>`, 'gi');
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[1]!);
  return out;
}

/** First scalar child <TAG>value</TAG> that isn't a nested block. */
function val(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}\\s*>([^<]*)</${tag}\\s*>`, 'i');
  const m = re.exec(block);
  return m ? unescapeXml(m[1]!.trim()) : undefined;
}

function num(block: string, tag: string): number | undefined {
  const v = val(block, tag);
  if (v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

const cToF = (c: number): number => (c * 9) / 5 + 32;

const slug = (name: string): string =>
  `import-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

function parseFermentable(b: string): FermentableAddition {
  const name = val(b, 'NAME') ?? 'Imported fermentable';
  const typeRaw = (val(b, 'TYPE') ?? 'Grain').toLowerCase();
  const type: FermentableType =
    typeRaw === 'sugar' ? 'sugar'
    : typeRaw === 'extract' ? 'extract'
    : typeRaw === 'dry extract' ? 'dry extract'
    : typeRaw === 'adjunct' ? 'adjunct'
    : 'grain';
  const yieldPct = num(b, 'YIELD') ?? 75;
  const catalogMatch = FERMENTABLES.find((f) => f.name.toLowerCase() === name.toLowerCase());
  const recommendMash = val(b, 'RECOMMEND_MASH')?.toUpperCase();
  return {
    fermentableId: catalogMatch?.id ?? slug(name),
    name,
    type,
    potential: 1 + (yieldPct / 100) * 0.046,
    lovibond: num(b, 'COLOR') ?? 2,
    mustMash: recommendMash ? recommendMash === 'TRUE' : type === 'grain' || type === 'adjunct',
    amountLb: (num(b, 'AMOUNT') ?? 0) * KG_TO_LB,
  };
}

function parseHop(b: string): HopAddition {
  const name = val(b, 'NAME') ?? 'Imported hop';
  const useRaw = (val(b, 'USE') ?? 'Boil').toLowerCase();
  const use: HopUse =
    useRaw === 'dry hop' ? 'dry hop'
    : useRaw === 'aroma' ? 'whirlpool'
    : useRaw === 'first wort' ? 'first wort'
    : useRaw === 'mash' ? 'mash'
    : 'boil';
  const formRaw = (val(b, 'FORM') ?? 'Pellet').toLowerCase();
  const rawTime = num(b, 'TIME') ?? 0;
  // Dry hop TIME is minutes per spec; exporters vary. >= a day means minutes.
  const timeMin = use === 'dry hop' && rawTime >= 1440 ? Math.round(rawTime / 1440) : rawTime;
  const catalogMatch = HOPS.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return {
    hopId: catalogMatch?.id ?? slug(name),
    name,
    alpha: num(b, 'ALPHA') ?? 5,
    amountOz: (num(b, 'AMOUNT') ?? 0) * KG_TO_OZ,
    use,
    timeMin,
    form: formRaw === 'leaf' ? 'leaf' : formRaw === 'plug' ? 'plug' : ('pellet' as HopForm),
  };
}

function parseYeast(b: string): YeastAddition {
  const name = val(b, 'NAME') ?? 'Imported yeast';
  return {
    yeastId: slug(name),
    name,
    lab: val(b, 'LABORATORY') ?? '',
    productId: val(b, 'PRODUCT_ID') ?? '',
    form: (val(b, 'FORM') ?? '').toLowerCase() === 'dry' ? 'dry' : 'liquid',
    attenuation: num(b, 'ATTENUATION') ?? 75,
  };
}

function parseMisc(b: string): MiscAddition {
  const typeRaw = (val(b, 'TYPE') ?? 'Other').toLowerCase();
  const type: MiscType =
    typeRaw === 'spice' ? 'spice'
    : typeRaw === 'fining' ? 'fining'
    : typeRaw === 'water agent' ? 'water agent'
    : typeRaw === 'herb' ? 'herb'
    : typeRaw === 'flavor' ? 'flavor'
    : 'other';
  const useRaw = (val(b, 'USE') ?? 'Boil').toLowerCase();
  const use: MiscUse =
    useRaw === 'mash' ? 'mash'
    : useRaw === 'primary' ? 'primary'
    : useRaw === 'secondary' ? 'secondary'
    : useRaw === 'bottling' ? 'packaging'
    : 'boil';
  const isWeight = (val(b, 'AMOUNT_IS_WEIGHT') ?? 'FALSE').toUpperCase() === 'TRUE';
  const amount = num(b, 'AMOUNT') ?? 0;
  const rawTime = num(b, 'TIME') ?? 0;
  const fermenter = use === 'primary' || use === 'secondary';
  return {
    name: val(b, 'NAME') ?? 'Imported misc',
    type,
    use,
    amount: Math.round(amount * 1000 * 100) / 100, // kg→g or L→mL
    unit: isWeight ? 'g' : 'ml',
    timeMin: fermenter && rawTime >= 1440 ? Math.round(rawTime / 1440) : rawTime,
    note: val(b, 'NOTES') || undefined,
  };
}

function parseMashSteps(recipeBlock: string): MashStep[] {
  const mash = blocks(recipeBlock, 'MASH')[0];
  if (!mash) return [];
  return blocks(mash, 'MASH_STEP').map((s) => {
    const typeRaw = (val(s, 'TYPE') ?? 'Infusion').toLowerCase();
    return {
      name: val(s, 'NAME') ?? 'Rest',
      type: typeRaw === 'decoction' ? 'decoction' : typeRaw === 'temperature' ? 'temperature' : 'infusion',
      tempF: Math.round(cToF(num(s, 'STEP_TEMP') ?? 66)),
      timeMin: num(s, 'STEP_TIME') ?? 60,
    };
  });
}

function matchStyleId(recipeBlock: string): string {
  const style = blocks(recipeBlock, 'STYLE')[0];
  const styleName = (style ? val(style, 'NAME') : undefined)?.toLowerCase();
  if (!styleName) return 'freestyle';
  const exact = BEER_STYLES.find((s) => s.name.toLowerCase() === styleName);
  if (exact) return exact.id;
  const partial = BEER_STYLES.find(
    (s) => s.name.toLowerCase().includes(styleName) || styleName.includes(s.name.toLowerCase()),
  );
  return partial?.id ?? 'freestyle';
}

/** Parse a BeerXML document into recipes (one per <RECIPE> block). */
export function parseBeerXml(xml: string): Recipe[] {
  return blocks(xml, 'RECIPE').map((r) => {
    const fermBlock = blocks(r, 'FERMENTABLES')[0] ?? '';
    const hopsBlock = blocks(r, 'HOPS')[0] ?? '';
    const yeastBlock = blocks(blocks(r, 'YEASTS')[0] ?? '', 'YEAST')[0];
    const miscBlock = blocks(r, 'MISCS')[0] ?? '';
    const steps = parseMashSteps(r);
    const longest = steps.reduce<MashStep | undefined>(
      (a, b) => (a === undefined || b.timeMin > a.timeMin ? b : a),
      undefined,
    );

    const base = newRecipe();
    return newRecipe({
      name: val(r, 'NAME') ?? 'Imported recipe',
      author: val(r, 'BREWER') ?? '',
      styleId: matchStyleId(r),
      batchSizeGal: Math.round((num(r, 'BATCH_SIZE') ?? 19) * L_TO_GAL * 100) / 100,
      boilSizeGal: Math.round((num(r, 'BOIL_SIZE') ?? 24.6) * L_TO_GAL * 100) / 100,
      boilTimeMin: num(r, 'BOIL_TIME') ?? 60,
      efficiencyPct: num(r, 'EFFICIENCY') ?? 72,
      fermentables: blocks(fermBlock, 'FERMENTABLE').map(parseFermentable),
      hops: blocks(hopsBlock, 'HOP').map(parseHop),
      yeast: yeastBlock ? parseYeast(yeastBlock) : null,
      miscs: blocks(miscBlock, 'MISC').map(parseMisc),
      mash: {
        ...base.mash,
        ...(steps.length > 0
          ? {
              steps,
              mashTempF: longest?.tempF ?? 152,
              mashTimeMin: steps.reduce((s, x) => s + x.timeMin, 0),
            }
          : {}),
      },
      carbonationVols: num(r, 'CARBONATION') ?? 2.4,
      notes: val(r, 'NOTES') ?? '',
    });
  });
}
