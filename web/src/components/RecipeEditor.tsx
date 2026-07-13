import { useMemo, useState } from 'react';
import {
  BEER_STYLES,
  FERMENTABLE_GROUPS,
  FERMENTABLES,
  HOP_ORIGINS,
  HOPS,
  YEAST_LABS,
  YEASTS,
  ibuForAddition,
  mashWaterQt,
  pointsToSg,
  recipeStats,
  sgToPoints,
  strikeWaterTempF,
  toBeerXml,
  type Fermentable,
  type Hop,
  type HopForm,
  type HopUse,
  type Recipe,
  type Yeast,
} from '@brewhaus/core';
import { useCustomFermentables, useCustomHops, useCustomYeasts } from '../lib/customIngredients';
import { StatsPanel } from './StatsPanel';

function FermentableOptions({ all }: { all: Fermentable[] }) {
  return (
    <>
      {FERMENTABLE_GROUPS.map((group) => {
        const members = all.filter((f) => (f.group ?? 'Specialty') === group);
        if (members.length === 0) return null;
        return (
          <optgroup key={group} label={group}>
            {members.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
                {f.origin ? ` · ${f.origin}` : ''}
              </option>
            ))}
          </optgroup>
        );
      })}
    </>
  );
}

function HopOptions({ builtIn, custom }: { builtIn: Hop[]; custom: Hop[] }) {
  return (
    <>
      {custom.length > 0 && (
        <optgroup label="Custom">
          {custom.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </optgroup>
      )}
      {HOP_ORIGINS.map((origin) => {
        const members = builtIn.filter((h) => h.origin === origin);
        if (members.length === 0) return null;
        return (
          <optgroup key={origin} label={origin}>
            {members.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </optgroup>
        );
      })}
    </>
  );
}

function YeastOptions({ builtIn, custom }: { builtIn: Yeast[]; custom: Yeast[] }) {
  const otherLabs = [...new Set(builtIn.map((y) => y.lab))].filter(
    (lab) => !(YEAST_LABS as readonly string[]).includes(lab),
  );
  return (
    <>
      {custom.length > 0 && (
        <optgroup label="Custom">
          {custom.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
              {y.productId ? ` (${y.productId})` : ''}
            </option>
          ))}
        </optgroup>
      )}
      {[...YEAST_LABS, ...otherLabs].map((lab) => {
        const members = builtIn.filter((y) => y.lab === lab);
        if (members.length === 0) return null;
        return (
          <optgroup key={lab} label={lab}>
            {members.map((y) => (
              <option key={y.id} value={y.id}>
                {y.productId} · {y.name}
              </option>
            ))}
          </optgroup>
        );
      })}
    </>
  );
}

const HOP_USES: HopUse[] = ['boil', 'whirlpool', 'dry hop', 'first wort', 'mash'];
const HOP_FORMS: HopForm[] = ['pellet', 'leaf', 'plug'];

function download(filename: string, mime: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  recipe: Recipe;
  onSave: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export function RecipeEditor({ recipe: initial, onSave, onDelete, onBack }: Props) {
  const [recipe, setRecipe] = useState<Recipe>(initial);
  const [dirty, setDirty] = useState(false);
  const customFermentables = useCustomFermentables();
  const customHops = useCustomHops();
  const customYeasts = useCustomYeasts();
  const allFermentables = useMemo(
    () => [...FERMENTABLES, ...customFermentables],
    [customFermentables],
  );
  const findFermentable = (id: string) => allFermentables.find((f) => f.id === id);
  const findHop = (id: string) => HOPS.find((h) => h.id === id) ?? customHops.find((h) => h.id === id);
  const findYeast = (id: string) =>
    YEASTS.find((y) => y.id === id) ?? customYeasts.find((y) => y.id === id);

  const stats = useMemo(() => recipeStats(recipe), [recipe]);
  const boilGravity =
    recipe.boilSizeGal > 0
      ? pointsToSg((sgToPoints(stats.og) * recipe.batchSizeGal) / recipe.boilSizeGal)
      : stats.og;

  const patch = (p: Partial<Recipe>) => {
    setRecipe((r) => ({ ...r, ...p }));
    setDirty(true);
  };

  const patchNum = (key: keyof Recipe) => (e: React.ChangeEvent<HTMLInputElement>) =>
    patch({ [key]: Number(e.target.value) } as Partial<Recipe>);

  // --- fermentables ---
  const addFermentable = () => {
    const f = findFermentable('pale-2row')!;
    patch({
      fermentables: [
        ...recipe.fermentables,
        { fermentableId: f.id, name: f.name, type: f.type, potential: f.potential, lovibond: f.lovibond, mustMash: f.mustMash, amountLb: 1 },
      ],
    });
  };

  const setFermentable = (i: number, id: string) => {
    const f = findFermentable(id);
    if (!f) return;
    patch({
      fermentables: recipe.fermentables.map((row, j) =>
        j === i
          ? { ...row, fermentableId: f.id, name: f.name, type: f.type, potential: f.potential, lovibond: f.lovibond, mustMash: f.mustMash }
          : row,
      ),
    });
  };

  const setFermentableAmount = (i: number, amountLb: number) =>
    patch({ fermentables: recipe.fermentables.map((row, j) => (j === i ? { ...row, amountLb } : row)) });

  const removeFermentable = (i: number) =>
    patch({ fermentables: recipe.fermentables.filter((_, j) => j !== i) });

  // --- hops ---
  const addHop = () => {
    const h = findHop('cascade')!;
    patch({
      hops: [
        ...recipe.hops,
        { hopId: h.id, name: h.name, alpha: h.alpha, amountOz: 1, use: 'boil', timeMin: 60, form: 'pellet' },
      ],
    });
  };

  const patchHop = (i: number, p: Partial<Recipe['hops'][number]>) =>
    patch({ hops: recipe.hops.map((row, j) => (j === i ? { ...row, ...p } : row)) });

  const setHop = (i: number, id: string) => {
    const h = findHop(id);
    if (h) patchHop(i, { hopId: h.id, name: h.name, alpha: h.alpha });
  };

  const removeHop = (i: number) => patch({ hops: recipe.hops.filter((_, j) => j !== i) });

  // --- yeast ---
  const setYeast = (id: string) => {
    if (id === '') return patch({ yeast: null });
    const y = findYeast(id);
    if (y) {
      patch({
        yeast: { yeastId: y.id, name: y.name, lab: y.lab, productId: y.productId, form: y.form, attenuation: y.attenuation },
      });
    }
  };

  const save = () => {
    onSave(recipe);
    setDirty(false);
  };

  const strikeTemp = strikeWaterTempF(recipe.mash.ratioQtPerLb, 70, recipe.mash.mashTempF);
  const strikeQt = mashWaterQt(stats.totalGrainLb, recipe.mash.ratioQtPerLb);

  return (
    <>
      <div className="page-head">
        <div>
          <button className="btn subtle sm" onClick={onBack}>
            ← All recipes
          </button>
          <h1 className="page-title" style={{ marginTop: 8 }}>
            {recipe.name || 'Untitled recipe'}
          </h1>
        </div>
        <div className="row-actions">
          <button
            className="btn"
            onClick={() => download(`${recipe.name || 'recipe'}.xml`, 'application/xml', toBeerXml(recipe))}
          >
            Export BeerXML
          </button>
          <button
            className="btn"
            onClick={() => download(`${recipe.name || 'recipe'}.json`, 'application/json', JSON.stringify(recipe, null, 2))}
          >
            Export JSON
          </button>
          <button className="btn danger" onClick={() => onDelete(recipe.id)}>
            Delete
          </button>
          <button className="btn primary" onClick={save}>
            {dirty ? 'Save changes' : 'Saved ✓'}
          </button>
        </div>
      </div>

      <div className="designer">
        <div className="stack">
          <section className="card">
            <h2 className="section-title">Recipe</h2>
            <div className="field-row" style={{ gridTemplateColumns: '2fr 2fr' }}>
              <label className="field">
                Name
                <input value={recipe.name} onChange={(e) => patch({ name: e.target.value })} />
              </label>
              <label className="field">
                Style
                <select value={recipe.styleId} onChange={(e) => patch({ styleId: e.target.value })}>
                  {BEER_STYLES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="field-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 14 }}>
              <label className="field">
                Batch size (gal)
                <input type="number" min={0.5} step={0.5} value={recipe.batchSizeGal} onChange={patchNum('batchSizeGal')} />
              </label>
              <label className="field">
                Boil size (gal)
                <input type="number" min={0.5} step={0.5} value={recipe.boilSizeGal} onChange={patchNum('boilSizeGal')} />
              </label>
              <label className="field">
                Boil time (min)
                <input type="number" min={0} step={5} value={recipe.boilTimeMin} onChange={patchNum('boilTimeMin')} />
              </label>
              <label className="field">
                Efficiency (%)
                <input type="number" min={40} max={100} value={recipe.efficiencyPct} onChange={patchNum('efficiencyPct')} />
              </label>
            </div>
          </section>

          <section className="card">
            <h2 className="section-title">Fermentables</h2>
            {recipe.fermentables.length === 0 ? (
              <p className="empty-hint">No grain yet — add your base malt to get started.</p>
            ) : (
              <table className="ingredients">
                <thead>
                  <tr>
                    <th>Ingredient</th>
                    <th className="num">Amount (lb)</th>
                    <th className="num">Bill %</th>
                    <th className="num">Color (°L)</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {recipe.fermentables.map((f, i) => (
                    <tr key={i}>
                      <td>
                        <select value={f.fermentableId} onChange={(e) => setFermentable(i, e.target.value)}>
                          {!findFermentable(f.fermentableId) && (
                            <option value={f.fermentableId}>{f.name} (saved copy)</option>
                          )}
                          <FermentableOptions all={allFermentables} />
                        </select>
                      </td>
                      <td className="num">
                        <input
                          className="qty"
                          type="number"
                          min={0}
                          step={0.25}
                          value={f.amountLb}
                          onChange={(e) => setFermentableAmount(i, Number(e.target.value))}
                        />
                      </td>
                      <td className="num">
                        {stats.totalGrainLb > 0 ? ((f.amountLb / stats.totalGrainLb) * 100).toFixed(0) : 0}%
                      </td>
                      <td className="num">{f.lovibond}</td>
                      <td className="num">
                        <button className="btn subtle sm" aria-label="Remove" onClick={() => removeFermentable(i)}>
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div style={{ marginTop: 12 }}>
              <button className="btn sm" onClick={addFermentable}>
                + Add fermentable
              </button>
            </div>
          </section>

          <section className="card">
            <h2 className="section-title">Hops</h2>
            {recipe.hops.length === 0 ? (
              <p className="empty-hint">No hops yet — even a NEIPA wants a little bittering charge.</p>
            ) : (
              <table className="ingredients">
                <thead>
                  <tr>
                    <th>Variety</th>
                    <th className="num">Oz</th>
                    <th className="num">AA%</th>
                    <th>Use</th>
                    <th className="num">Time</th>
                    <th>Form</th>
                    <th className="num">IBU</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {recipe.hops.map((h, i) => (
                    <tr key={i}>
                      <td>
                        <select value={h.hopId} onChange={(e) => setHop(i, e.target.value)}>
                          {!findHop(h.hopId) && <option value={h.hopId}>{h.name} (saved copy)</option>}
                          <HopOptions builtIn={HOPS} custom={customHops} />
                        </select>
                      </td>
                      <td className="num">
                        <input className="qty" type="number" min={0} step={0.25} value={h.amountOz} onChange={(e) => patchHop(i, { amountOz: Number(e.target.value) })} />
                      </td>
                      <td className="num">
                        <input className="qty" type="number" min={0} step={0.1} value={h.alpha} onChange={(e) => patchHop(i, { alpha: Number(e.target.value) })} />
                      </td>
                      <td>
                        <select value={h.use} onChange={(e) => patchHop(i, { use: e.target.value as HopUse })}>
                          {HOP_USES.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="num">
                        <input
                          className="qty"
                          type="number"
                          min={0}
                          value={h.timeMin}
                          onChange={(e) => patchHop(i, { timeMin: Number(e.target.value) })}
                          title={h.use === 'dry hop' ? 'days' : 'minutes'}
                        />
                      </td>
                      <td>
                        <select value={h.form} onChange={(e) => patchHop(i, { form: e.target.value as HopForm })}>
                          {HOP_FORMS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="num">{ibuForAddition(h, recipe.batchSizeGal, boilGravity).toFixed(1)}</td>
                      <td className="num">
                        <button className="btn subtle sm" aria-label="Remove" onClick={() => removeHop(i)}>
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div style={{ marginTop: 12 }}>
              <button className="btn sm" onClick={addHop}>
                + Add hop
              </button>
            </div>
          </section>

          <section className="card">
            <h2 className="section-title">Yeast & mash</h2>
            <div className="field-row" style={{ gridTemplateColumns: '2fr 1fr' }}>
              <label className="field">
                Yeast
                <select value={recipe.yeast?.yeastId ?? ''} onChange={(e) => setYeast(e.target.value)}>
                  <option value="">— none selected —</option>
                  {recipe.yeast && !findYeast(recipe.yeast.yeastId) && (
                    <option value={recipe.yeast.yeastId}>{recipe.yeast.name} (saved copy)</option>
                  )}
                  <YeastOptions builtIn={YEASTS} custom={customYeasts} />
                </select>
              </label>
              <label className="field">
                Attenuation (%)
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={recipe.yeast?.attenuation ?? 75}
                  disabled={!recipe.yeast}
                  onChange={(e) =>
                    recipe.yeast && patch({ yeast: { ...recipe.yeast, attenuation: Number(e.target.value) } })
                  }
                />
              </label>
            </div>
            <div className="field-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 14 }}>
              <label className="field">
                Mash temp (°F)
                <input
                  type="number"
                  min={140}
                  max={170}
                  value={recipe.mash.mashTempF}
                  onChange={(e) => patch({ mash: { ...recipe.mash, mashTempF: Number(e.target.value) } })}
                />
              </label>
              <label className="field">
                Mash time (min)
                <input
                  type="number"
                  min={15}
                  step={5}
                  value={recipe.mash.mashTimeMin}
                  onChange={(e) => patch({ mash: { ...recipe.mash, mashTimeMin: Number(e.target.value) } })}
                />
              </label>
              <label className="field">
                Water ratio (qt/lb)
                <input
                  type="number"
                  min={0.75}
                  max={3}
                  step={0.25}
                  value={recipe.mash.ratioQtPerLb}
                  onChange={(e) => patch({ mash: { ...recipe.mash, ratioQtPerLb: Number(e.target.value) } })}
                />
              </label>
            </div>
            <p className="empty-hint" style={{ paddingBottom: 0 }}>
              Strike {strikeQt.toFixed(1)} qt of water at {strikeTemp.toFixed(0)} °F (70 °F grain) to hit{' '}
              {recipe.mash.mashTempF} °F.
            </p>
          </section>

          <section className="card">
            <h2 className="section-title">Notes</h2>
            <textarea
              value={recipe.notes}
              placeholder="Water chemistry, fermentation schedule, tasting notes…"
              onChange={(e) => patch({ notes: e.target.value })}
            />
          </section>
        </div>

        <StatsPanel stats={stats} styleId={recipe.styleId} />
      </div>
    </>
  );
}
