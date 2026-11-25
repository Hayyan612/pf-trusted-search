"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CHANNEL_LABEL, saveContact, useContact, type Contact } from "@/lib/contact";
import { useSession } from "@/lib/auth-client";

const ON = "data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground";

/** Name, how agents reach you, and an explicit consent line. Rendered inside the send drawers. */
export function ContactConsent({ agents, consent, onConsent }: { agents: number; consent: boolean; onConsent: (v: boolean) => void }) {
  const c = useContact();
  const { data } = useSession();
  const set = (patch: Partial<Contact>) => saveContact({ ...c, ...patch });

  useEffect(() => {
    if (data && !c.name && !c.email) saveContact({ ...c, name: data.user.name ?? "", email: data.user.email ?? "" });
  }, [data, c]);

  return (
    <div className="space-y-3 rounded-xl border bg-muted/30 p-3">
      <div className="text-[13px] font-semibold">How should agents reach you?</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="c-name">Your name</Label>
          <Input id="c-name" autoComplete="name" value={c.name} onChange={(e) => set({ name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Reply by</Label>
          <ToggleGroup type="single" variant="outline" value={c.channel} onValueChange={(v) => v && set({ channel: v as Contact["channel"] })} className="w-full">
            {(Object.keys(CHANNEL_LABEL) as Contact["channel"][]).map((k) => (
              <ToggleGroupItem key={k} value={k} className={`flex-1 text-[12px] ${ON}`}>{k === "app" ? "App" : CHANNEL_LABEL[k]}</ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
      {c.channel === "whatsapp" && (
        <div className="space-y-1.5">
          <Label htmlFor="c-phone">WhatsApp number</Label>
          <Input id="c-phone" type="tel" autoComplete="tel" placeholder="+971 50 123 4567" value={c.phone} onChange={(e) => set({ phone: e.target.value })} />
        </div>
      )}
      {c.channel === "email" && (
        <div className="space-y-1.5">
          <Label htmlFor="c-email">Email</Label>
          <Input id="c-email" type="email" autoComplete="email" value={c.email} onChange={(e) => set({ email: e.target.value })} />
        </div>
      )}
      {c.channel === "app" && <p className="text-[12px] text-muted-foreground">Agents reply inside Property Finder. Your number is not shared.</p>}
      <label className="flex cursor-pointer items-start gap-2 text-[13px]">
        <input id="c-consent" type="checkbox" className="mt-0.5 size-4 accent-[var(--primary)]" checked={consent} onChange={(e) => onConsent(e.target.checked)} />
        <span>
          Share my name{c.channel === "app" ? "" : ` and ${c.channel === "whatsapp" ? "WhatsApp number" : "email"}`} with {agents === 1 ? "this agent" : `these ${agents} agents`}, only about these flats.
        </span>
      </label>
    </div>
  );
}
