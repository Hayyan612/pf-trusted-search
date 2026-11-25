"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TrendPoint } from "@/lib/data";

const config = {
  tower: { label: "Princess Tower", color: "var(--primary)" },
  community: { label: "Dubai Marina", color: "var(--warn)" },
} satisfies ChartConfig;

const short = (v: number) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${Math.round(v / 1000)}K`);

/** DataGuru price trend for this bedroom count: Princess Tower against Dubai Marina, with 1Y / 2Y / 5Y. */
export function PriceTrend({ series }: { series: Record<string, TrendPoint[]> }) {
  const frames = ["1Y", "2Y", "5Y"].filter((f) => (series[f]?.length ?? 0) > 1);
  const [tf, setTf] = useState(frames[0] ?? "1Y");
  const data = series[tf] ?? [];
  if (!frames.length) return null;
  const first = data.find((d) => d.tower)?.tower, last = [...data].reverse().find((d) => d.tower)?.tower;
  const change = first && last ? Math.round((100 * (last - first)) / first) : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {change !== null && (
          <p className="text-[13px] text-muted-foreground">
            Princess Tower <b className={change < 0 ? "text-red-600" : "text-emerald-700"}>{change > 0 ? "+" : ""}{change}%</b> over {tf === "1Y" ? "1 year" : tf === "2Y" ? "2 years" : "5 years"}
          </p>
        )}
        <Tabs value={tf} onValueChange={setTf}>
          <TabsList>
            {frames.map((f) => <TabsTrigger key={f} value={f}>{f}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      </div>
      <ChartContainer config={config} className="aspect-auto h-56 w-full">
        <LineChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} tickFormatter={(v: string) => v.replace(" 20", " '")} />
          <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={short} domain={["auto", "auto"]} />
          <ChartTooltip
            cursor
            content={<ChartTooltipContent formatter={(value, name) => (
              <div className="flex w-full justify-between gap-4">
                <span className="text-muted-foreground">{config[name as keyof typeof config]?.label ?? name}</span>
                <span className="font-medium tabular-nums">AED {Number(value).toLocaleString("en-US")}</span>
              </div>
            )} />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Line dataKey="tower" type="monotone" stroke="var(--color-tower)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} connectNulls />
          <Line dataKey="community" type="monotone" stroke="var(--color-community)" strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={{ r: 4 }} connectNulls />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
