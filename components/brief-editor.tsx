"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FINANCING_LABEL, HOUSEHOLD_LABEL, MUST_HAVES, USE_LABEL, moveInLabel, type Brief } from "@/lib/brief";

const ON = "data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground";
const MOVE_OPTIONS = ["asap", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-06"];

/** Review and edit the brief. Same form for onboarding and later edits. */
export function BriefEditor({ initial, onSave, saveLabel = "Save brief" }: { initial: Brief; onSave: (b: Brief) => void; saveLabel?: string }) {
  const [b, setB] = useState<Brief>(initial);
  const set = <K extends keyof Brief>(k: K, v: Brief[K]) => setB((x) => ({ ...x, [k]: v }));

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(b);
      }}
    >
      <div className="space-y-2">
        <Label>I want to</Label>
        <ToggleGroup type="single" variant="outline" value={b.purpose} onValueChange={(v) => v && set("purpose", v as Brief["purpose"])} className="w-full">
          <ToggleGroupItem value="rent" className={`flex-1 ${ON}`}>Rent</ToggleGroupItem>
          <ToggleGroupItem value="buy" className={`flex-1 ${ON}`}>Buy</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget">Budget (AED{b.purpose === "rent" ? " a year" : ""})</Label>
        <Input
          id="budget"
          inputMode="numeric"
          placeholder={b.purpose === "rent" ? "e.g. 130,000" : "e.g. 2,500,000"}
          value={b.budgetMax ? b.budgetMax.toLocaleString("en-US") : ""}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/[^\d]/g, ""));
            set("budgetMax", n > 0 ? n : null);
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>Bedrooms (pick any)</Label>
        <ToggleGroup type="multiple" variant="outline" value={b.beds.map(String)} onValueChange={(v) => set("beds", v.map(Number))} className="w-full">
          {[1, 2, 3, 4].map((n) => <ToggleGroupItem key={n} value={String(n)} className={`flex-1 ${ON}`}>{n}</ToggleGroupItem>)}
        </ToggleGroup>
        <p className="text-[12px] text-muted-foreground">Princess Tower has 1 to 5 bedrooms. Leave empty for any.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Move in</Label>
          <Select value={b.moveIn ?? "flexible"} onValueChange={(v) => set("moveIn", v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="flexible">Flexible</SelectItem>
              {MOVE_OPTIONS.map((m) => <SelectItem key={m} value={m}>{moveInLabel(m)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Furnished</Label>
          <ToggleGroup type="single" variant="outline" value={b.furnished} onValueChange={(v) => v && set("furnished", v as Brief["furnished"])} className="w-full">
            <ToggleGroupItem value="any" className={`flex-1 ${ON}`}>Any</ToggleGroupItem>
            <ToggleGroupItem value="yes" className={`flex-1 ${ON}`}>Yes</ToggleGroupItem>
            <ToggleGroupItem value="no" className={`flex-1 ${ON}`}>No</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Must-haves</Label>
        <ToggleGroup type="multiple" variant="outline" value={b.mustHaves} onValueChange={(v) => set("mustHaves", v as Brief["mustHaves"])} className="flex w-full flex-wrap justify-start gap-2 *:rounded-md! *:border!">
          {MUST_HAVES.map((m) => <ToggleGroupItem key={m} value={m} className={`capitalize ${ON}`}>{m}</ToggleGroupItem>)}
        </ToggleGroup>
      </div>

      {b.purpose === "rent" && (
        <div className="space-y-2">
          <Label>Who is moving in?</Label>
          <ToggleGroup type="single" variant="outline" value={b.household ?? ""} onValueChange={(v) => set("household", (v || null) as Brief["household"])} className="w-full">
            {(Object.keys(HOUSEHOLD_LABEL) as (keyof typeof HOUSEHOLD_LABEL)[]).map((k) => (
              <ToggleGroupItem key={k} value={k} className={`flex-1 ${ON}`}>{HOUSEHOLD_LABEL[k]}</ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      {b.purpose === "buy" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Buying to</Label>
            <ToggleGroup type="single" variant="outline" value={b.use ?? ""} onValueChange={(v) => set("use", (v || null) as Brief["use"])} className="w-full">
              {(Object.keys(USE_LABEL) as (keyof typeof USE_LABEL)[]).map((k) => (
                <ToggleGroupItem key={k} value={k} className={`flex-1 ${ON}`}>{USE_LABEL[k]}</ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="space-y-2">
            <Label>Paying with</Label>
            <ToggleGroup type="single" variant="outline" value={b.financing ?? ""} onValueChange={(v) => set("financing", (v || null) as Brief["financing"])} className="w-full">
              {(Object.keys(FINANCING_LABEL) as (keyof typeof FINANCING_LABEL)[]).map((k) => (
                <ToggleGroupItem key={k} value={k} className={`flex-1 ${ON}`}>{FINANCING_LABEL[k]}</ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      )}

      {b.purpose === "rent" && (
        <div className="space-y-2">
          <Label>Most cheques you can pay with</Label>
          <Select value={b.maxCheques ? String(b.maxCheques) : "any"} onValueChange={(v) => set("maxCheques", v === "any" ? null : Number(v))}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">No preference</SelectItem>
              {[1, 2, 4, 6, 12].map((n) => <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "cheque" : "cheques"}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-[14px]">
        <span><span className="font-medium">New to Dubai?</span><span className="block text-[12px] text-muted-foreground">Explain Ejari, DEWA, cheques, chiller and move-in costs</span></span>
        <Switch id="new-to-dubai" checked={Boolean(b.newToDubai)} onCheckedChange={(v) => set("newToDubai", v)} />
      </label>

      <Button type="submit" size="lg" className="w-full">{saveLabel}</Button>
    </form>
  );
}
