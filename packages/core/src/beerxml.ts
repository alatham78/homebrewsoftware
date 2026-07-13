import { recipeStats } from './calc.js';
import { styleById } from './styles.js';
import type { HopUse, MiscAddition, MiscUnit, Recipe } from './types.js';

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const LB_TO_KG = 0.45359237;
const OZ_TO_KG = 0.028349523;
const GAL_TO_L = 3.785411784;

const MISC_UNIT_TO_KG: Partial<Record<MiscUnit, number>> = {
  g: 0.001,
  oz: 0.028349523,
  lb: 0.45359237,
};

function miscXml(m: MiscAddition): string {
  const weightKg = MISC_UNIT_TO_KG[m.unit];
  const useXml =
    m.use === 'mash' ? 'Mash'
    : m.use === 'boil' ? 'Boil'
    : m.use === 'whirlpool' ? 'Boil'
    : m.use === 'primary' ? 'Primary'
    : m.use === 'secondary' ? 'Secondary'
    : 'Bottling';
  const typeXml =
    m.type === 'spice' ? 'Spice'
    : m.type === 'fining' ? 'Fining'
    : m.type === 'water agent' ? 'Water Agent'
    : m.type === 'herb' ? 'Herb'
    : m.type === 'flavor' ? 'Flavor'
    : 'Other';
  const days = m.use === 'primary' || m.use === 'secondary';
  return `      <MISC>
        <NAME>${esc(m.name)}</NAME>
        <VERSION>1</VERSION>
        <TYPE>${typeXml}</TYPE>
        <USE>${useXml}</USE>
        <TIME>${days ? m.timeMin * 24 * 60 : m.timeMin}</TIME>
        <AMOUNT>${weightKg ? (m.amount * weightKg).toFixed(4) : m.amount}</AMOUNT>
        <AMOUNT_IS_WEIGHT>${weightKg ? 'TRUE' : 'FALSE'}</AMOUNT_IS_WEIGHT>
        <NOTES>${esc(m.note ?? (weightKg ? '' : `${m.amount} ${m.unit}`))}</NOTES>
      </MISC>`;
}

function hopUseXml(use: HopUse): string {
  switch (use) {
    case 'boil': return 'Boil';
    case 'dry hop': return 'Dry Hop';
    case 'whirlpool': return 'Aroma';
    case 'first wort': return 'First Wort';
    case 'mash': return 'Mash';
  }
}

/**
 * Export a recipe as BeerXML 1.0 (the interchange format BeerSmith,
 * Brewfather, and most brewing tools can import).
 */
export function toBeerXml(recipe: Recipe): string {
  const stats = recipeStats(recipe);
  const style = styleById(recipe.styleId);

  const fermentables = recipe.fermentables
    .map(
      (f) => `      <FERMENTABLE>
        <NAME>${esc(f.name)}</NAME>
        <VERSION>1</VERSION>
        <TYPE>${f.type === 'grain' ? 'Grain' : f.type === 'sugar' ? 'Sugar' : f.type === 'extract' ? 'Extract' : f.type === 'dry extract' ? 'Dry Extract' : 'Adjunct'}</TYPE>
        <AMOUNT>${(f.amountLb * LB_TO_KG).toFixed(4)}</AMOUNT>
        <YIELD>${(((f.potential - 1) * 1000) / 46 * 100).toFixed(1)}</YIELD>
        <COLOR>${f.lovibond}</COLOR>
        <RECOMMEND_MASH>${f.mustMash ? 'TRUE' : 'FALSE'}</RECOMMEND_MASH>
      </FERMENTABLE>`,
    )
    .join('\n');

  const hops = recipe.hops
    .map(
      (h) => `      <HOP>
        <NAME>${esc(h.name)}</NAME>
        <VERSION>1</VERSION>
        <ALPHA>${h.alpha}</ALPHA>
        <AMOUNT>${(h.amountOz * OZ_TO_KG).toFixed(4)}</AMOUNT>
        <USE>${hopUseXml(h.use)}</USE>
        <TIME>${h.use === 'dry hop' ? h.timeMin * 24 * 60 : h.timeMin}</TIME>
        <FORM>${h.form === 'pellet' ? 'Pellet' : h.form === 'leaf' ? 'Leaf' : 'Plug'}</FORM>
      </HOP>`,
    )
    .join('\n');

  const yeast = recipe.yeast
    ? `      <YEAST>
        <NAME>${esc(recipe.yeast.name)}</NAME>
        <VERSION>1</VERSION>
        <TYPE>Ale</TYPE>
        <FORM>${recipe.yeast.form === 'dry' ? 'Dry' : 'Liquid'}</FORM>
        <AMOUNT>0.0115</AMOUNT>
        <LABORATORY>${esc(recipe.yeast.lab)}</LABORATORY>
        <PRODUCT_ID>${esc(recipe.yeast.productId)}</PRODUCT_ID>
        <ATTENUATION>${recipe.yeast.attenuation}</ATTENUATION>
      </YEAST>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <NAME>${esc(recipe.name)}</NAME>
    <VERSION>1</VERSION>
    <TYPE>All Grain</TYPE>
    <BREWER>${esc(recipe.author)}</BREWER>
    <BATCH_SIZE>${(recipe.batchSizeGal * GAL_TO_L).toFixed(2)}</BATCH_SIZE>
    <BOIL_SIZE>${(recipe.boilSizeGal * GAL_TO_L).toFixed(2)}</BOIL_SIZE>
    <BOIL_TIME>${recipe.boilTimeMin}</BOIL_TIME>
    <EFFICIENCY>${recipe.efficiencyPct}</EFFICIENCY>
    <OG>${stats.og.toFixed(4)}</OG>
    <FG>${stats.fg.toFixed(4)}</FG>
    <IBU>${stats.ibu.toFixed(1)}</IBU>
    <EST_COLOR>${stats.srm.toFixed(1)}</EST_COLOR>
    <ABV>${stats.abv.toFixed(2)}</ABV>
    <NOTES>${esc(recipe.notes)}</NOTES>
    <STYLE>
      <NAME>${esc(style?.name ?? 'Unknown')}</NAME>
      <VERSION>1</VERSION>
      <CATEGORY>${esc(style?.category ?? '')}</CATEGORY>
      <CATEGORY_NUMBER>0</CATEGORY_NUMBER>
      <STYLE_LETTER></STYLE_LETTER>
      <STYLE_GUIDE>BJCP 2021</STYLE_GUIDE>
      <TYPE>Ale</TYPE>
      <OG_MIN>${style?.og.min ?? 1.02}</OG_MIN>
      <OG_MAX>${style?.og.max ?? 1.12}</OG_MAX>
      <FG_MIN>${style?.fg.min ?? 0.998}</FG_MIN>
      <FG_MAX>${style?.fg.max ?? 1.03}</FG_MAX>
      <IBU_MIN>${style?.ibu.min ?? 0}</IBU_MIN>
      <IBU_MAX>${style?.ibu.max ?? 120}</IBU_MAX>
      <COLOR_MIN>${style?.srm.min ?? 1}</COLOR_MIN>
      <COLOR_MAX>${style?.srm.max ?? 45}</COLOR_MAX>
    </STYLE>
    <MASH>
      <NAME>Single Infusion</NAME>
      <VERSION>1</VERSION>
      <GRAIN_TEMP>20.0</GRAIN_TEMP>
      <MASH_STEPS>
${(recipe.mash.steps && recipe.mash.steps.length > 0
  ? recipe.mash.steps
  : [{ name: 'Saccharification', type: 'infusion' as const, tempF: recipe.mash.mashTempF, timeMin: recipe.mash.mashTimeMin }]
)
  .map(
    (s) => `        <MASH_STEP>
          <NAME>${esc(s.name)}</NAME>
          <VERSION>1</VERSION>
          <TYPE>${s.type === 'decoction' ? 'Decoction' : s.type === 'temperature' ? 'Temperature' : 'Infusion'}</TYPE>
          <STEP_TEMP>${(((s.tempF - 32) * 5) / 9).toFixed(1)}</STEP_TEMP>
          <STEP_TIME>${s.timeMin}</STEP_TIME>
        </MASH_STEP>`,
  )
  .join('\n')}
      </MASH_STEPS>
    </MASH>
    <FERMENTABLES>
${fermentables}
    </FERMENTABLES>
    <HOPS>
${hops}
    </HOPS>
    <YEASTS>
${yeast}
    </YEASTS>
    <MISCS>
${(recipe.miscs ?? []).map(miscXml).join('\n')}
    </MISCS>
    <WATERS></WATERS>
  </RECIPE>
</RECIPES>
`;
}
