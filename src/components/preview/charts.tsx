import { PCard } from "./parts";

const SERIES = [
  ["Brand", "--b-500"],
  ["Info", "--i-500"],
  ["Success", "--s-500"],
  ["Warning", "--w-500"],
  ["Danger", "--d-500"],
] as const;

const A = [18, 30, 24, 44, 38, 56, 50, 68, 60, 78];
const B = [10, 16, 22, 20, 30, 28, 40, 38, 48, 52];

/** Scale a series to fill a small sparkline box with padding. */
const spark = (v: readonly number[], w = 100, h = 40, pad = 5) => {
  const min = Math.min(...v);
  const span = Math.max(...v) - min || 1;
  return v.map((y, i) => `${(i / (v.length - 1)) * w},${h - pad - ((y - min) / span) * (h - 2 * pad)}`).join(" ");
};

const line = (v: number[], w = 300, h = 100) => v.map((y, i) => `${(i / (v.length - 1)) * w},${h - y}`).join(" ");

function Legend({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--p-muted)">
      {items.map(([n, v]) => (
        <li key={n} className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-sm" style={{ background: `var(${v})` }} />
          {n}
        </li>
      ))}
    </ul>
  );
}

function Heat() {
  const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const rows = 7;
  const cols = 14;
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} role="img" aria-label="Activity heatmap using the brand scale from light to dark">
      {Array.from({ length: rows * cols }, (_, i) => {
        const v = Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.31));
        return <span key={i} className="aspect-square rounded-[3px]" style={{ background: `var(--b-${stops[Math.min(stops.length - 1, Math.floor(v * stops.length))]})` }} />;
      })}
    </div>
  );
}

function Rings() {
  const rings = [
    [44, "--b-500", 0.78],
    [32, "--i-500", 0.55],
    [20, "--s-500", 0.35],
  ] as const;
  return (
    <svg viewBox="0 0 100 100" className="mx-auto size-36" role="img" aria-label="Radial progress: 78, 55 and 35 percent">
      <g transform="rotate(-90 50 50)" fill="none" strokeLinecap="round" strokeWidth="8">
        {rings.map(([r, v, p]) => {
          const c = 2 * Math.PI * r;
          return (
            <g key={v}>
              <circle cx="50" cy="50" r={r} stroke="var(--p-surface-2)" />
              <circle cx="50" cy="50" r={r} stroke={`var(${v})`} strokeDasharray={`${c * p} ${c}`} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export function Charts() {
  return (
    <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
      <PCard className="md:col-span-2">
        <p className="text-sm font-medium">Area and line</p>
        <svg viewBox="0 0 300 100" className="mt-3 h-44 w-full" role="img" aria-label="Area chart of two series trending upward">
          {[25, 50, 75].map((y) => (
            <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="var(--p-border)" />
          ))}
          <polygon points={`0,100 ${line(A)} 300,100`} fill="var(--b-500)" opacity="0.18" />
          <polyline points={line(A)} fill="none" stroke="var(--b-500)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={line(B)} fill="none" stroke="var(--i-500)" strokeWidth="2.5" strokeDasharray="5 4" strokeLinecap="round" />
        </svg>
        <Legend items={[SERIES[0], SERIES[1]]} />
      </PCard>

      <PCard>
        <p className="text-sm font-medium">Categorical palette</p>
        <svg viewBox="0 0 100 100" className="mx-auto mt-3 size-36" role="img" aria-label="Pie chart in five categorical colors">
          {(() => {
            const vals = [32, 24, 20, 14, 10];
            let acc = 0;
            return vals.map((v, i) => {
              const a0 = (acc / 100) * 2 * Math.PI - Math.PI / 2;
              acc += v;
              const a1 = (acc / 100) * 2 * Math.PI - Math.PI / 2;
              const p = (a: number) => `${50 + 46 * Math.cos(a)},${50 + 46 * Math.sin(a)}`;
              return <path key={i} d={`M50,50 L${p(a0)} A46,46 0 ${v > 50 ? 1 : 0} 1 ${p(a1)} Z`} fill={`var(${SERIES[i]![1]})`} stroke="var(--p-surface)" strokeWidth="1.5" />;
            });
          })()}
        </svg>
        <Legend items={SERIES} />
      </PCard>

      <PCard>
        <p className="text-sm font-medium">Grouped bars</p>
        <svg viewBox="0 0 300 100" className="mt-3 h-40 w-full" role="img" aria-label="Grouped bar chart, two series over six periods">
          {A.slice(0, 6).map((v, i) => (
            <g key={i}>
              <rect x={12 + i * 48} y={100 - v} width="16" height={v} rx="3" fill="var(--b-500)" />
              <rect x={30 + i * 48} y={100 - B[i]!} width="16" height={B[i]} rx="3" fill="var(--i-400)" />
            </g>
          ))}
        </svg>
        <Legend items={[SERIES[0], SERIES[1]]} />
      </PCard>

      <PCard>
        <p className="text-sm font-medium">Radial progress</p>
        <Rings />
        <Legend items={[SERIES[0], SERIES[1], SERIES[2]]} />
      </PCard>

      <PCard>
        <p className="text-sm font-medium">Sequential scale heatmap</p>
        <div className="mt-3">
          <Heat />
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-(--p-muted)">
          Less
          <span className="flex">
            {[100, 300, 500, 700, 900].map((s) => (
              <span key={s} className="h-3 w-6 first:rounded-l last:rounded-r" style={{ background: `var(--b-${s})` }} />
            ))}
          </span>
          More
        </div>
      </PCard>

      <PCard className="md:col-span-2 xl:col-span-3">
        <p className="mb-3 text-sm font-medium">Status sparklines</p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["Uptime", "success", [30, 34, 33, 40, 38, 44, 46]],
              ["Latency", "warning", [44, 38, 46, 36, 42, 30, 34]],
              ["Errors", "danger", [12, 18, 14, 28, 22, 34, 30]],
              ["Requests", "info", [20, 26, 24, 32, 36, 42, 50]],
            ] as const
          ).map(([label, tone, v]) => (
            <li key={label} className="rounded-xl border p-3" style={{ background: `var(--p-${tone}-bg)`, borderColor: `var(--p-${tone}-bd)`, color: `var(--p-${tone}-fg)` }}>
              <p className="text-sm font-medium">{label}</p>
              <svg viewBox="0 0 100 40" className="mt-2 h-10 w-full" aria-hidden>
                <polyline points={spark(v)} fill="none" stroke={`var(--p-${tone}-solid)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </li>
          ))}
        </ul>
      </PCard>
    </div>
  );
}
