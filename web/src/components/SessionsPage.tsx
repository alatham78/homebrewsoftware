import { actualAbv, type BrewSession } from '@brewhaus/core';

const STATUS_ICONS: Record<string, string> = {
  planned: '📝',
  'brew day': '🔥',
  fermenting: '🫧',
  conditioning: '🕰',
  completed: '✅',
};

interface Props {
  sessions: BrewSession[];
  onOpen: (session: BrewSession) => void;
}

export function SessionsPage({ sessions, onOpen }: Props) {
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Batches</h1>
          <p className="page-sub">
            {sessions.length} brew session{sessions.length === 1 ? '' : 's'} — start one from any
            recipe with “Brew day”
          </p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="card">
          <p className="empty-hint">
            No batches yet. Open a recipe and hit <strong>🔥 Brew day</strong> to generate a
            step-by-step checklist and start logging measurements.
          </p>
        </div>
      ) : (
        <div className="card">
          <table className="ingredients">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Status</th>
                <th>Brewed</th>
                <th className="num">OG (pred → act)</th>
                <th className="num">FG</th>
                <th className="num">ABV %</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => onOpen(s)}>
                  <td>
                    <strong>{s.recipeName}</strong>
                    <div style={{ color: 'var(--ink-muted)', fontSize: 13 }}>{s.styleName}</div>
                  </td>
                  <td>
                    {STATUS_ICONS[s.status] ?? ''} {s.status}
                  </td>
                  <td>{s.brewDate}</td>
                  <td className="num">
                    {s.predicted.og.toFixed(3)} → {s.measuredOg ? s.measuredOg.toFixed(3) : '—'}
                  </td>
                  <td className="num">{s.measuredFg ? s.measuredFg.toFixed(3) : '—'}</td>
                  <td className="num">
                    {s.measuredOg && s.measuredFg
                      ? actualAbv(s.measuredOg, s.measuredFg).toFixed(1)
                      : s.predicted.abv.toFixed(1) + ' (est)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
