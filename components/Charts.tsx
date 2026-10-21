import type { Estimate, PhaseKey } from "@/lib/engine.ts";

export const PHASE_COLORS: Record<PhaseKey, string> = {
  pre: "#c9ced4",
  prod: "#2398ad",
  post: "#f2692c",
};

export const MIX_COLORS = {
  platform: "#2398ad",
  crew: "#f2692c",
  overhead: "#c9ced4",
};

/** Row of vertical bars split proportionally between segments (budget bars in the reference). */
export function MixBars({
  segments,
  count = 34,
  height = 88,
  animate = true,
}: {
  segments: { value: number; color: string }[];
  count?: number;
  height?: number;
  animate?: boolean;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const bars: string[] = [];
  let acc = 0;
  let seg = 0;
  for (let i = 0; i < count; i++) {
    const at = ((i + 0.5) / count) * total;
    while (seg < segments.length - 1 && at > acc + segments[seg].value) {
      acc += segments[seg].value;
      seg++;
    }
    bars.push(segments[seg]?.color ?? "#e3e5e8");
  }
  return (
    <div className="flex items-end justify-between gap-[3px]" style={{ height }} aria-hidden="true">
      {bars.map((c, i) => (
        <span
          key={i}
          className={`block h-full flex-1 rounded-full transition-colors duration-500 ${animate ? "grow-y" : ""}`}
          style={{ background: c, maxWidth: 12, animationDelay: `${i * 18}ms`, transitionDelay: `${i * 12}ms` }}
        />
      ))}
    </div>
  );
}

/** Nested half-arcs sharing one start point; each ends where a phase finishes. */
export function PhaseArcs({ est, className, animate = true }: { est: Estimate; className?: string; animate?: boolean }) {
  const W = 440;
  const H = 240;
  const base = 222;
  const x0 = 14;
  const span = W - 28;
  const total = est.workDays || 1;
  const ends = [
    est.phases.pre.days / total,
    (est.phases.pre.days + est.phases.prod.days) / total,
    1,
  ].map((f) => Math.max(f, 0.18));
  const colors = [PHASE_COLORS.pre, PHASE_COLORS.prod, PHASE_COLORS.post];
  // re-mount (and so re-draw) the arcs whenever the phase split changes
  const key = ends.map((f) => f.toFixed(3)).join("-");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true">
      <defs>
        <linearGradient id="arc-fill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#2398ad" stopOpacity="0.14" />
        </linearGradient>
        {colors.map((c, i) => (
          <linearGradient key={i} id={`arc-s${i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c9ced4" />
            <stop offset="1" stopColor={c} />
          </linearGradient>
        ))}
      </defs>
      {ends
        .map((f, i) => {
          const r = (span * f) / 2;
          const x1 = x0 + 2 * r;
          const ry = Math.min(r, base - 10);
          const d = `M ${x0} ${base} A ${r} ${ry} 0 0 1 ${x1} ${base}`;
          return (
            <g key={`${key}-${i}`}>
              {i === 2 && <path d={`${d} Z`} fill="url(#arc-fill)" className={animate ? "fade-in" : ""} />}
              <path
                d={d}
                fill="none"
                pathLength={1}
                stroke={`url(#arc-s${i})`}
                strokeWidth={i === 2 ? 2.4 : 1.6}
                className={animate ? "draw" : ""}
                style={{ animationDelay: `${i * 140}ms` }}
              />
              <circle
                cx={x1}
                cy={base}
                r="4.5"
                fill={colors[i]}
                className={animate ? "pop" : ""}
                style={{ animationDelay: `${700 + i * 140}ms`, transformBox: "fill-box", transformOrigin: "center" }}
              />
            </g>
          );
        })
        .reverse()}
      <circle cx={x0} cy={base} r="4.5" fill="#9aa1a9" />
    </svg>
  );
}

/** Cumulative spend (orange area) and daily burn rate (teal line) across work days. */
export function SpendCurve({ est, className, animate = true }: { est: Estimate; className?: string; animate?: boolean }) {
  const W = 420;
  const H = 180;
  const pad = 10;
  const order: PhaseKey[] = ["pre", "prod", "post"];
  const total = est.total || 1;
  const days = est.workDays || 1;
  const maxDaily = Math.max(...order.map((k) => est.phases[k].daily.total)) || 1;

  const X = (d: number) => pad + (d / days) * (W - pad * 2);
  const Ycum = (v: number) => H - pad - (v / total) * (H - pad * 2 - 18);
  const Yrate = (v: number) => H - pad - (v / maxDaily) * (H - pad * 2) * 0.55;

  const cum: [number, number][] = [[X(0), Ycum(0)]];
  const rate: [number, number][] = [];
  const marks: { x: number; y: number }[] = [];
  let d = 0;
  let spent = 0;
  for (const k of order) {
    const ph = est.phases[k];
    const start = d;
    d += ph.days;
    spent += ph.total;
    cum.push([X(d), Ycum(spent)]);
    rate.push([X(start), Yrate(ph.daily.total)], [X(d), Yrate(ph.daily.total)]);
    marks.push({ x: X(d), y: Ycum(spent) });
  }

  const smooth = (pts: [number, number][]) => {
    let s = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = pts[i - 1];
      const [x, y] = pts[i];
      const mx = (px + x) / 2;
      s += ` C ${mx} ${py}, ${mx} ${y}, ${x} ${y}`;
    }
    return s;
  };

  const cumPath = smooth(cum);
  const area = `${cumPath} L ${X(days)} ${H - pad} L ${X(0)} ${H - pad} Z`;
  const peak = marks[1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sc-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2692c" stopOpacity="0.28" />
          <stop offset="1" stopColor="#f2692c" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: 9 }, (_, i) => (
        <line
          key={i}
          x1={pad + (i / 8) * (W - pad * 2)}
          x2={pad + (i / 8) * (W - pad * 2)}
          y1={pad}
          y2={H - pad}
          stroke="#c9ced4"
          strokeDasharray="1 7"
          strokeLinecap="round"
        />
      ))}
      <g key={cumPath}>
        <path d={area} fill="url(#sc-area)" className={animate ? "fade-in" : ""} />
        <path
          d={smooth(rate)}
          fill="none"
          stroke="#2398ad"
          strokeWidth="2"
          opacity="0.85"
          pathLength={1}
          className={animate ? "draw" : ""}
        />
        <path d={cumPath} fill="none" stroke="#f2692c" strokeWidth="2.4" pathLength={1} className={animate ? "draw" : ""} />
        {peak && (
          <>
            <circle
              cx={peak.x}
              cy={peak.y}
              r="9"
              fill="#f2692c"
              opacity="0.18"
              className={animate ? "ping-soft" : ""}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
            <circle cx={peak.x} cy={peak.y} r="4.5" fill="#f2692c" stroke="#fff" strokeWidth="2" />
          </>
        )}
      </g>
    </svg>
  );
}

/** One square per work day, coloured by phase (the milestone grid in the reference). */
export function DayGrid({ est, animate = true }: { est: Estimate; animate?: boolean }) {
  const cells: PhaseKey[] = [];
  for (const k of ["pre", "prod", "post"] as PhaseKey[]) {
    const n = Math.max(0, Math.round(est.phases[k].days));
    for (let i = 0; i < n; i++) cells.push(k);
  }
  const n = cells.length || 1;
  const cols = n <= 36 ? 6 : n <= 80 ? 10 : n <= 150 ? 14 : n <= 260 ? 18 : 24;
  const gap = cols <= 6 ? 8 : cols <= 10 ? 6 : 4;
  const radius = cols <= 6 ? 8 : cols <= 10 ? 6 : 3;
  const step = Math.min(14, 700 / n);
  const key = PHASES_KEY(est);
  return (
    <div
      className="grid w-full"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap }}
      aria-hidden="true"
    >
      {cells.map((k, i) => (
        <span
          key={`${key}-${i}`}
          className={`block aspect-[4/3] ${animate ? "pop" : ""}`}
          style={{
            background: k === "pre" ? "#e4e6e9" : PHASE_COLORS[k],
            borderRadius: radius,
            animationDelay: `${Math.round(i * step)}ms`,
          }}
        />
      ))}
    </div>
  );
}

const PHASES_KEY = (est: Estimate) =>
  [est.phases.pre.days, est.phases.prod.days, est.phases.post.days].map((d) => Math.round(d)).join("-");
