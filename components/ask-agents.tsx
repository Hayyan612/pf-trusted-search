"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { AgentAvatar } from "@/components/agent-avatar";
import { getListing, priceLine } from "@/lib/data";
import { questionsFor } from "@/lib/questions";
import { useShortlist } from "@/lib/shortlist";
import { ContactConsent } from "@/components/contact-consent";
import { CHANNEL_LABEL, contactProblem, useContact } from "@/lib/contact";
import { draftMessage } from "@/lib/message";
import { useBrief } from "@/lib/brief-store";
import { Copy } from "lucide-react";

/** One confirm step for several agents at once. Nothing is sent until the person taps Send. */
export function AskAgents({ items, label }: { items: { id: string; toAsk: string[] }[]; label?: string }) {
  const router = useRouter();
  const { add, items: saved } = useShortlist();
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const contact = useContact();
  const brief = useBrief();
  const problem = contactProblem(contact) ?? (consent ? null : "Tick the box to share your details with these agents.");
  const rows = items.map((it) => ({ l: getListing(it.id)!, qs: questionsFor(getListing(it.id)!, it.toAsk) })).filter((r) => r.l);
  const already = new Set(saved.map((s) => s.id));
  const fresh = rows.filter((r) => !already.has(r.l.id));

  const send = () => {
    const now = Date.now();
    if (problem) return;
    const who = { name: contact.name.trim(), channel: CHANNEL_LABEL[contact.channel] };
    fresh.forEach((r, i) => add({ id: r.l.id, requestedAt: now + i, questions: r.qs.map((q) => q.text), contact: who, note: draftMessage(r.l, r.qs.map((q) => q.text), { name: contact.name, brief }) }));
    setOpen(false);
    toast.success(`Sent to ${fresh.length} ${fresh.length === 1 ? "agent" : "agents"}`, { description: "Scout will post their answers in your thread." });
    if (window.location.pathname !== "/assistant") router.push("/shortlist?sent=1");
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
              <pre className="text-[13px] leading-relaxed whitespace-pre-wrap font-sans">{draftMessage(l, qs.map((q) => q.text), { name: contact.name, brief })}</pre>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 text-[12px] text-primary underline-offset-4 hover:underline"
                onClick={() => {
                  const text = draftMessage(l, qs.map((q) => q.text), { name: contact.name, brief });
                  navigator.clipboard?.writeText(text).then(() => toast.success("Message copied")).catch(() => toast("Select the text to copy it"));
                }}
              >
                <Copy className="size-3.5" /> Copy message
              </button>
            </div>
          ))}
          <ContactConsent agents={fresh.length} consent={consent} onConsent={setConsent} />
        </div>
        <DrawerFooter>
          {problem && <p className="text-center text-[12px] text-amber-700">{problem}</p>}
          <Button onClick={send} disabled={!fresh.length || Boolean(problem)}><Send /> Send to {fresh.length} {fresh.length === 1 ? "agent" : "agents"}</Button>
          <p className="text-center text-[12px] text-muted-foreground">Prototype: agents&apos; replies are simulated.</p>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
