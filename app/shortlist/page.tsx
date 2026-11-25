"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Clock, CheckCircle2, AlertCircle, XCircle, Smartphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShortlist } from "@/lib/shortlist";
import { simulateReply } from "@/lib/questions";
import { getListing, priceLine } from "@/lib/data";
import { useSession } from "@/lib/auth-client";

const SIMULATED_DELAY_MS = 6000;

export default function ShortlistPage() {
  const { items, update, remove, clear } = useShortlist();
  const { data: session } = useSession();

  // Prototype only: fill in the agent's reply a few seconds after the request.
  useEffect(() => {
    const t = setInterval(() => {
      for (const it of items) {
        if (!it.reply && Date.now() - it.requestedAt > SIMULATED_DELAY_MS) {
          const l = getListing(it.id);
          if (l) update(it.id, { reply: simulateReply(l) });
        }
      }
    }, 1000);
    return () => clearInterval(t);
  }, [items, update]);

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 pt-5 md:px-8 md:pt-10">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Your shortlist</h1>
        <p className="text-[14px] text-muted-foreground">Flats Scout is confirming with agents for you. Answers land here and in the app.</p>
      </div>

      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed p-6 text-center text-[14px] text-muted-foreground">
          Nothing yet. Open a flat and tap <b>Confirm before I call</b>.
          <div className="mt-3">
            <Button asChild size="sm"><Link href="/search?kind=rent">Find a flat</Link></Button>
          </div>
        </div>
      )}

      {items.map((it) => {
        const l = getListing(it.id);
        if (!l) return null;
        const r = it.reply;
        return (
          <div key={it.id} className="overflow-hidden rounded-2xl border">
            <Link href={`/listing/${l.id}`} className="flex gap-3 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.images[0]} alt="" className="size-16 rounded-lg object-cover" />
              <div className="min-w-0 text-[14px]">
                <div className="font-semibold">{priceLine(l)}</div>
                <div className="truncate text-muted-foreground">{l.beds} bed · {l.size.toLocaleString()} sq ft · {l.broker}</div>
              </div>
            </Link>
            <div className="border-t bg-neutral-50 p-3 text-[14px]">
              {!r && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-4 animate-pulse" /> Waiting for {l.agent} ({it.questions.length} questions sent)
                </div>
              )}
              {r && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    {r.outcome === "confirmed" && <><CheckCircle2 className="size-4 text-emerald-600" /> Confirmed by the agent</>}
                    {r.outcome === "changed" && <><AlertCircle className="size-4 text-amber-600" /> Answered, with changes</>}
                    {r.outcome === "unavailable" && <><XCircle className="size-4 text-red-600" /> No longer available</>}
                    <span className="ml-auto text-[12px] font-normal text-muted-foreground">replied in {r.minutes} min</span>
                  </div>
                  <ul className="space-y-1 text-[13px]">
                    {r.lines.map((x) => <li key={x}>• {x}</li>)}
                  </ul>
                  <div className="flex gap-2 pt-1">
                    {r.outcome !== "unavailable" ? (
                      <Button size="sm" className="flex-1" onClick={() => alertless(l.agent)}>Book the viewing</Button>
                    ) : (
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => remove(it.id)}>Remove</Button>
                    )}
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => remove(it.id)}>Not for me</Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Simulated reply for the prototype.</p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Web to app handoff */}
      <div className="space-y-2 rounded-2xl border border-primary/20 bg-accent p-4">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-primary"><Smartphone className="size-4" /> Continue on your phone</div>
        {session ? (
          <p className="text-[13px]">
            Saved to <b>{session.user.email}</b>. Log in on another device and your shortlist and the agents&apos; answers are there. In the
            real product the Property Finder app would also send a notification when an agent answers.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-[13px]">This shortlist is only on this device. Log in to keep it and pick it up on your phone or laptop.</p>
            <div className="flex gap-2">
              <Button asChild size="sm"><Link href="/login?next=/shortlist">Log in</Link></Button>
              <Button asChild size="sm" variant="outline"><Link href="/signup?next=/shortlist">Create account</Link></Button>
            </div>
          </div>
        )}
      </div>
      {items.length > 0 && (
        <button className="text-[12px] text-muted-foreground underline" onClick={clear}>Reset demo</button>
      )}
      <p className="flex items-center gap-1 text-[12px] text-muted-foreground"><Sparkles className="size-3" /> The agent stays in the deal: viewings, negotiation and the contract happen with them.</p>
    </div>
  );
}

function alertless(agent: string | null) {
  import("sonner").then(({ toast }) => toast.success("Viewing requested", { description: `${agent} confirms the time in their app. In the real product this adds it to your calendar.` }));
}
