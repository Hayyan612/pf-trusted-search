"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion, type Variants } from "motion/react";
import { ArrowRight, CalendarCheck, Handshake, MessageSquareText, Pencil, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { BriefEditor } from "@/components/brief-editor";
import { TopFive } from "@/components/top-five";
import { QuickQuestions } from "@/components/quick-questions";
import { ScoutChat } from "@/components/scout-chat";
import { ScoutThread } from "@/components/scout-thread";
import { ExpatGuide } from "@/components/expat-guide";
import { LocationCard } from "@/components/location-card";
import { matchBrief } from "@/lib/match";
import { EMPTY_BRIEF, bedsLabel, budgetLabel, extraTags, missingEssentials, moveInLabel, type Brief } from "@/lib/brief";
import { saveBrief, useBrief } from "@/lib/brief-store";
import { useShortlist } from "@/lib/shortlist";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const DEMO_BRIEF: Brief = {
  ...EMPTY_BRIEF, purpose: "rent", budgetMax: 130_000, beds: [2], moveIn: "2027-01", furnished: "yes", mustHaves: ["pets"],
  household: "couple", maxCheques: 4, newToDubai: true, workplace: "pf-media-city", maxCommuteMin: 20, nearby: ["gym", "metro", "supermarket"],
};

const EXAMPLES = [
  "2-bed to rent under 130k a year, furnished, moving in January, I have a cat",
  "Buy a 2-bed with a sea view, budget 2.5 million",
  "1-bed for me and my partner, up to 9,000 a month, need parking",
];

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };
const rise: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } };
const stepMotion = {
  initial: { opacity: 0, x: 28, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, x: -28, filter: "blur(4px)", transition: { duration: 0.22, ease: EASE } },
};

/** Cycles through example sentences as a placeholder, so the box shows what kind of sentence works. */
function useRotatingPlaceholder(active: boolean) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setI((x) => (x + 1) % EXAMPLES.length), 3200);
    return () => clearInterval(t);
  }, [active]);
  return `e.g. ${EXAMPLES[i]}`;
}

function StepDots({ step }: { step: 0 | 1 | 2 }) {
  const labels = ["Your words", "A few questions", "Check"];
  return (
    <div className="mx-auto mb-5 flex max-w-xl items-center gap-2 text-[12px]">
      {labels.map((l, i) => (
        <div key={l} className="flex flex-1 items-center gap-2">
          <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-primary/10">
            <motion.div className="absolute inset-y-0 left-0 rounded-full bg-primary" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.5, ease: EASE }} />
          </div>
          <span className={cn("hidden whitespace-nowrap transition-colors sm:inline", i <= step ? "font-medium text-primary" : "text-muted-foreground")}>{l}</span>
        </div>
      ))}
    </div>
  );
}

function Reading({ text }: { text: string }) {
  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle className="font-display text-[26px] font-normal">Reading your words<motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2 }}>…</motion.span></CardTitle>
        <CardDescription className="line-clamp-2 italic">&ldquo;{text}&rdquo;</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {[88, 120, 64, 104, 76, 132].map((w, i) => (
            <motion.span key={i} className="shimmer h-7 rounded-full" style={{ width: w }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }} />
          ))}
        </div>
        <p className="text-[13px] text-muted-foreground">Budget, bedrooms, dates, who is moving, must-haves.</p>
      </CardContent>
    </Card>
  );
}

function Onboarding({ onDone }: { onDone: (b: Brief) => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Brief | null>(null);
  const [asked, setAsked] = useState(false);
  const placeholder = useRotatingPlaceholder(!text && !busy && !draft);

  const read = async (value: string) => {
    if (!value.trim()) return;
    setBusy(true);
    try {
      const r = await fetch("/api/brief/parse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: value }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setDraft({ ...EMPTY_BRIEF, ...j.brief, notes: j.brief.notes ?? null });
    } catch {
      toast.error("Scout could not read that. Fill in the form instead.");
      setDraft(EMPTY_BRIEF);
    } finally {
      setBusy(false);
    }
  };

  const step: "ask" | "reading" | "quick" | "review" = busy ? "reading" : !draft ? "ask" : !asked && missingEssentials(draft).length > 0 ? "quick" : "review";
  const dot = step === "ask" || step === "reading" ? 0 : step === "quick" ? 1 : 2;

  return (
    <div>
      <StepDots step={dot} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} {...stepMotion}>
          {step === "reading" && <Reading text={text} />}
          {step === "quick" && draft && <QuickQuestions draft={draft} onDone={(b) => { setDraft(b); setAsked(true); }} />}
          {step === "review" && draft && (
            <Card className="mx-auto max-w-xl">
              <CardHeader>
                <CardTitle className="font-display text-[28px] font-normal">Is this right?</CardTitle>
                <CardDescription>Scout read your words into this brief. Change anything, then build your shortlist.</CardDescription>
              </CardHeader>
              <CardContent><BriefEditor initial={draft} onSave={onDone} saveLabel="Build my shortlist" /></CardContent>
            </Card>
          )}
          {step === "ask" && (
            <motion.div variants={stagger} initial="hidden" animate="show" className="mx-auto max-w-xl space-y-6">
              <motion.div variants={rise} className="space-y-3 text-center">
                <Badge variant="outline" className="gap-1 border-primary/30 bg-white/70 text-primary backdrop-blur"><Sparkles className="size-3" /> Scout, with TrueUnit</Badge>
                <h1 className="font-display text-[40px] leading-[1.05] text-balance sm:text-[52px]">
                  Tell me what home <em className="text-primary">looks like.</em>
                </h1>
                <p className="mx-auto max-w-md text-[15px] text-muted-foreground">Say it the way you would to a friend. I turn it into a brief you can check, then find the flats in Princess Tower worth your time.</p>
              </motion.div>

              <motion.div variants={rise}>
                <Card className="gap-4 border-primary/15 bg-white/85 shadow-lg shadow-primary/5 backdrop-blur">
                  <CardContent className="space-y-3">
                    <Textarea
                      id="brief-text"
                      rows={4}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={placeholder}
                      className="resize-none border-0 bg-transparent px-1 text-[16px] shadow-none focus-visible:ring-0"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) read(text);
                      }}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                      <span className="text-[12px] text-muted-foreground">Budget, bedrooms, when, who, must-haves.</span>
                      <Button size="lg" disabled={busy || !text.trim()} onClick={() => read(text)}>
                        Continue <ArrowRight />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={rise} className="flex flex-wrap justify-center gap-2">
                {EXAMPLES.map((x) => (
                  <motion.button
                    key={x}
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setText(x); read(x); }}
                    className="rounded-full border border-primary/20 bg-white/70 px-3 py-1.5 text-left text-[12px] text-primary backdrop-blur transition-colors hover:bg-accent"
                  >
                    {x}
                  </motion.button>
                ))}
              </motion.div>

              <motion.ul variants={rise} className="grid gap-3 text-[13px] sm:grid-cols-3">
                {[
                  { icon: ShieldCheck, t: "I check every ad and hide the misleading ones, with reasons." },
                  { icon: MessageSquareText, t: "I ask agents for you, only when you say so." },
                  { icon: Handshake, t: "You decide. Viewings and the deal stay with the agent." },
                ].map(({ icon: Icon, t }) => (
                  <li key={t} className="flex gap-2 rounded-xl border bg-white/60 p-3 backdrop-blur"><Icon className="mt-0.5 size-4 shrink-0 text-primary" /> {t}</li>
                ))}
              </motion.ul>

              <motion.div variants={rise} className="flex flex-col items-center gap-2">
                <Button variant="outline" onClick={() => onDone(DEMO_BRIEF)} className="bg-white/70 backdrop-blur"><Sparkles /> Try it with an example (60 seconds)</Button>
                <button type="button" className="text-[13px] text-muted-foreground underline underline-offset-4" onClick={() => { setAsked(true); setDraft(EMPTY_BRIEF); }}>
                  Skip and fill in a form
                </button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function BriefSummary({ brief, onEdit }: { brief: Brief; onEdit: () => void }) {
  const { data } = useSession();
  const tags = [
    brief.purpose === "rent" ? "Rent" : "Buy", budgetLabel(brief), bedsLabel(brief.beds),
    brief.furnished === "any" ? "Any furnishing" : brief.furnished === "yes" ? "Furnished" : "Unfurnished",
    `Move in: ${moveInLabel(brief.moveIn)}`, ...extraTags(brief), ...brief.mustHaves.map((m) => m[0].toUpperCase() + m.slice(1)), ...(brief.maxCheques ? [`Up to ${brief.maxCheques} cheques`] : []),
  ];
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-display text-[24px] font-normal">Your brief</CardTitle>
          <Button variant="outline" size="sm" onClick={onEdit}><Pencil /> Edit</Button>
        </div>
        <CardDescription>{data ? `Saved to ${data.user.email}` : "Saved in this browser."}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <motion.div layout className="flex flex-wrap gap-1.5">
          <AnimatePresence initial={false} mode="popLayout">
            {tags.map((t) => (
              <motion.span key={t} layout initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.25, ease: EASE }}>
                <Badge variant="secondary" className="max-w-full font-normal whitespace-normal">{t}</Badge>
              </motion.span>
            ))}
          </AnimatePresence>
        </motion.div>
        {!data && (
          <p className="text-[12px] text-muted-foreground">
            <Link href="/signup?next=/assistant" className="text-primary underline">Create an account</Link> to keep it on your phone too.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function NextSteps() {
  const { items } = useShortlist();
  const steps = [
    { done: true, label: "Tell Scout what you need" },
    { done: true, label: "Check your top 5" },
    { done: items.length > 0, label: "Ask the agents" },
    { done: items.some((i) => i.reply), label: "Read their answers" },
    { done: items.some((i) => i.viewing), label: "Book a viewing" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const next = steps.findIndex((x) => !x.done);
  return (
    <div className="space-y-2.5 rounded-2xl border bg-white/80 px-4 py-3 backdrop-blur">
      <div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-[var(--brand)]" initial={false} animate={{ width: `${(doneCount / steps.length) * 100}%` }} transition={{ duration: 0.7, ease: EASE }} />
      </div>
      <ol className="flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
        {steps.map((x, i) => (
          <li key={x.label} className={cn("flex items-center gap-1.5 transition-colors", x.done ? "text-emerald-700" : i === next ? "font-semibold text-primary" : "text-muted-foreground")}>
            <motion.span
              initial={false}
              animate={{ scale: i === next ? [1, 1.15, 1] : 1 }}
              transition={i === next ? { repeat: Infinity, duration: 1.8 } : {}}
              className={cn("grid size-4 place-items-center rounded-full text-[10px]", x.done ? "bg-emerald-600 text-white" : i === next ? "bg-primary text-white" : "bg-muted")}
            >
              {x.done ? "✓" : i + 1}
            </motion.span>
            {x.label}
          </li>
        ))}
      </ol>
    </div>
  );
}

function WelcomeBack() {
  const { items } = useShortlist();
  const { data } = useSession();
  if (!items.length) return null;
  const answered = items.filter((i) => i.reply).length;
  const waiting = items.length - answered;
  const viewings = items.filter((i) => i.viewing?.status === "confirmed").length;
  const first = data?.user.name?.split(" ")[0];
  return (
    <Card className="gap-2 border-emerald-200 bg-emerald-50/70 py-4 shadow-none">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 px-4">
        <div className="text-[14px]">
          <div className="font-display text-[20px] leading-tight">Welcome back{first ? `, ${first}` : ""}.</div>
          <div className="text-muted-foreground">
            {answered} of {items.length} agents answered{waiting ? `, ${waiting} still waiting` : ""}
            {viewings ? `, ${viewings} ${viewings === 1 ? "viewing" : "viewings"} confirmed` : ""}.
          </div>
        </div>
        <Button asChild size="sm"><Link href="/shortlist"><CalendarCheck /> Open shortlist</Link></Button>
      </CardContent>
    </Card>
  );
}

export function AssistantApp({ chatEnabled }: { chatEnabled: boolean }) {
  const brief = useBrief();
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("demo") === "1" && !brief) saveBrief(DEMO_BRIEF);
  }, [brief]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="scout-atmosphere min-h-[calc(100dvh-4rem)]">
        <AnimatePresence mode="wait" initial={false}>
          {!brief ? (
            <motion.div key="onboarding" className="px-4 pt-8 pb-10 md:pt-14" exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}>
              <Onboarding onDone={(b) => { saveBrief(b); toast.success("Brief saved"); }} />
            </motion.div>
          ) : (
            <motion.div
              key="workspace"
              variants={stagger}
              initial="hidden"
              animate="show"
              className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-4 pt-5 pb-10 md:grid-cols-[340px_minmax(0,1fr)] md:px-8 md:pt-8"
            >
              <motion.div variants={rise} className="space-y-3 md:sticky md:top-24 md:self-start">
                <BriefSummary brief={brief} onEdit={() => setEditing(true)} />
                <button type="button" className="inline-flex items-center gap-1 text-[12px] text-muted-foreground underline-offset-4 hover:underline" onClick={() => saveBrief(null)}>
                  <RotateCcw className="size-3" /> Start over
                </button>
              </motion.div>
              <div className="min-w-0 space-y-5">
                <motion.div variants={rise}><NextSteps /></motion.div>
                <motion.div variants={rise}><ScoutThread brief={brief} onEdit={() => setEditing(true)} /></motion.div>
                <motion.div variants={rise}><TopFive brief={brief} /></motion.div>
                {brief.newToDubai && (
                  <motion.div variants={rise}>
                    {(() => {
                      const first = brief.purpose === "rent" ? matchBrief(brief).top[0]?.listing : undefined;
                      return <ExpatGuide exampleRent={first?.price} furnished={first?.furnished} />;
                    })()}
                  </motion.div>
                )}
                <motion.div variants={rise}><LocationCard priorities={brief.nearby} workplace={brief.workplace} maxCommuteMin={brief.maxCommuteMin} /></motion.div>
                <motion.div variants={rise}><ScoutChat brief={brief} enabled={chatEnabled} /></motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Sheet open={editing} onOpenChange={setEditing}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="font-display text-[26px] font-normal">Edit your brief</SheetTitle>
              <SheetDescription>Your shortlist updates as soon as you save.</SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-6">
              <BriefEditor initial={brief ?? EMPTY_BRIEF} onSave={(b) => { saveBrief(b); setEditing(false); toast.success("Brief updated"); }} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </MotionConfig>
  );
}
