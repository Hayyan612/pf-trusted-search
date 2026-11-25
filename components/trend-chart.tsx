import type { TrendPoint } from "@/lib/data";

/** Small two-line chart: Princess Tower vs Dubai Marina, AED, last 12 months (DataGuru). */
export function TrendChart({ points, unit }: { points: TrendPoint[]; unit: string }) {
  const W = 560, H = 160, P = { l: 44, r: 8, t: 10, b: 24 };
  const vals = points.flatMap((p) => [p.tower, p.community]).filter((v): v is number => typeof v === "number");
  if (points.length < 2 || vals.length === 0) return null;
  const min = Math.min(...vals) * 0.95, max = Math.max(...vals) * 1.03;
  const x = (i: number) => P.l + (i * (W - P.l - P.r)) / (points.length - 1);
  const y = (v: number) => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);
  const line = (k: "tower" | "community") =>
    points.map((p, i) => (typeof p[k] === "number" ? `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p[k] as number).toFixed(1)}` : "")).join(" ");
  const fmt = (v: number) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${Math.round(v / 1000)}K`);
  const ticks = [min, (min + max) / 2, max];
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[320px]" role="img" aria-label={`Average ${unit}, Princess Tower and Dubai Marina, last 12 months`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="currentColor" className="text-border" strokeWidth={1} />
            <text x={P.l - 6} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{fmt(t)}</text>
          </g>
        ))}
        <path d={line("community")} fill="none" stroke="var(--warn)" strokeWidth={2} strokeDasharray="4 4" />
        <path d={line("tower")} fill="none" stroke="var(--primary)" strokeWidth={2.5} />
        {points.map((p, i) => (i % 3 === 0 || i === points.length - 1) && (
          <text key={p.period} x={x(i)} y={H - 6} textAnchor="middle" className="fill-muted-foreground text-[10px]">{p.period.replace(" 20", " '")}</text>
        ))}
      </svg>
      <div className="mt-1 flex gap-4 text-[12px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-primary" /> Princess Tower</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed border-[var(--warn)]" /> Dubai Marina</span>
      </div>
    </div>
  );
}
