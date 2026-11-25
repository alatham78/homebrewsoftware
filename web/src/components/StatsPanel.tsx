import {
  srmColorName,
  srmToEbc,
  srmToHex,
  styleById,
  type RecipeStats,
  type StyleRange,
} from '@brewhaus/core';
import { useTweened } from '../lib/useTweened';
import { BeerMug } from './BeerMug';

/**
 * Recipe vitals as stat tiles, each with a range meter showing where the
 * value sits inside the selected style's guideline range. Out-of-range
 * state is flagged with a text label ("low"/"high"), never color alone.
 */

interface TileSpec {
  label: string;
  value: number;
  format: (v: number) => string;
  unit?: string;
  range: StyleRange;
  formatBound: (v: number) => string;
  pinColor?: string;
}

function RangeMeter({ value, range, formatBound }: Pick<TileSpec, 'value' | 'range' | 'formatBound'> & { pinColor?: string }) {
  const span = range.max - range.min;
  // Pad the scale 25% beyond the style range so out-of-range pins stay visible.
  const lo = range.min - span * 0.25;
  const hi = range.max + span * 0.25;
  const pct = Math.min(100, Math.max(0, ((value - lo) / (hi - lo)) * 100));
  const startPct = ((range.min - lo) / (hi - lo)) * 100;
  const endPct = ((range.max - lo) / (hi - lo)) * 100;
  const inRange = value >= range.min && value <= range.max;
  const flag = inRange ? '✓ in style' : value < range.min ? '▼ low' : '▲ high';

  return (
    <>
      <div className="meter" role="img" aria-label={`${formatBound(value)}, style range ${formatBound(range.min)} to ${formatBound(range.max)}, ${flag}`}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${startPct}%`,
            width: `${endPct - startPct}%`,
            background: 'var(--surface-3)',
            borderRadius: 3,
          }}
        />
        <span
          className="pin"
          style={{ left: `${pct}%`, background: inRange ? 'var(--meter-in)' : 'var(--meter-out)' }}
        />
      </div>
      <div className="meter-note">
        <span>{formatBound(range.min)}</span>
        <span>{formatBound(range.max)}</span>
      </div>
    </>
  );
}

function StatTile({ label, value, format, unit, range, formatBound, pinColor }: TileSpec) {
  const inRange = value >= range.min && value <= range.max;
  const flag = inRange ? '✓ in style' : value < range.min ? '▼ low' : '▲ high';
  return (
    <div className="stat-tile">
      <div className="label-row">
        <span className="label">{label}</span>
        <span className={`meter-flag ${inRange ? 'in' : 'out'}`}>{flag}</span>
      </div>
      <div className="value">
        {pinColor && <span className="srm-chip" style={{ background: pinColor }} />}
        {format(value)}
        {unit && <small>{unit}</small>}
      </div>
      <RangeMeter value={value} range={range} formatBound={formatBound} />
    </div>
  );
}

export function StatsPanel({ stats, styleId }: { stats: RecipeStats; styleId: string }) {
  const style = styleById(styleId) ?? styleById('freestyle')!;
  const sg = (v: number) => v.toFixed(3);
  const one = (v: number) => v.toFixed(1);
  const whole = (v: number) => Math.round(v).toString();
  const shownSrm = useTweened(stats.srm, 1000);
  const srmInStyle = stats.srm >= style.srm.min && stats.srm <= style.srm.max;

  const tiles: TileSpec[] = [
    { label: 'Original gravity', value: stats.og, format: sg, range: style.og, formatBound: sg },
    { label: 'Final gravity', value: stats.fg, format: sg, range: style.fg, formatBound: sg },
    { label: 'Alcohol', value: stats.abv, format: one, unit: '% ABV', range: style.abv, formatBound: one },
    { label: 'Bitterness', value: stats.ibu, format: whole, unit: 'IBU', range: style.ibu, formatBound: whole },
    { label: 'Color', value: stats.srm, format: one, unit: 'SRM', range: style.srm, formatBound: whole, pinColor: srmToHex(shownSrm) },
  ];

  return (
    <div className="card stats-panel">
      <div className="mug-hero" style={{ ['--beer-glow' as string]: `${srmToHex(shownSrm)}40` }}>
        <BeerMug
          srm={shownSrm}
          label={`Beer color: ${srmColorName(stats.srm)}, ${stats.srm.toFixed(1)} SRM`}
        />
        <div className="mug-info">
          <span className="label">Color</span>
          <div className="mug-srm">
            {shownSrm.toFixed(1)}
            <small>SRM</small>
          </div>
          <div className="mug-name">{srmColorName(shownSrm)}</div>
          <div className="mug-meta">{srmToEbc(shownSrm).toFixed(0)} EBC</div>
          <div className="mug-meta">
            Style {whole(style.srm.min)}–{whole(style.srm.max)} SRM{' '}
            <span className={`meter-flag ${srmInStyle ? 'in' : 'out'}`}>
              {srmInStyle ? '✓' : stats.srm < style.srm.min ? '▼ low' : '▲ high'}
            </span>
          </div>
        </div>
      </div>
      <h2 className="section-title">Vitals · {style.name}</h2>
      <div className="stat-grid">
        {tiles.map((t) => (
          <StatTile key={t.label} {...t} />
        ))}
        <div className="stat-tile">
          <div className="label-row">
            <span className="label">Calories</span>
            <span className="label">BU:GU {stats.buGu.toFixed(2)}</span>
          </div>
          <div className="value">
            {Math.round(stats.calories)}
            <small>/12 oz</small>
          </div>
          <div className="meter-note">
            <span>{stats.totalGrainLb.toFixed(1)} lb grain bill</span>
          </div>
        </div>
      </div>
    </div>
  );
}
