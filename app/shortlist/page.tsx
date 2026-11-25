"use client";
import { Card } from "@/components/ui/card";

import Link from "next/link";
import { useEffect } from "react";
import { Clock, CheckCircle2, AlertCircle, XCircle, Smartphone, Sparkles, CalendarClock, CalendarCheck } from "lucide-react";
import { FadeImage } from "@/components/fade-image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useShortlist } from "@/lib/shortlist";
import { simulateReply } from "@/lib/questions";
import { getListing, priceLine } from "@/lib/data";
import { useSession } from "@/lib/auth-client";

const SIMULATED_DELAY_MS = 6000;
const VIEWING_CONFIRM_MS = 4000;

export default function ShortlistPage() {
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED !== "false";
  const { items, update, remove, clear } = useShortlist();
  const { data: session } = useSession();

  const rank = (i: (typeof items)[number]) => (!i.reply ? 2 : i.reply.outcome === "confirmed" ? 0 : i.reply.outcome === "changed" ? 1 : 3);
  const sorted = [...items].sort((a, b) => rank(a) - rank(b));

  // Prototype only: fill in the agent's reply a few seconds after the request.
  useEffect(() => {
    const t = setInterval(() => {
      for (const it of items) {
        if (!it.reply && Date.now() - it.requestedAt > SIMULATED_DELAY_MS) {
          const l = getListing(it.id);
          if (l) update(it.id, { reply: simulateReply(l) });
        }
        if (it.viewing?.status === "requested" && Date.now() - it.viewing.at > VIEWING_CONFIRM_MS) {
          update(it.id, { viewing: { ...it.viewing, status: "confirmed" } });
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
        <Card className="gap-0 border-dashed p-6 text-center text-[14px] text-muted-foreground shadow-none">
          <p>Nothing yet. Open a flat and tap <b>Confirm before I call</b>.</p>
          <div className="mt-3">
            <Button asChild size="sm"><Link href="/search?kind=rent">Find a flat</Link></Button>
          </div>
        </Card>
      )}

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 text-[12px]">
          {([["Confirmed", items.filter((i) => i.reply?.outcome === "confirmed").length, "bg-emerald-50 text-emerald-800"],
             ["Changed", items.filter((i) => i.reply?.outcome === "changed").length, "bg-amber-50 text-amber-800"],
             ["Waiting", items.filter((i) => !i.reply).length, "bg-muted text-muted-foreground"],
             ["Gone", items.filter((i) => i.reply?.outcome === "unavailable").length, "bg-red-50 text-red-700"]] as const).map(([k, n, tone]) => (
            <span key={k} className={`rounded-full px-2.5 py-1 font-medium ${tone}`}>{k} {n}</span>
          ))}
        </div>
      )}

      {sorted.map((it) => {
        const l = getListing(it.id);
        if (!l) return null;
        const r = it.reply;
        const v = it.viewing;
        return (
          <Card key={it.id} className={cn("gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300", r?.outcome === "unavailable" && "opacity-70")}>
            <Link href={`/listing/${l.id}`} className="flex gap-3 p-3">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                <FadeImage src={l.images[0]} alt="" className="absolute inset-0 size-full object-cover" />
              </span>
              <div className="min-w-0 text-[14px]">
                <div className="font-semibold">{priceLine(l)}</div>
                <div className="truncate text-muted-foreground">{l.beds} bed · {l.size.toLocaleString()} sq ft · {l.broker}</div>
              </div>
            </Link>
            <div className="border-t bg-muted/40 p-3 text-[14px]">
              {!r && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-4 animate-pulse" /> Waiting for {l.agent} ({it.questions.length} questions sent)
                </div>
              )}
              {r && (
                <div className="space-y-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-500">
                  <div className="flex items-center gap-2 font-medium">
                    {r.outcome === "confirmed" && <><CheckCircle2 className="size-4 text-emerald-600" /> Confirmed by the agent</>}
                    {r.outcome === "changed" && <><AlertCircle className="size-4 text-amber-600" /> Answered, with changes</>}
                    {r.outcome === "unavailable" && <><XCircle className="size-4 text-red-600" /> No longer available</>}
                    <span className="ml-auto text-[12px] font-normal text-muted-foreground">replied in {r.minutes} min</span>
                  </div>
                  <ul className="space-y-1 text-[13px]">
                    {r.lines.filter((x) => !x.startsWith("Viewing:")).map((x) => <li key={x}>• {x}</li>)}
                  </ul>

                  {r.outcome !== "unavailable" && !v && (r.slots?.length ?? 0) > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[12px] font-medium text-muted-foreground">The agent can show it at:</div>
                      <div className="flex flex-wrap gap-2">
                        {r.slots!.map((slot) => (
                          <Button key={slot} size="sm" variant="outline" onClick={() => update(it.id, { viewing: { slot, status: "requested", at: Date.now() } })}>
                            <CalendarClock /> {slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {v && (
                    <div className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] motion-safe:animate-in motion-safe:fade-in", v.status === "confirmed" ? "bg-emerald-50 text-emerald-800" : "bg-accent text-primary")}>
                      {v.status === "confirmed" ? <CalendarCheck className="size-4" /> : <Clock className="size-4 animate-pulse" />}
                      {v.status === "confirmed" ? <>Viewing confirmed: <b>{v.slot}</b> with {l.agent}</> : <>Viewing requested for {v.slot}. Waiting for {l.agent} to confirm.</>}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    {r.outcome === "unavailable" ? (
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => remove(it.id)}>Remove</Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="flex-1" onClick={() => remove(it.id)}>Not for me</Button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">Simulated reply for the prototype.</p>
                </div>
              )}
            </div>
          </Card>
        );
      })}

      {/* Web to app handoff */}
      <Card className="gap-2 border-primary/20 bg-accent p-4 shadow-none">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-primary"><Smartphone className="size-4" /> Continue on your phone</div>
        {session ? (
          <p className="text-[13px]">
            Saved to <b>{session.user.email}</b>. Log in on another device and your shortlist and the agents&apos; answers are there. In the
            real product the Property Finder app would also send a notification when an agent answers.
          </p>
        ) : !authEnabled ? (
          <p className="text-[13px]">Saved in this browser. With an account, the shortlist and the agents&apos; answers follow you from laptop to phone.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-[13px]">This shortlist is only on this device. Log in to keep it and pick it up on your phone or laptop.</p>
            <div className="flex gap-2">
              <Button asChild size="sm"><Link href="/login?next=/shortlist">Log in</Link></Button>
              <Button asChild size="sm" variant="outline"><Link href="/signup?next=/shortlist">Create account</Link></Button>
            </div>
          </div>
        )}
      </Card>
      {items.length > 0 && (
        <button className="text-[12px] text-muted-foreground underline" onClick={clear}>Reset demo</button>
      )}
      <p className="flex items-center gap-1 text-[12px] text-muted-foreground"><Sparkles className="size-3" /> The agent stays in the deal: viewings, negotiation and the contract happen with them.</p>
    </div>
  );
}
