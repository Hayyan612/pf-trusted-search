"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Phone, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { questionsFor } from "@/lib/questions";
import { useShortlist } from "@/lib/shortlist";
import { ContactConsent } from "@/components/contact-consent";
import { CHANNEL_LABEL, contactProblem, useContact } from "@/lib/contact";
import type { Listing } from "@/lib/data";
import { cn } from "@/lib/utils";

export function ConfirmBar({ listing, inline = false }: { listing: Listing; inline?: boolean }) {
  const router = useRouter();
  const { add } = useShortlist();
  const [qs, setQs] = useState(() => questionsFor(listing));
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const contact = useContact();
  const problem = contactProblem(contact) ?? (consent ? null : "Tick the box to share your details with this agent.");

  const send = () => {
    if (problem) return;
    add({ id: listing.id, requestedAt: Date.now(), questions: qs.filter((q) => q.on).map((q) => q.text), note: note || undefined, contact: { name: contact.name.trim(), channel: CHANNEL_LABEL[contact.channel] } });
    setOpen(false);
    toast.success(`Sent to ${listing.agent}`, { description: "Scout will bring the answers to your shortlist." });
    router.push("/shortlist?sent=1");
  };

  return (
    <div className={inline ? "hidden gap-2 md:grid md:grid-cols-2" : "fixed inset-x-0 bottom-[57px] z-20 flex gap-2 border-t bg-white px-4 py-3 md:hidden"}>
      <Button
        variant="outline"
        className={inline ? "order-2 col-span-2 w-full border-white/40 bg-white text-primary hover:bg-white/90" : "flex-1"}
        onClick={() => toast("You can always call the agent directly", { description: `${listing.agent}, ${listing.broker}. In the real app this opens the call or WhatsApp.` })}
      >
        <Phone className="size-4" /> Call agent
      </Button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button className={inline ? "order-1 col-span-2 w-full bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90" : "flex-[1.4]"} size={inline ? "lg" : "default"}>
            <Sparkles className="size-4" /> Confirm before I call
          </Button>
        </DrawerTrigger>
        <DrawerContent className="mx-auto max-w-md">
          <DrawerHeader className="text-left">
            <DrawerTitle>Scout will ask {listing.agent}</DrawerTitle>
            <DrawerDescription>
              Sent as you, through Property Finder. The agent answers in their app; the deal stays between you and them.
            </DrawerDescription>
          </DrawerHeader>
          <div className="max-h-[50dvh] space-y-2 overflow-y-auto px-4">
            {qs.map((q, i) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setQs((prev) => prev.map((p, j) => (j === i ? { ...p, on: !p.on } : p)))}
                className={cn("flex w-full items-start gap-3 rounded-xl border p-3 text-left text-[14px]", q.on ? "border-primary/40 bg-accent" : "opacity-60")}
              >
                <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border", q.on && "border-primary bg-primary text-white")}>
                  {q.on && <Check className="size-3.5" />}
                </span>
                <span>
                  {q.text}
                  {q.why && <span className="mt-0.5 block text-[12px] text-muted-foreground">Because: {q.why}</span>}
                </span>
              </button>
            ))}
            <ContactConsent agents={1} consent={consent} onConsent={setConsent} />
            <Textarea id="note" placeholder="Anything else? e.g. I have a cat, I need parking" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <DrawerFooter>
            {problem && <p className="text-center text-[12px] text-amber-700">{problem}</p>}
            <Button onClick={send} disabled={!qs.some((q) => q.on) || Boolean(problem)}>
              Send {qs.filter((q) => q.on).length} questions
            </Button>
            <p className="text-center text-[12px] text-muted-foreground">Prototype: the agent&apos;s reply is simulated.</p>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
