import type { ReactNode } from 'react';
import { COUNTIES } from '../../data/geo';
import { formatNumber } from '../../lib/format';

/** Collapsible table view: every chart has an accessible, exact alternative. */
export function TableView({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer font-stamp text-xs tracking-[0.18em] text-ink-soft uppercase">Táblázatos nézet</summary>
      <div className="mt-2 max-h-72 overflow-auto">
        <table className="w-full border-collapse font-terminal text-xs">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={h} scope="col" className={`border-b border-ink/40 px-2 py-1 ${i ? 'text-right' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={String(r[0])} className="odd:bg-ink/5">
                {r.map((c, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className="px-2 py-0.5 text-left font-normal">
                      {c}
                    </th>
                  ) : (
                    <td key={i} className="px-2 py-0.5 text-right tabular-nums">
                      {typeof c === 'number' ? formatNumber(c) : c}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/** Horizontal bars in HTML: label, bar, direct value label. One hue; labels carry identity. */
export function BarList({ items, label }: { items: { key: string; label: ReactNode; value: number }[]; label: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul aria-label={label} className="space-y-2">
      {items.map((item) => (
        <li key={item.key} className="grid grid-cols-[8.5rem_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[10rem_1fr_auto]">
          <span className="truncate">{item.label}</span>
          <span className="h-4 rounded-r bg-ink/10" aria-hidden="true">
            <span className="block h-full rounded-r bg-ink" style={{ width: `${(item.value / max) * 100}%` }} />
          </span>
          <span className="w-16 text-right font-terminal tabular-nums">{formatNumber(item.value)}</span>
        </li>
      ))}
    </ul>
  );
}

interface YearSeries {
  key: string;
  label: string;
  counts: Record<string, number>;
}

/**
 * Recruitments per year as small multiples (one row per source type) sharing the same
 * x and y scale – comparable without a categorical palette or a stacked chart.
 */
export function YearMultiples({ series, from, to }: { series: YearSeries[]; from: number; to: number }) {
  const years = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const max = Math.max(1, ...series.flatMap((s) => years.map((y) => s.counts[y] ?? 0)));
  const W = 640;
  const H = 70;
  const step = W / years.length;
  const barW = Math.max(1, step - 2);
  return (
    <div className="space-y-4">
      {series.map((s) => {
        const total = years.reduce((a, y) => a + (s.counts[y] ?? 0), 0);
        const peak = years.reduce((best, y) => ((s.counts[y] ?? 0) > (s.counts[best] ?? 0) ? y : best), from);
        return (
          <figure key={s.key}>
            <figcaption className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-stamp tracking-[0.15em] uppercase">{s.label}</span>
              <span className="font-terminal text-xs text-ink-soft">
                összesen {formatNumber(total)} · csúcs: {peak} ({formatNumber(s.counts[peak] ?? 0)})
              </span>
            </figcaption>
            <svg
              viewBox={`0 0 ${W} ${H + 20}`}
              className="h-auto w-full overflow-visible"
              role="img"
              aria-label={`${s.label}: beszervezések évenként ${from} és ${to} között, összesen ${total}, a legtöbb ${peak}-ben.`}
            >
              <line x1="0" x2={W} y1={H} y2={H} stroke="currentColor" strokeOpacity="0.35" />
              {years.map((y, i) => {
                const v = s.counts[y] ?? 0;
                const h = (v / max) * (H - 4);
                return (
                  <g key={y} className="group">
                    {/* Hit target taller and wider than the mark. */}
                    <rect x={i * step} y={0} width={step} height={H} fill="transparent">
                      <title>{`${y}: ${v} beszervezés`}</title>
                    </rect>
                    {v > 0 && (
                      <rect
                        x={i * step + 1}
                        y={H - h}
                        width={barW}
                        height={h}
                        rx={Math.min(2, barW / 2)}
                        className="pointer-events-none fill-ink transition-colors group-hover:fill-stamp"
                      />
                    )}
                    {y % 10 === 0 && (
                      <text x={i * step + step / 2} y={H + 17} textAnchor="middle" className="fill-ink-soft font-terminal text-[15px]">
                        {y}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </figure>
        );
      })}
    </div>
  );
}

/** Sequential single-hue ramp (light → dark) and the text colour that stays legible on each step. */
const RAMP = ['#f3e3d6', '#e8bfa9', '#d68d73', '#b9503d', '#8c1b15'] as const;
const RAMP_TEXT = ['#1d1b19', '#1d1b19', '#1d1b19', '#ffffff', '#ffffff'] as const;

function rampStep(value: number, max: number): number {
  if (value <= 0 || max <= 0) return -1;
  return Math.min(RAMP.length - 1, Math.floor((value / max) * RAMP.length));
}

/** County tile cartogram: approximate positions, one tile per county. Aggregates only. */
export function CountyTileMap({ counts }: { counts: Record<string, number> }) {
  const max = Math.max(0, ...Object.values(counts));
  const T = 100;
  const G = 6;
  const cols = 6;
  const rows = 4;
  const bucket = (i: number) => [Math.ceil((i / RAMP.length) * max), Math.floor(((i + 1) / RAMP.length) * max)];
  return (
    <div>
      <svg
        viewBox={`0 0 ${cols * T} ${rows * T}`}
        className="h-auto w-full max-w-2xl"
        role="img"
        aria-label="Sematikus megyetérkép a születési helyek megyénkénti számával; pontos értékek a táblázatos nézetben."
      >
        {COUNTIES.map((c) => {
          const v = counts[c.code] ?? 0;
          const s = rampStep(v, max);
          const x = c.col * T + G / 2;
          const y = c.row * T + G / 2;
          const size = T - G;
          return (
            <g key={c.code}>
              <title>{`${c.name}: ${formatNumber(v)}`}</title>
              <rect
                x={x}
                y={y}
                width={size}
                height={size}
                rx="4"
                fill={s < 0 ? 'transparent' : RAMP[s]}
                stroke={s < 0 ? 'currentColor' : 'none'}
                strokeOpacity="0.4"
                strokeDasharray={s < 0 ? '4 3' : undefined}
              />
              <text x={x + 8} y={y + 22} className="font-stamp text-[15px] font-medium tracking-wider" fill={s < 0 ? '#3d3934' : RAMP_TEXT[s]}>
                {c.code}
              </text>
              <text x={x + 8} y={y + size - 12} className="font-terminal text-[16px]" fill={s < 0 ? '#3d3934' : RAMP_TEXT[s]}>
                {formatNumber(v)}
              </text>
            </g>
          );
        })}
      </svg>
      <ul aria-label="Jelmagyarázat" className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {RAMP.map((color, i) => {
          const [lo, hi] = bucket(i);
          return (
            <li key={color} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-3 w-5 rounded-sm" style={{ background: color }} />
              <span className="font-terminal">
                {formatNumber(Math.max(1, lo ?? 0))}–{formatNumber(hi ?? 0)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
