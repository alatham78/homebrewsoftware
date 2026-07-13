import { useMemo, useState } from 'react';
import { FERMENTABLES, HOPS, YEASTS, type FermentableType } from '@brewhaus/core';
import {
  addCustomFermentable,
  removeCustomFermentable,
  useCustomFermentables,
} from '../lib/customFermentables';

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
    addCustomFermentable({ name: name.trim(), type, potential, lovibond, mustMash, origin: origin.trim() || undefined });
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
        Custom entries are saved on this device and appear in the recipe designer under “Custom”.
        Typical base malts are ~1.036–1.038 potential; check your maltster’s spec sheet.
      </p>
    </div>
  );
}

export function Ingredients() {
  const [tab, setTab] = useState<Tab>('fermentables');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const customFermentables = useCustomFermentables();
  const q = query.trim().toLowerCase();

  const fermentables = useMemo(
    () =>
      [...customFermentables, ...FERMENTABLES].filter((f) =>
        `${f.name} ${f.origin ?? ''} ${f.group ?? ''} ${f.type}`.toLowerCase().includes(q),
      ),
    [q, customFermentables],
  );
  const hops = useMemo(
    () => HOPS.filter((h) => (h.name + h.profile + h.origin).toLowerCase().includes(q)),
    [q],
  );
  const yeasts = useMemo(
    () => YEASTS.filter((y) => (y.name + y.lab + y.productId + y.description).toLowerCase().includes(q)),
    [q],
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Ingredients</h1>
          <p className="page-sub">
            {FERMENTABLES.length + customFermentables.length} fermentables ({customFermentables.length}{' '}
            custom), {HOPS.length} hops, {YEASTS.length} yeasts
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
          {tab === 'fermentables' && (
            <button className="btn primary" onClick={() => setShowForm((s) => !s)}>
              {showForm ? 'Close' : '+ Custom entry'}
            </button>
          )}
        </div>
      </div>

      {tab === 'fermentables' && showForm && (
        <CustomFermentableForm
          onDone={(name) => {
            setNotice(`Added “${name}” — it's now available in the recipe designer`);
            window.setTimeout(() => setNotice(null), 3200);
          }}
        />
      )}

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
              {fermentables.map((f) => {
                const isCustom = f.group === 'Custom';
                return (
                  <tr key={f.id}>
                    <td>
                      {f.name} {isCustom && <span className="badge">custom</span>}
                    </td>
                    <td>{f.group ?? '—'}</td>
                    <td>{f.origin || '—'}</td>
                    <td className="num">{f.potential.toFixed(3)}</td>
                    <td className="num">{f.lovibond}</td>
                    <td>{f.mustMash ? 'yes' : 'no'}</td>
                    <td className="num">
                      {isCustom && (
                        <button
                          className="btn subtle sm danger"
                          aria-label={`Delete ${f.name}`}
                          title="Delete custom entry (saved recipes keep their copy)"
                          onClick={() => removeCustomFermentable(f.id)}
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
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
              </tr>
            </thead>
            <tbody>
              {hops.map((h) => (
                <tr key={h.id}>
                  <td>{h.name}</td>
                  <td className="num">{h.alpha.toFixed(1)}</td>
                  <td>{h.origin}</td>
                  <td>{h.profile}</td>
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
              </tr>
            </thead>
            <tbody>
              {yeasts.map((y) => (
                <tr key={y.id}>
                  <td>
                    {y.name} <span style={{ color: 'var(--ink-muted)' }}>({y.productId})</span>
                  </td>
                  <td>{y.lab}</td>
                  <td>{y.form}</td>
                  <td className="num">{y.attenuation}</td>
                  <td className="num">
                    {y.tempLowF}–{y.tempHighF}
                  </td>
                  <td>{y.description}</td>
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
