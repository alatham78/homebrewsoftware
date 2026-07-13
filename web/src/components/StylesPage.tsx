import { useMemo, useState } from 'react';
import { BEER_STYLES, srmToHex, STYLE_CATEGORIES } from '@brewhaus/core';

export function StylesPage() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      BEER_STYLES.filter((s) =>
        `${s.name} ${s.category} ${s.description ?? ''} ${s.examples ?? ''}`.toLowerCase().includes(q),
      ),
    [q],
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Style guide</h1>
          <p className="page-sub">
            {BEER_STYLES.length} BJCP 2021 styles across {STYLE_CATEGORIES.length} categories
          </p>
        </div>
        <input className="search" placeholder="Search styles…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="stack">
        {STYLE_CATEGORIES.map((category) => {
          const members = filtered.filter((s) => s.category === category);
          if (members.length === 0) return null;
          return (
            <section className="card" key={category}>
              <h2 className="section-title">{category}</h2>
              <div style={{ overflowX: 'auto' }}>
                <table className="ingredients">
                  <thead>
                    <tr>
                      <th>Style</th>
                      <th className="num">OG</th>
                      <th className="num">FG</th>
                      <th className="num">IBU</th>
                      <th className="num">SRM</th>
                      <th className="num">ABV %</th>
                      <th>Character</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((s) => (
                      <tr key={s.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span
                            className="srm-chip"
                            style={{ background: srmToHex((s.srm.min + s.srm.max) / 2) }}
                          />
                          {s.name}
                        </td>
                        <td className="num">
                          {s.og.min.toFixed(3)}–{s.og.max.toFixed(3)}
                        </td>
                        <td className="num">
                          {s.fg.min.toFixed(3)}–{s.fg.max.toFixed(3)}
                        </td>
                        <td className="num">
                          {s.ibu.min}–{s.ibu.max}
                        </td>
                        <td className="num">
                          {s.srm.min}–{s.srm.max}
                        </td>
                        <td className="num">
                          {s.abv.min.toFixed(1)}–{s.abv.max.toFixed(1)}
                        </td>
                        <td style={{ fontSize: 13 }}>
                          {s.description}
                          {s.examples && (
                            <span style={{ color: 'var(--ink-muted)' }}> — {s.examples}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
