import { useId } from 'react';
import { srmToHex } from '@brewhaus/core';

const mix = (a: string, b: string, t: number): string => {
  const ca = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const cb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${ca
    .map((c, k) => Math.round(c + (cb[k]! - c) * t).toString(16).padStart(2, '0'))
    .join('')}`;
};

/** Head color: bright white on pale beers, toasted tan on stouts. */
const foamColor = (srm: number): string =>
  mix('#FBF6EA', '#D6B07E', Math.min(1, Math.max(0, (srm - 6) / 30)));

const BUBBLES = [
  { x: 44, r: 1.8, delay: 0, dur: 3.2 },
  { x: 58, r: 1.3, delay: 1.1, dur: 2.6 },
  { x: 71, r: 2.1, delay: 0.5, dur: 3.6 },
  { x: 84, r: 1.5, delay: 1.8, dur: 2.9 },
  { x: 93, r: 1.2, delay: 0.9, dur: 3.1 },
];

/**
 * A dimpled beer mug filled with the color for `srm`. The parent animates
 * `srm`; this component just draws whatever value it is given.
 */
export function BeerMug({ srm, label }: { srm: number; label: string }) {
  const id = useId().replace(/:/g, '');
  const beer = srmToHex(srm);
  const foam = foamColor(srm);

  return (
    <svg
      className="beer-mug"
      viewBox="0 0 156 184"
      role="img"
      aria-label={label}
    >
      <defs>
        <clipPath id={`${id}-inside`}>
          <rect x="25" y="44" width="80" height="118" rx="9" />
        </clipPath>
        <linearGradient id={`${id}-depth`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.32" />
          <stop offset="0.35" stopColor="#000" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0.05" />
          <stop offset="1" stopColor="#000" stopOpacity="0.38" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* Handle, drawn first so the body overlaps its ends */}
      <path
        d="M110 64 h8 a24 24 0 0 1 24 24 v28 a24 24 0 0 1 -24 24 h-8"
        fill="none"
        stroke="var(--glass-edge)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M110 64 h8 a24 24 0 0 1 24 24 v28 a24 24 0 0 1 -24 24 h-8"
        fill="none"
        stroke="var(--glass-fill)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Beer */}
      <g clipPath={`url(#${id}-inside)`}>
        <rect x="25" y="56" width="80" height="106" fill={beer} />
        <rect x="25" y="56" width="80" height="106" fill={`url(#${id}-depth)`} />
        {BUBBLES.map((b, i) => (
          <circle
            key={i}
            className="beer-bubble"
            cx={b.x}
            cy="156"
            r={b.r}
            style={{ animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}
          />
        ))}
      </g>

      {/* Glass body over the beer */}
      <rect
        x="18"
        y="38"
        width="94"
        height="132"
        rx="15"
        fill="var(--glass-fill)"
        stroke="var(--glass-edge)"
        strokeWidth="4"
      />
      {/* Thick glass base */}
      <rect x="22" y="160" width="86" height="7" rx="3.5" fill="var(--glass-edge)" opacity="0.7" />
      {/* Dimples and highlight */}
      <rect x="33" y="66" width="7" height="86" rx="3.5" fill={`url(#${id}-shine)`} />
      <rect x="64" y="68" width="3" height="82" rx="1.5" fill="#fff" opacity="0.08" />
      <rect x="88" y="68" width="3" height="82" rx="1.5" fill="#fff" opacity="0.06" />

      {/* Head, domed slightly over the rim */}
      <g fill={foam}>
        <rect x="21" y="40" width="88" height="19" rx="6" />
        <circle cx="31" cy="38" r="11" />
        <circle cx="48" cy="32" r="14" />
        <circle cx="67" cy="30" r="13" />
        <circle cx="86" cy="33" r="14" />
        <circle cx="101" cy="39" r="10" />
        <circle cx="34" cy="58" r="4.5" />
        <circle cx="52" cy="59.5" r="4" />
        <circle cx="70" cy="58.5" r="5" />
        <circle cx="90" cy="59" r="4" />
      </g>
      <circle cx="56" cy="28" r="4" fill="#fff" opacity="0.45" />
    </svg>
  );
}
