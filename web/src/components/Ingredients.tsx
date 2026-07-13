import { useMemo, useState } from 'react';
import { FERMENTABLES, HOPS, YEASTS, type FermentableType, type YeastForm } from '@brewhaus/core';
import {
  customFermentables,
  customHops,
  customYeasts,
  useCustomFermentables,
  useCustomHops,
  useCustomYeasts,
} from '../lib/customIngredients';

type Tab = 'fermentables' | 'hops' | 'yeasts';

const TYPES: FermentableType[] = ['grain', 'adjunct', 'sugar', 'extract', 'dry extract'];

function CustomFermentableForm({ onDone }: { onDone: (name: string) => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<FermentableType>('grain');
  const [potential, setPotential] = useState(1.036);
  const [lovibond, setLovibond] = useState(2);
  const [origin, setOrigin] = useState('');
  const [mustMash, setMustMash] = useState(true);

  const valid = name.trim().length > 0 && potential >= 1 && potential <= 1.05 && lovibond >= 0;

  const submit = () => {
    if (!valid) return;
    customFermentables.add({ name: name.trim(), type, potential, lovibond, mustMash, origin: origin.trim() || undefined });
    onDone(name.trim());
    setName('');
    setOrigin('');
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h2 className="section-title">New custom fermentable</h2>
      <div className="field-row" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
        <label className="field">
          Name
          <input
            value={name}
            placeholder="e.g. Riverbend Southern Select"
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </label>
        <label className="field">
          Type
          <select
            value={type}
            onChange={(e) => {
              const t = e.target.value as FermentableType;
              setType(t);
              setMustMash(t === 'grain' || t === 'adjunct');
            }}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Maltster / origin (optional)
          <input value={origin} placeholder="e.g. Riverbend (US)" onChange={(e) => setOrigin(e.target.value)} />
        </label>
      </div>
      <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', marginTop: 14, alignItems: 'end' }}>
        <label className="field">
          Potential (SG per lb/gal)
          <input type="number" step={0.001} min={1} max={1.05} value={potential} onChange={(e) => setPotential(Number(e.target.value))} />
        </label>
        <label className="field">
          Color (°L)
          <input type="number" step={0.5} min={0} value={lovibond} onChange={(e) => setLovibond(Number(e.target.value))} />
        </label>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            style={{ width: 'auto' }}
            checked={mustMash}
            onChange={(e) => setMustMash(e.target.checked)}
          />
          Requires mashing
        </label>
        <button className="btn primary" disabled={!valid} onClick={submit} style={{ justifySelf: 'end' }}>
          Add to catalog
        </button>
      </div>
      <p className="empty-hint" style={{ paddingBottom: 0 }}>
        Typical base malts are ~1.036–1.038 potential; check your maltster’s spec sheet.
      </p>
    </div>
  );
}

function CustomHopForm({ onDone }: { onDone: (name: string) => void }) {
  const [name, setName] = useState('');
  const [alpha, setAlpha] = useState(10);
  const [origin, setOrigin] = useState('');
  const [profile, setProfile] = useState('');

  const valid = name.trim().length > 0 && alpha > 0 && alpha <= 30;

  const submit = () => {
    if (!valid) return;
    customHops.add({ name: name.trim(), alpha, origin: origin.trim(), profile: profile.trim() });
    onDone(name.trim());
    setName('');
    setProfile('');
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h2 className="section-title">New custom hop</h2>
      <div className="field-row" style={{ gridTemplateColumns: '2fr 1fr 1fr', alignItems: 'end' }}>
        <label className="field">
          Variety name
          <input value={name} placeholder="e.g. Experimental HBC 586" onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        <label className="field">
          Alpha acid (%)
          <input type="number" step={0.1} min={0.1} max={30} value={alpha} onChange={(e) => setAlpha(Number(e.target.value))} />
        </label>
        <label className="field">
          Origin (optional)
          <input value={origin} placeholder="e.g. US" onChange={(e) => setOrigin(e.target.value)} />
        </label>
      </div>
      <div className="field-row" style={{ gridTemplateColumns: '3fr 1fr', marginTop: 14, alignItems: 'end' }}>
        <label className="field">
          Flavor profile (optional)
          <input value={profile} placeholder="e.g. Guava, mango, sticky pine" onChange={(e) => setProfile(e.target.value)} />
        </label>
        <button className="btn primary" disabled={!valid} onClick={submit} style={{ justifySelf: 'end' }}>
          Add to catalog
        </button>
      </div>
      <p className="empty-hint" style={{ paddingBottom: 0 }}>
        Alpha acid is the default for new additions; you can still override it per-recipe for each lot.
      </p>
    </div>
  );
}

function CustomYeastForm({ onDone }: { onDone: (name: string) => void }) {
  const [name, setName] = useState('');
  const [lab, setLab] = useState('');
  const [productId, setProductId] = useState('');
  const [form, setForm] = useState<YeastForm>('dry');
  const [attenuation, setAttenuation] = useState(75);
  const [tempLowF, setTempLowF] = useState(62);
  const [tempHighF, setTempHighF] = useState(72);
  const [description, setDescription] = useState('');

  const valid =
    name.trim().length > 0 && attenuation >= 50 && attenuation <= 100 && tempLowF <= tempHighF;

  const submit = () => {
    if (!valid) return;
    customYeasts.add({
      name: name.trim(),
      lab: lab.trim() || 'Custom',
      productId: productId.trim(),
      form,
      attenuation,
      tempLowF,
      tempHighF,
      description: description.trim(),
    });
    onDone(name.trim());
    setName('');
    setProductId('');
    setDescription('');
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h2 className="section-title">New custom yeast</h2>
      <div className="field-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
        <label className="field">
          Strain name
          <input value={name} placeholder="e.g. Farmhouse Blend" onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        <label className="field">
          Lab (optional)
          <input value={lab} placeholder="e.g. Bootleg Biology" onChange={(e) => setLab(e.target.value)} />
        </label>
        <label className="field">
          Product ID (optional)
          <input value={productId} placeholder="e.g. OSLO" onChange={(e) => setProductId(e.target.value)} />
        </label>
        <label className="field">
          Form
          <select value={form} onChange={(e) => setForm(e.target.value as YeastForm)}>
            <option value="dry">dry</option>
            <option value="liquid">liquid</option>
          </select>
        </label>
      </div>
      <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr 1fr 2fr 1fr', marginTop: 14, alignItems: 'end' }}>
        <label className="field">
          Attenuation (%)
          <input type="number" min={50} max={100} value={attenuation} onChange={(e) => setAttenuation(Number(e.target.value))} />
        </label>
        <label className="field">
          Temp low (°F)
          <input type="number" min={40} max={100} value={tempLowF} onChange={(e) => setTempLowF(Number(e.target.value))} />
        </label>
        <label className="field">
          Temp high (°F)
          <input type="number" min={40} max={110} value={tempHighF} onChange={(e) => setTempHighF(Number(e.target.value))} />
        </label>
        <label className="field">
          Character (optional)
          <input value={description} placeholder="e.g. Clean, subtle citrus" onChange={(e) => setDescription(e.target.value)} />
        </label>
        <button className="btn primary" disabled={!valid} onClick={submit} style={{ justifySelf: 'end' }}>
          Add to catalog
        </button>
      </div>
      <p className="empty-hint" style={{ paddingBottom: 0 }}>
        Attenuation drives the FG and ABV estimates whenever this yeast is picked in the designer.
      </p>
    </div>
  );
}

export function Ingredients() {
  const [tab, setTab] = useState<Tab>('fermentables');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const myFermentables = useCustomFermentables();
  const myHops = useCustomHops();
  const myYeasts = useCustomYeasts();
  const q = query.trim().toLowerCase();

  const fermentables = useMemo(
    () =>
      [...myFermentables, ...FERMENTABLES].filter((f) =>
        `${f.name} ${f.origin ?? ''} ${f.group ?? ''} ${f.type}`.toLowerCase().includes(q),
      ),
    [q, myFermentables],
  );
  const hops = useMemo(
    () =>
      [...myHops, ...HOPS].filter((h) => (h.name + h.profile + h.origin).toLowerCase().includes(q)),
    [q, myHops],
  );
  const yeasts = useMemo(
    () =>
      [...myYeasts, ...YEASTS].filter((y) =>
        (y.name + y.lab + y.productId + y.description).toLowerCase().includes(q),
      ),
    [q, myYeasts],
  );

  const isCustom = (id: string) => id.startsWith('custom-');

  const announce = (name: string) => {
    setNotice(`Added “${name}” — it's now available in the recipe designer`);
    window.setTimeout(() => setNotice(null), 3200);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Ingredients</h1>
          <p className="page-sub">
            {FERMENTABLES.length + myFermentables.length} fermentables ({myFermentables.length} custom),{' '}
            {HOPS.length + myHops.length} hops ({myHops.length} custom), {YEASTS.length + myYeasts.length}{' '}
            yeasts ({myYeasts.length} custom)
          </p>
        </div>
        <div className="row-actions">
          <div className="tabs">
            {(['fermentables', 'hops', 'yeasts'] as Tab[]).map((t) => (
              <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t[0]!.toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <input
            className="search"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Close' : '+ Custom entry'}
          </button>
        </div>
      </div>

      {showForm && tab === 'fermentables' && <CustomFermentableForm onDone={announce} />}
      {showForm && tab === 'hops' && <CustomHopForm onDone={announce} />}
      {showForm && tab === 'yeasts' && <CustomYeastForm onDone={announce} />}

      <div className="card">
        {tab === 'fermentables' && (
          <table className="ingredients">
            <thead>
              <tr>
                <th>Name</th>
                <th>Group</th>
                <th>Origin</th>
                <th className="num">Potential</th>
                <th className="num">Color (°L)</th>
                <th>Mash?</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {fermentables.map((f) => (
                <tr key={f.id}>
                  <td>
                    {f.name} {isCustom(f.id) && <span className="badge">custom</span>}
                  </td>
                  <td>{f.group ?? '—'}</td>
                  <td>{f.origin || '—'}</td>
                  <td className="num">{f.potential.toFixed(3)}</td>
                  <td className="num">{f.lovibond}</td>
                  <td>{f.mustMash ? 'yes' : 'no'}</td>
                  <td className="num">
                    {isCustom(f.id) && (
                      <button
                        className="btn subtle sm danger"
                        aria-label={`Delete ${f.name}`}
                        title="Delete custom entry (saved recipes keep their copy)"
                        onClick={() => customFermentables.remove(f.id)}
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'hops' && (
          <table className="ingredients">
            <thead>
              <tr>
                <th>Variety</th>
                <th className="num">Alpha %</th>
                <th>Origin</th>
                <th>Profile</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {hops.map((h) => (
                <tr key={h.id}>
                  <td>
                    {h.name} {isCustom(h.id) && <span className="badge">custom</span>}
                  </td>
                  <td className="num">{h.alpha.toFixed(1)}</td>
                  <td>{h.origin || '—'}</td>
                  <td>{h.profile || '—'}</td>
                  <td className="num">
                    {isCustom(h.id) && (
                      <button
                        className="btn subtle sm danger"
                        aria-label={`Delete ${h.name}`}
                        title="Delete custom entry (saved recipes keep their copy)"
                        onClick={() => customHops.remove(h.id)}
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'yeasts' && (
          <table className="ingredients">
            <thead>
              <tr>
                <th>Strain</th>
                <th>Lab</th>
                <th>Form</th>
                <th className="num">Attenuation %</th>
                <th className="num">Temp (°F)</th>
                <th>Character</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {yeasts.map((y) => (
                <tr key={y.id}>
                  <td>
                    {y.name}{' '}
                    {y.productId && <span style={{ color: 'var(--ink-muted)' }}>({y.productId})</span>}{' '}
                    {isCustom(y.id) && <span className="badge">custom</span>}
                  </td>
                  <td>{y.lab}</td>
                  <td>{y.form}</td>
                  <td className="num">{y.attenuation}</td>
                  <td className="num">
                    {y.tempLowF}–{y.tempHighF}
                  </td>
                  <td>{y.description || '—'}</td>
                  <td className="num">
                    {isCustom(y.id) && (
                      <button
                        className="btn subtle sm danger"
                        aria-label={`Delete ${y.name}`}
                        title="Delete custom entry (saved recipes keep their copy)"
                        onClick={() => customYeasts.remove(y.id)}
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {notice && <div className="toast">{notice}</div>}
    </>
  );
}
