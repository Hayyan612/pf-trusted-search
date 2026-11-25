import { Card } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { BUILDING, CAPTURED_AT } from "@/lib/data";

const rules = [
  { icon: ShieldX, tone: "text-red-600", title: "Likely misleading (hidden, not deleted)", body: "Two or more photos are the same as an ad for a different flat (other bedrooms or size)." },
  { icon: ShieldAlert, tone: "text-amber-600", title: "Ask first", body: "Price 15%+ below what this size actually rented or sold for (DLD records via DataGuru); the same flat advertised again at another price; also listed for sale or rent; the ad says tenanted or gives a later or out-of-date availability date; holiday-home or bills-included pricing shown as a yearly rent; the ad tells you to contact someone other than the listed agent; the ad is over 90 days old." },
  { icon: ShieldCheck, tone: "text-emerald-600", title: "Looks genuine", body: "None of the above. Still worth confirming it is free before you call." },
];

export default function HowPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 pt-5 md:px-8 md:pt-10">
      <h1 className="text-[22px] font-semibold tracking-tight">How TrueUnit decides</h1>
      <ul className="space-y-4">
        {rules.map(({ icon: Icon, tone, title, body }) => (
          <li key={title} className="flex gap-3">
            <Icon className={`mt-0.5 size-5 shrink-0 ${tone}`} />
            <div className="text-[14px]"><div className="font-medium">{title}</div><div className="text-muted-foreground">{body}</div></div>
          </li>
        ))}
      </ul>
      <Card className="gap-0 p-4 text-[13px] text-muted-foreground">
        <b className="text-foreground">Same flat, many ads.</b> Ads are merged into one flat only when they share photos <i>and</i> have the same bedrooms and size. Same size alone is not enough: Princess Tower repeats the same layouts on 101 floors.
      </Card>
      <Card className="gap-0 p-4 text-[13px] text-muted-foreground">
        <b className="text-foreground">What is real here.</b> Every listing is a real ad from {BUILDING}, captured from propertyfinder.ae on {CAPTURED_AT}, with its real photos, price and text. The checks run on that data. Registered rents and sales are the DLD records Property Finder shows on each listing (DataGuru). Photos were also compared with 343 ads from 8 neighbouring towers: no ad here uses another building&apos;s photos. Scout reads your brief with an AI model, but the trust decisions are these rules, not the model. The messages to agents and their replies are simulated.
      </Card>
    </div>
  );
}
