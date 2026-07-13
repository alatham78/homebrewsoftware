import { useState } from 'react';
import {
  ION_LABELS,
  parseWardLabsReport,
  residualAlkalinity,
  sulfateChlorideDescriptor,
  sulfateChlorideRatio,
  WATER_IONS,
  WATER_SOURCES,
  ZERO_WATER,
  type WaterProfile,
} from '@brewhaus/core';
import { savedWaterProfiles, useSavedWaterProfiles } from '../lib/waterProfiles';

export function WaterPage() {
  const saved = useSavedWaterProfiles();
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [profile, setProfile] = useState<WaterProfile>({ ...ZERO_WATER });
  const [pasteText, setPasteText] = useState('');
  const [parseMsg, setParseMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const announce = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  };

  const parsePaste = () => {
    const { profile: parsed, ph, alkalinity, hardness } = parseWardLabsReport(pasteText);
    const found = Object.keys(parsed).length;
    if (found === 0) {
      setParseMsg('No ion values recognized — check the pasted text or enter values manually below.');
      return;
    }
    setProfile((p) => ({ ...p, ...parsed }));
    const extras = [
      ph !== undefined ? `pH ${ph}` : null,
      alkalinity !== undefined ? `alkalinity ${alkalinity}` : null,
      hardness !== undefined ? `hardness ${hardness}` : null,
    ].filter(Boolean);
    setParseMsg(
      `Parsed ${found} ion value${found === 1 ? '' : 's'}${extras.length ? ` (also found ${extras.join(', ')})` : ''}. ` +
        `Ward's SO₄-S sulfur values are converted to SO₄ automatically. Review below, then save.`,
    );
    if (!name && /ward/i.test(pasteText)) setName('My tap water (Ward Labs)');
    if (!note) setNote(`Imported from Ward Labs report, ${new Date().toISOString().slice(0, 10)}`);
  };

  const save = () => {
    if (!name.trim()) return;
    savedWaterProfiles.add({ name: name.trim(), note: note.trim(), profile: { ...profile } });
    announce(`Saved “${name.trim()}” — pick it as a source in any recipe's Water section`);
    setName('');
    setNote('');
    setProfile({ ...ZERO_WATER });
    setPasteText('');
    setParseMsg(null);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Water</h1>
          <p className="page-sub">
            Save your source water — paste a Ward Labs report or enter values by hand — then pick it in
            any recipe's Water section
          </p>
        </div>
      </div>

      <div className="stack">
        <section className="card">
          <h2 className="section-title">Import a Ward Labs report</h2>
          <label className="field">
            Paste the report text (the W-6 household mineral panel works great)
            <textarea
              value={pasteText}
              placeholder={'pH 7.6\nSodium, Na 8\nCalcium, Ca 29\nMagnesium, Mg 6\nSulfate, SO4-S 6\nChloride, Cl 3\nBicarbonate, HCO3 44\nTotal Alkalinity, CaCO3 40'}
              onChange={(e) => setPasteText(e.target.value)}
              style={{ minHeight: 130, fontFamily: 'ui-monospace, monospace', fontSize: 13 }}
            />
          </label>
          <div className="row-actions" style={{ marginTop: 10 }}>
            <button className="btn" onClick={parsePaste} disabled={pasteText.trim() === ''}>
              Parse report
            </button>
            {parseMsg && <span style={{ color: 'var(--ink-secondary)', fontSize: 13 }}>{parseMsg}</span>}
          </div>
        </section>

        <section className="card">
          <h2 className="section-title">Profile to save</h2>
          <div className="field-row" style={{ gridTemplateColumns: '2fr 3fr' }}>
            <label className="field">
              Name
              <input value={name} placeholder="e.g. Home tap (Ward Labs 2026)" onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="field">
              Note (optional)
              <input value={note} placeholder="e.g. Sampled June 2026, kitchen tap" onChange={(e) => setNote(e.target.value)} />
            </label>
          </div>
          <div className="field-row" style={{ gridTemplateColumns: 'repeat(6, 1fr) auto', marginTop: 14, alignItems: 'end' }}>
            {WATER_IONS.map((ion) => (
              <label className="field" key={ion}>
                {ION_LABELS[ion]} (ppm)
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={profile[ion]}
                  onChange={(e) => setProfile({ ...profile, [ion]: Number(e.target.value) })}
                />
              </label>
            ))}
            <button className="btn primary" disabled={!name.trim()} onClick={save}>
              Save profile
            </button>
          </div>
        </section>

        <section className="card">
          <h2 className="section-title">My saved profiles</h2>
          {saved.length === 0 ? (
            <p className="empty-hint">
              Nothing saved yet. Import a lab report above, or start a recipe with one of the{' '}
              {WATER_SOURCES.length} built-in city presets.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="ingredients">
                <thead>
                  <tr>
                    <th>Name</th>
                    {WATER_IONS.map((ion) => (
                      <th className="num" key={ion}>
                        {ION_LABELS[ion]}
                      </th>
                    ))}
                    <th className="num">RA</th>
                    <th>Balance</th>
                    <th>Note</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {saved.map((p) => {
                    const ratio = sulfateChlorideRatio(p.profile);
                    return (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        {WATER_IONS.map((ion) => (
                          <td className="num" key={ion}>
                            {Math.round(p.profile[ion])}
                          </td>
                        ))}
                        <td className="num">{Math.round(residualAlkalinity(p.profile))}</td>
                        <td>{sulfateChlorideDescriptor(ratio)}</td>
                        <td style={{ color: 'var(--ink-muted)', fontSize: 13 }}>{p.note || '—'}</td>
                        <td className="num">
                          <button
                            className="btn subtle sm danger"
                            aria-label={`Delete ${p.name}`}
                            title="Delete saved profile (recipes keep their copy)"
                            onClick={() => savedWaterProfiles.remove(p.id)}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="section-title">Built-in city presets</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="ingredients">
              <thead>
                <tr>
                  <th>City</th>
                  {WATER_IONS.map((ion) => (
                    <th className="num" key={ion}>
                      {ION_LABELS[ion]}
                    </th>
                  ))}
                  <th>Character</th>
                </tr>
              </thead>
              <tbody>
                {WATER_SOURCES.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    {WATER_IONS.map((ion) => (
                      <td className="num" key={ion}>
                        {Math.round(p.profile[ion])}
                      </td>
                    ))}
                    <td style={{ color: 'var(--ink-muted)', fontSize: 13 }}>{p.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
