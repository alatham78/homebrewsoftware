import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  actualAbv,
  actualAttenuationPct,
  actualEfficiencyPct,
  generateBrewSteps,
  SESSION_STATUSES,
  type BrewSession,
  type BrewStep,
  type Recipe,
  type SessionStatus,
} from '@brewhaus/core';
import { deductRecipe } from '../lib/inventory';

function Timer({ minutes }: { minutes: number }) {
  const [remaining, setRemaining] = useState(minutes * 60);
  const [running, setRunning] = useState(false);
  const interval = useRef<number>();

  useEffect(() => {
    if (running) {
      interval.current = window.setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    }
    return () => window.clearInterval(interval.current);
  }, [running]);

  useEffect(() => {
    if (remaining === 0) setRunning(false);
  }, [remaining]);

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  return (
    <span className="row-actions" style={{ fontVariantNumeric: 'tabular-nums' }}>
      <span style={{ color: remaining === 0 ? 'var(--meter-in)' : 'var(--ink-secondary)', fontWeight: 600 }}>
        {remaining === 0 ? '✓ time!' : `${mm}:${ss.toString().padStart(2, '0')}`}
      </span>
      <button className="btn subtle sm" onClick={() => setRunning((r) => !r)}>
        {running ? '⏸' : '▶'}
      </button>
      <button className="btn subtle sm" onClick={() => { setRunning(false); setRemaining(minutes * 60); }}>
        ↺
      </button>
    </span>
  );
}

interface Props {
  session: BrewSession;
  recipe: Recipe | undefined;
  onSave: (session: BrewSession) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  onToast: (msg: string) => void;
}

export function SessionView({ session: initial, recipe, onSave, onDelete, onBack, onToast }: Props) {
  const [session, setSession] = useState<BrewSession>(initial);
  const [newSg, setNewSg] = useState(1.02);
  const [newNote, setNewNote] = useState('');
  const [deducted, setDeducted] = useState(false);

  const patch = (p: Partial<BrewSession>) => {
    const next = { ...session, ...p };
    setSession(next);
    onSave(next);
  };

  const steps: BrewStep[] = useMemo(() => (recipe ? generateBrewSteps(recipe) : []), [recipe]);
  const toggleStep = (i: number) =>
    patch({
      stepsDone: session.stepsDone.includes(i)
        ? session.stepsDone.filter((x) => x !== i)
        : [...session.stepsDone, i],
    });

  const numField = (key: 'measuredPreBoilSg' | 'measuredOg' | 'measuredFg' | 'actualVolumeGal', label: string, step = 0.001) => (
    <label className="field" key={key}>
      {label}
      <input
        type="number"
        step={step}
        value={session[key] ?? ''}
        placeholder="—"
        onChange={(e) => patch({ [key]: e.target.value === '' ? undefined : Number(e.target.value) })}
      />
    </label>
  );

  const eff =
    recipe && session.measuredOg && (session.actualVolumeGal ?? recipe.batchSizeGal) > 0
      ? actualEfficiencyPct(recipe, session.measuredOg, session.actualVolumeGal ?? recipe.batchSizeGal)
      : undefined;
  const abvActual = session.measuredOg && session.measuredFg ? actualAbv(session.measuredOg, session.measuredFg) : undefined;

  const compare = (label: string, predicted: string, actual: string | undefined) => (
    <tr key={label}>
      <td>{label}</td>
      <td className="num" style={{ color: 'var(--ink-muted)' }}>{predicted}</td>
      <td className="num">{actual ?? '—'}</td>
    </tr>
  );

  let lastPhase = '';

  return (
    <>
      <div className="page-head">
        <div>
          <button className="btn subtle sm" onClick={onBack}>
            ← All batches
          </button>
          <h1 className="page-title" style={{ marginTop: 8 }}>
            {session.recipeName}
          </h1>
          <p className="page-sub">{session.styleName} · brewed {session.brewDate}</p>
        </div>
        <div className="row-actions">
          <label className="field">
            Status
            <select value={session.status} onChange={(e) => patch({ status: e.target.value as SessionStatus })}>
              {SESSION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <button className="btn danger" onClick={() => onDelete(session.id)}>
            Delete batch
          </button>
        </div>
      </div>

      <div className="designer">
        <div className="stack">
          <section className="card">
            <h2 className="section-title">Measurements</h2>
            <div className="field-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              <label className="field">
                Brew date
                <input type="date" value={session.brewDate} onChange={(e) => patch({ brewDate: e.target.value })} />
              </label>
              {numField('measuredPreBoilSg', 'Pre-boil SG')}
              {numField('measuredOg', 'Measured OG')}
              {numField('measuredFg', 'Measured FG')}
              {numField('actualVolumeGal', 'Volume (gal)', 0.1)}
            </div>
          </section>

          <section className="card">
            <h2 className="section-title">Gravity log</h2>
            {session.gravityReadings.length > 0 && (
              <table className="ingredients">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th className="num">SG</th>
                    <th>Note</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {session.gravityReadings.map((g, i) => (
                    <tr key={i}>
                      <td>{g.date}</td>
                      <td className="num">{g.sg.toFixed(3)}</td>
                      <td style={{ color: 'var(--ink-muted)' }}>{g.note || '—'}</td>
                      <td className="num">
                        <button
                          className="btn subtle sm"
                          aria-label="Remove reading"
                          onClick={() => patch({ gravityReadings: session.gravityReadings.filter((_, j) => j !== i) })}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="field-row" style={{ gridTemplateColumns: '1fr 2fr auto', marginTop: 12, alignItems: 'end' }}>
              <label className="field">
                SG
                <input type="number" step={0.001} value={newSg} onChange={(e) => setNewSg(Number(e.target.value))} />
              </label>
              <label className="field">
                Note
                <input value={newNote} placeholder="e.g. krausen dropping, 68 °F" onChange={(e) => setNewNote(e.target.value)} />
              </label>
              <button
                className="btn sm"
                onClick={() => {
                  patch({
                    gravityReadings: [
                      ...session.gravityReadings,
                      { date: new Date().toISOString().slice(0, 10), sg: newSg, note: newNote || undefined },
                    ],
                  });
                  setNewNote('');
                }}
              >
                + Log reading
              </button>
            </div>
          </section>

          <section className="card">
            <h2 className="section-title">Brew day checklist</h2>
            {!recipe ? (
              <p className="empty-hint">The source recipe was deleted — checklist unavailable, measurements still work.</p>
            ) : (
              <>
                <div className="row-actions" style={{ marginBottom: 10 }}>
                  <span style={{ color: 'var(--ink-muted)', fontSize: 13 }}>
                    {session.stepsDone.length}/{steps.length} done
                  </span>
                  <button
                    className="btn sm"
                    disabled={deducted}
                    title="Subtract this recipe's ingredients from your inventory"
                    onClick={() => {
                      const matched = deductRecipe(recipe);
                      setDeducted(true);
                      onToast(matched > 0 ? `Deducted ${matched} inventory item${matched === 1 ? '' : 's'}` : 'No matching inventory items');
                    }}
                  >
                    {deducted ? 'Inventory deducted ✓' : '⤓ Deduct from inventory'}
                  </button>
                </div>
                <table className="ingredients">
                  <tbody>
                    {steps.map((step, i) => {
                      const phaseHeader = step.phase !== lastPhase;
                      lastPhase = step.phase;
                      return (
                        <React.Fragment key={i}>
                          {phaseHeader && (
                            <tr>
                              <td colSpan={3} style={{ paddingTop: 14 }}>
                                <span className="section-title" style={{ margin: 0 }}>{step.phase}</span>
                              </td>
                            </tr>
                          )}
                          <tr style={{ opacity: session.stepsDone.includes(i) ? 0.45 : 1 }}>
                            <td style={{ width: 30 }}>
                              <input
                                type="checkbox"
                                style={{ width: 'auto' }}
                                checked={session.stepsDone.includes(i)}
                                onChange={() => toggleStep(i)}
                              />
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{step.title}</div>
                              {step.detail && (
                                <div style={{ color: 'var(--ink-muted)', fontSize: 13 }}>{step.detail}</div>
                              )}
                            </td>
                            <td className="num" style={{ whiteSpace: 'nowrap' }}>
                              {step.timerMin ? <Timer minutes={step.timerMin} /> : null}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </section>

          <section className="card">
            <h2 className="section-title">Batch notes</h2>
            <textarea
              value={session.notes}
              placeholder="Fermentation observations, tasting notes, what to change next time…"
              onChange={(e) => patch({ notes: e.target.value })}
            />
          </section>
        </div>

        <div className="card stats-panel">
          <h2 className="section-title">Predicted vs actual</h2>
          <table className="ingredients">
            <thead>
              <tr>
                <th />
                <th className="num">Predicted</th>
                <th className="num">Actual</th>
              </tr>
            </thead>
            <tbody>
              {compare('OG', session.predicted.og.toFixed(3), session.measuredOg?.toFixed(3))}
              {compare('FG', session.predicted.fg.toFixed(3), session.measuredFg?.toFixed(3))}
              {compare('ABV %', session.predicted.abv.toFixed(1), abvActual?.toFixed(1))}
              {compare('Efficiency %', session.predicted.efficiencyPct.toFixed(0), eff?.toFixed(1))}
              {compare('Volume (gal)', session.predicted.batchSizeGal.toFixed(1), session.actualVolumeGal?.toFixed(1))}
              {compare(
                'Attenuation %',
                '—',
                session.measuredOg && session.measuredFg
                  ? actualAttenuationPct(session.measuredOg, session.measuredFg).toFixed(0)
                  : undefined,
              )}
            </tbody>
          </table>
          {eff !== undefined && Math.abs(eff - session.predicted.efficiencyPct) > 3 && (
            <p className="empty-hint" style={{ paddingBottom: 0 }}>
              Your measured efficiency is {eff.toFixed(0)}% — consider setting the recipe's efficiency to
              match for better predictions next time.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

