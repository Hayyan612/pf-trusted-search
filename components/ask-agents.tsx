"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { AgentAvatar } from "@/components/agent-avatar";
import { getListing, priceLine } from "@/lib/data";
import { questionsFor } from "@/lib/questions";
import { useShortlist } from "@/lib/shortlist";

/** One confirm step for several agents at once. Nothing is sent until the person taps Send. */
export function AskAgents({ items, label }: { items: { id: string; toAsk: string[] }[]; label?: string }) {
  const router = useRouter();
  const { add, items: saved } = useShortlist();
  const [open, setOpen] = useState(false);
  const rows = items.map((it) => ({ l: getListing(it.id)!, qs: questionsFor(getListing(it.id)!, it.toAsk) })).filter((r) => r.l);
  const already = new Set(saved.map((s) => s.id));
  const fresh = rows.filter((r) => !already.has(r.l.id));

  const send = () => {
    const now = Date.now();
    fresh.forEach((r, i) => add({ id: r.l.id, requestedAt: now + i, questions: r.qs.map((q) => q.text) }));
    setOpen(false);
    toast.success(`Sent to ${fresh.length} ${fresh.length === 1 ? "agent" : "agents"}`, { description: "Answers will appear in your shortlist." });
    router.push("/shortlist");
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="lg" className="w-full" disabled={!fresh.length}>
          <Send /> {fresh.length ? label ?? `Ask all ${fresh.length} agents` : "Already asked these agents"}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto max-w-lg">
        <DrawerHeader className="text-left">
          <DrawerTitle>Scout will ask {fresh.length} {fresh.length === 1 ? "agent" : "agents"} for you</DrawerTitle>
          <DrawerDescription>Sent as you, through Property Finder. Each agent gets only the questions for their flat. Viewings and the deal stay with them.</DrawerDescription>
        </DrawerHeader>
        <div className="max-h-[55dvh] space-y-3 overflow-y-auto px-4">
          {fresh.map(({ l, qs }) => (
            <div key={l.id} className="rounded-xl border p-3">
              <div className="mb-2 flex items-center gap-2 text-[14px]">
                <AgentAvatar name={l.agent} image={l.agentImage} size={28} />
                <div className="min-w-0">
                  <div className="truncate font-medium">{l.agent}</div>
                  <div className="truncate text-[12px] text-muted-foreground">{priceLine(l)} · {l.beds}-bed · {l.size.toLocaleString()} sq ft</div>
                </div>
              </div>
              <ul className="space-y-1 text-[13px]">
                {qs.map((q) => (
                  <li key={q.id} className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-primary" /> {q.text}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <DrawerFooter>
          <Button onClick={send} disabled={!fresh.length}><Send /> Send to {fresh.length} {fresh.length === 1 ? "agent" : "agents"}</Button>
          <p className="text-center text-[12px] text-muted-foreground">Prototype: agents&apos; replies are simulated.</p>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
