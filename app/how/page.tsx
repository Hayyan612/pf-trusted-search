import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { BUILDING, CAPTURED_AT } from "@/lib/data";

const rules = [
  { icon: ShieldX, tone: "text-red-600", title: "Likely misleading (hidden, not deleted)", body: "Two or more photos are the same as an ad for a different flat (other bedrooms or size)." },
  { icon: ShieldAlert, tone: "text-amber-600", title: "Ask first", body: "Price per sq ft 15%+ below similar flats in the tower; the same flat advertised again at another price; also listed for sale/rent; the ad says tenanted or a later date; holiday-home or bills-included pricing shown as a yearly rent; the ad is over 90 days old." },
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
      <div className="rounded-2xl border p-4 text-[13px] text-muted-foreground">
        <b className="text-foreground">Same flat, many ads.</b> Ads are merged into one flat only when they share photos <i>and</i> have the same bedrooms and size. Same size alone is not enough: Princess Tower repeats the same layouts on 101 floors.
      </div>
      <div className="rounded-2xl border p-4 text-[13px] text-muted-foreground">
        <b className="text-foreground">What is real here.</b> Every listing is a real ad from {BUILDING}, captured from propertyfinder.ae on {CAPTURED_AT}, with its real photos, price and text. The checks run on that data. The messages to agents and their replies are simulated.
      </div>
    </div>
  );
}
