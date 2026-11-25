import type { Brief } from "@/lib/brief";
import type { Listing } from "@/lib/data";
import { negotiation } from "@/lib/negotiate";
import { moveInLabel } from "@/lib/brief";
import { WORKPLACES } from "@/lib/workplaces";

/** The message Scout sends for the person: who they are, what they need, this flat's questions, and a fair offer. */
export function draftMessage(l: Listing, questions: string[], opts: { name?: string; brief?: Brief | null }) {
  const b = opts.brief;
  const first = (l.agent ?? "there").split(" ")[0];
  const who: string[] = [];
  if (b?.household === "couple") who.push("for me and my partner");
  else if (b?.household === "family") who.push("for my family");
  else if (b?.household === "sharing") who.push("to share");
  if (b?.moveIn && b.moveIn !== "flexible") who.push(b.moveIn === "asap" ? "moving in as soon as possible" : `moving in ${moveInLabel(b.moveIn)}`);
  if (b?.workplace) who.push(`working in ${WORKPLACES[b.workplace].label.replace("Property Finder, ", "")}`);
  const intro = `Hi ${first}, I found your ${l.beds}-bed in Princess Tower (${l.size.toLocaleString("en-US")} sq ft, ref ${l.reference ?? l.id}) on Property Finder, ${l.kind === "rent" ? `listed at AED ${l.price.toLocaleString("en-US")} a year` : `listed at AED ${l.price.toLocaleString("en-US")}`}.`;
  const about = who.length ? ` I am looking ${who.join(", ")}.` : "";
  const qs = questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
  const n = negotiation(l);
  const offer = n && n.tone === "high" ? `\n\nRegistered ${l.kind === "rent" ? "rents" : "sales"} for this size were lower recently, so would the owner consider AED ${n.offer.toLocaleString("en-US")}${l.kind === "rent" ? " with fewer cheques" : ""}?` : "";
  const sign = `\n\nThank you,\n${opts.name?.trim() || "(your name)"}`;
  return `${intro}${about}\n\n${qs}${offer}${sign}`;
}
