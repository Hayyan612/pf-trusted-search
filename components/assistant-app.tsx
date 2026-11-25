"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarCheck, Handshake, Loader2, MessageSquareText, Pencil, ShieldCheck, Sparkles } from "lucide-react";
import { useShortlist } from "@/lib/shortlist";
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
import { EMPTY_BRIEF, bedsLabel, budgetLabel, extraTags, missingEssentials, moveInLabel, type Brief } from "@/lib/brief";
import { saveBrief, useBrief } from "@/lib/brief-store";
import { useSession } from "@/lib/auth-client";

const EXAMPLES = [
  "2-bed to rent under 130k a year, furnished, moving in January, I have a cat",
  "Buy a 2-bed with a sea view, budget 2.5 million",
  "1-bed for me and my partner, up to 9,000 a month, need parking",
];

function Onboarding({ onDone }: { onDone: (b: Brief) => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Brief | null>(null);
  const [asked, setAsked] = useState(false);

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

  if (draft && !asked && missingEssentials(draft).length > 0) {
    return <QuickQuestions draft={draft} onDone={(b) => { setDraft(b); setAsked(true); }} />;
  }
  if (draft) {
    return (
      <Card className="mx-auto max-w-xl motion-safe:animate-in motion-safe:fade-in">
        <CardHeader>
          <CardTitle>Is this right?</CardTitle>
          <CardDescription>Scout read your words into this brief. Change anything, then build your shortlist.</CardDescription>
        </CardHeader>
        <CardContent><BriefEditor initial={draft} onSave={onDone} saveLabel="Build my shortlist" /></CardContent>
      </Card>
    );
  }
  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <Badge variant="outline" className="w-fit gap-1 border-primary/30 text-primary"><Sparkles className="size-3" /> Scout, with TrueUnit</Badge>
        <CardTitle className="text-[22px] leading-tight">What are you looking for?</CardTitle>
        <CardDescription>Say it the way you would to a friend. Scout turns it into a brief you can check, then finds the flats in Princess Tower worth your time.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="grid gap-2 rounded-xl bg-muted/50 p-3 text-[13px] sm:grid-cols-3">
          <li className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" /> I check every ad and hide the misleading ones, with reasons.</li>
          <li className="flex gap-2"><MessageSquareText className="mt-0.5 size-4 shrink-0 text-primary" /> I ask agents for you, only when you say so.</li>
          <li className="flex gap-2"><Handshake className="mt-0.5 size-4 shrink-0 text-primary" /> You decide. Viewings and the deal stay with the agent.</li>
        </ul>
        <Textarea
          id="brief-text"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. 2-bed to rent under 130k, furnished, moving in January, I have a cat"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) read(text);
          }}
        />
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((x) => (
            <button key={x} type="button" onClick={() => { setText(x); read(x); }} className="rounded-full border border-primary/25 px-3 py-1.5 text-left text-[12px] text-primary transition-colors hover:bg-accent">
              {x}
            </button>
          ))}
        </div>
        <Button size="lg" className="w-full" disabled={busy || !text.trim()} onClick={() => read(text)}>
          {busy ? <><Loader2 className="animate-spin" /> Reading…</> : "Continue"}
        </Button>
        <button type="button" className="w-full text-center text-[13px] text-muted-foreground underline" onClick={() => { setAsked(true); setDraft(EMPTY_BRIEF); }}>
          Skip and fill in a form
        </button>
      </CardContent>
    </Card>
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
          <CardTitle>Your brief</CardTitle>
          <Button variant="outline" size="sm" onClick={onEdit}><Pencil /> Edit</Button>
        </div>
        <CardDescription>{data ? `Saved to ${data.user.email}` : "Saved in this browser."}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => <Badge key={t} variant="secondary" className="font-normal">{t}</Badge>)}
        </div>
        {!data && (
          <p className="text-[12px] text-muted-foreground">
            <Link href="/signup?next=/assistant" className="text-primary underline">Create an account</Link> to keep it on your phone too.
          </p>
        )}
      </CardContent>
    </Card>
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
    <Card className="gap-2 border-emerald-200 bg-emerald-50/60 py-4 shadow-none motion-safe:animate-in motion-safe:fade-in">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 px-4">
        <div className="text-[14px]">
          <div className="font-semibold">Welcome back{first ? `, ${first}` : ""}.</div>
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

  if (!brief) {
    return (
      <div className="px-4 pt-6 md:pt-12">
        <Onboarding onDone={(b) => { saveBrief(b); toast.success("Brief saved"); }} />
      </div>
    );
  }
  return (
    <div className="mx-auto grid max-w-6xl gap-5 px-4 pt-5 md:grid-cols-[340px_minmax(0,1fr)] md:px-8 md:pt-8">
      <div className="space-y-4 md:sticky md:top-24 md:self-start">
        <BriefSummary brief={brief} onEdit={() => setEditing(true)} />
        <button type="button" className="text-[12px] text-muted-foreground underline" onClick={() => saveBrief(null)}>Start over</button>
      </div>
      <div className="min-w-0 space-y-5">
        <WelcomeBack />
        <TopFive brief={brief} />
        <ScoutChat brief={brief} enabled={chatEnabled} />
      </div>
      <Sheet open={editing} onOpenChange={setEditing}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit your brief</SheetTitle>
            <SheetDescription>Your shortlist updates as soon as you save.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <BriefEditor initial={brief} onSave={(b) => { saveBrief(b); setEditing(false); toast.success("Brief updated"); }} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
