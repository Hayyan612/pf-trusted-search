import { Card } from "@/components/ui/card";
import { Sparkles, Timer, TrendingUp, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getListing, priceLine } from "@/lib/data";
import { questionsFor } from "@/lib/questions";

// Two real listings from the audit, shown as they would arrive in the agent's app.
const SAMPLE = ["175116789", "177350300"];

export default function AgentPage() {
  const reqs = SAMPLE.map((id) => getListing(id)!).filter(Boolean);
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 pt-5 md:px-8 md:pt-10">
      <div>
        <div className="text-[12px] font-medium tracking-wide text-muted-foreground uppercase">What the agent sees</div>
        <h1 className="text-[22px] font-semibold tracking-tight">TrueUnit requests</h1>
        <p className="text-[14px] text-muted-foreground">
          In the agent&apos;s Property Finder app. Each request is a serious searcher with a budget, a move date and clear questions. One tap answers most of them.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border p-2"><Timer className="mx-auto size-4 text-primary" /><div className="text-[15px] font-semibold">14 min</div><div className="text-[11px] text-muted-foreground">your median reply</div></div>
        <div className="rounded-xl border p-2"><UserCheck className="mx-auto size-4 text-primary" /><div className="text-[15px] font-semibold">96%</div><div className="text-[11px] text-muted-foreground">answers that held at viewing</div></div>
        <div className="rounded-xl border p-2"><TrendingUp className="mx-auto size-4 text-primary" /><div className="text-[15px] font-semibold">Boost</div><div className="text-[11px] text-muted-foreground">confirmed ads rank higher</div></div>
      </div>
      <p className="text-[11px] text-muted-foreground">Example figures for the prototype.</p>

      <div className="grid gap-4 md:grid-cols-2">
      {reqs.map((l) => (
        <Card className="gap-3 p-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-primary"><Sparkles className="size-4" /> From a Scout user · budget fits · moving in December</div>
          <div className="text-[14px]"><b>{priceLine(l)}</b> · {l.beds} bed · {l.size.toLocaleString()} sq ft · ref {l.id}</div>
          <ul className="space-y-1 text-[13px]">
            {questionsFor(l).slice(0, 5).map((q) => <li key={q.id}>• {q.text}</li>)}
          </ul>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm">Available, same terms</Button>
            <Button size="sm" variant="outline">Propose viewing times</Button>
            <Button size="sm" variant="outline">Price or date changed</Button>
            <Button size="sm" variant="outline">Already {l.kind === "rent" ? "let" : "sold"}: remove ad</Button>
          </div>
        </Card>
      ))}
      </div>

      <div className="space-y-2 rounded-2xl bg-accent p-4 text-[13px]">
        <div className="font-semibold text-primary">Why an agent would answer</div>
        <p>Fewer time-wasting calls about flats that are gone. Searchers arrive already qualified. Quick, accurate answers raise the listing&apos;s rank and feed the SuperAgent score. Stale or bait ads lose rank instead of getting calls.</p>
      </div>
    </div>
  );
}
