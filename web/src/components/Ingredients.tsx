import { useMemo, useState } from 'react';
import { FERMENTABLES, HOPS, YEASTS } from '@brewhaus/core';

type Tab = 'fermentables' | 'hops' | 'yeasts';

export function Ingredients() {
  const [tab, setTab] = useState<Tab>('fermentables');
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const fermentables = useMemo(
    () => FERMENTABLES.filter((f) => f.name.toLowerCase().includes(q)),
    [q],
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
          <p className="page-sub">The built-in catalog used by the recipe designer</p>
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
        </div>
      </div>

      <div className="card">
        {tab === 'fermentables' && (
          <table className="ingredients">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th className="num">Potential</th>
                <th className="num">Color (°L)</th>
                <th>Mash?</th>
              </tr>
            </thead>
            <tbody>
              {fermentables.map((f) => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td>{f.type}</td>
                  <td className="num">{f.potential.toFixed(3)}</td>
                  <td className="num">{f.lovibond}</td>
                  <td>{f.mustMash ? 'yes' : 'no'}</td>
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
    </>
  );
}
