import {
  applySalts,
  emptySalts,
  estimateMashPh,
  ION_LABELS,
  lacticAcidForTargetPh,
  residualAlkalinity,
  SALT_INFO,
  SALT_KEYS,
  suggestSalts,
  sulfateChlorideDescriptor,
  sulfateChlorideRatio,
  totalBrewingWaterGal,
  WATER_IONS,
  WATER_SOURCES,
  WATER_TARGETS,
  waterTargetById,
  ZERO_WATER,
  type Recipe,
  type RecipeWater,
} from '@brewhaus/core';
import { useSavedWaterProfiles } from '../lib/waterProfiles';

const TARGET_MASH_PH = 5.4;

function defaultWater(): RecipeWater {
  return {
    sourceName: 'Distilled / RO',
    source: { ...ZERO_WATER },
    targetId: 'balanced',
    salts: emptySalts(),
    lacticAcidMl: 0,
  };
}

export function WaterPanel({
  recipe,
  onChange,
}: {
  recipe: Recipe;
  onChange: (water: RecipeWater) => void;
}) {
  const saved = useSavedWaterProfiles();
  const water = recipe.water ?? defaultWater();

  const totalGrainLb = recipe.fermentables.reduce((s, f) => s + f.amountLb, 0);
  const waterGal = totalBrewingWaterGal(recipe.boilSizeGal, totalGrainLb);
  const target = waterTargetById(water.targetId) ?? WATER_TARGETS[2]!;
  const result = applySalts(water.source, water.salts, waterGal);
  const ratio = sulfateChlorideRatio(result);
  const ra = residualAlkalinity(result);
  const mashPh = estimateMashPh(
    recipe.fermentables,
    result,
    recipe.mash.ratioQtPerLb,
    water.lacticAcidMl,
  );
  const suggestedLactic = lacticAcidForTargetPh(
    estimateMashPh(recipe.fermentables, result, recipe.mash.ratioQtPerLb, 0),
    TARGET_MASH_PH,
    totalGrainLb,
  );

  const setSource = (key: string) => {
    const savedProfile = saved.find((p) => `saved:${p.id}` === key);
    if (savedProfile) {
      onChange({ ...water, sourceName: savedProfile.name, source: { ...savedProfile.profile } });
      return;
    }
    const preset = WATER_SOURCES.find((p) => `preset:${p.id}` === key);
    if (preset) onChange({ ...water, sourceName: preset.name, source: { ...preset.profile } });
  };

  const sourceKey =
    saved.find((p) => p.name === water.sourceName) !== undefined
      ? `saved:${saved.find((p) => p.name === water.sourceName)!.id}`
      : `preset:${WATER_SOURCES.find((p) => p.name === water.sourceName)?.id ?? 'ro'}`;

  const fmt = (v: number) => Math.round(v).toString();

  return (
    <section className="card">
      <h2 className="section-title">Water</h2>
      <div className="field-row" style={{ gridTemplateColumns: '2fr 2fr 1fr' }}>
        <label className="field">
          Source water
          <select value={sourceKey} onChange={(e) => setSource(e.target.value)}>
            {saved.length > 0 && (
              <optgroup label="My water (lab reports)">
                {saved.map((p) => (
                  <option key={p.id} value={`saved:${p.id}`}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label="Presets">
              {WATER_SOURCES.map((p) => (
                <option key={p.id} value={`preset:${p.id}`}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <label className="field">
          Target profile
          <select value={water.targetId} onChange={(e) => onChange({ ...water, targetId: e.target.value })}>
            {WATER_TARGETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Brewing water
          <input value={`${waterGal.toFixed(1)} gal`} readOnly />
        </label>
      </div>

      <div className="field-row" style={{ gridTemplateColumns: 'repeat(7, 1fr) auto', marginTop: 14, alignItems: 'end' }}>
        {SALT_KEYS.map((key) => (
          <label className="field" key={key} title={`${SALT_INFO[key].formula}${SALT_INFO[key].note ? ` — ${SALT_INFO[key].note}` : ''}`}>
            {SALT_INFO[key].name} (g)
            <input
              type="number"
              min={0}
              step={0.1}
              value={water.salts[key]}
              onChange={(e) => onChange({ ...water, salts: { ...water.salts, [key]: Number(e.target.value) } })}
            />
          </label>
        ))}
        <label className="field">
          Lactic 88% (mL)
          <input
            type="number"
            min={0}
            step={0.5}
            value={water.lacticAcidMl}
            onChange={(e) => onChange({ ...water, lacticAcidMl: Number(e.target.value) })}
          />
        </label>
        <div className="row-actions">
          <button
            className="btn sm"
            title="Solve salt additions to approach the target profile"
            onClick={() => onChange({ ...water, salts: suggestSalts(water.source, target.profile, waterGal) })}
          >
            ⚙ Suggest
          </button>
          <button className="btn subtle sm" onClick={() => onChange({ ...water, salts: emptySalts(), lacticAcidMl: 0 })}>
            Clear
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16, overflowX: 'auto' }}>
        <table className="ingredients">
          <thead>
            <tr>
              <th>ppm</th>
              {WATER_IONS.map((ion) => (
                <th className="num" key={ion}>
                  {ION_LABELS[ion]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ color: 'var(--ink-muted)' }}>{water.sourceName}</td>
              {WATER_IONS.map((ion) => (
                <td className="num" key={ion} style={{ color: 'var(--ink-muted)' }}>
                  {fmt(water.source[ion])}
                </td>
              ))}
            </tr>
            <tr>
              <td>
                <strong>Treated water</strong>
              </td>
              {WATER_IONS.map((ion) => (
                <td className="num" key={ion}>
                  <strong>{fmt(result[ion])}</strong>
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ color: 'var(--ink-muted)' }}>Target · {target.name}</td>
              {WATER_IONS.map((ion) => (
                <td className="num" key={ion} style={{ color: 'var(--ink-muted)' }}>
                  {fmt(target.profile[ion])}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="empty-hint" style={{ paddingBottom: 0 }}>
        SO₄:Cl {Number.isFinite(ratio) ? ratio.toFixed(1) : '∞'} ({sulfateChlorideDescriptor(ratio)}) ·
        residual alkalinity {Math.round(ra)} ppm as CaCO₃ · est. mash pH{' '}
        <strong style={{ color: mashPh >= 5.2 && mashPh <= 5.6 ? 'var(--meter-in)' : 'var(--meter-out)' }}>
          {mashPh.toFixed(2)}
        </strong>
        {water.lacticAcidMl === 0 && suggestedLactic > 0 && (
          <> · try ~{suggestedLactic} mL lactic 88% for pH {TARGET_MASH_PH.toFixed(1)}</>
        )}
        {' '}— estimate only; confirm with a meter. Manage lab reports on the Water page.
      </p>
    </section>
  );
}
