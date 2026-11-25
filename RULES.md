# Rules TrueUnit follows

TrueUnit works for the person searching. It never removes an ad from Property Finder; it only decides what to show first, what to flag, and what to ask the agent. Everything it uses is visible to a person searching today.

Three outcomes:

- **Looks genuine**: shown normally. Still worth confirming it is free before calling.
- **Ask first**: shown, with the reason, and the question is added to "Confirm before I call".
- **Likely misleading**: moved to a collapsed "hidden" section at the bottom, with the reason. One tap to see it. Never deleted.

When it is not sure, it asks the agent instead of deciding. A wrong "Ask first" costs one question. A wrong "Likely misleading" can cost an honest agent a lead, so that bar is high.

## 1. Same flat, many ads: show it once

**Rule.** Two ads are the same flat when they share 2+ near-identical photos **and** have the same bedrooms and size (within 3 sq ft). Show one card, with every agency's price.

**Where it is wrong.**
- Two agencies photograph the same flat with their own photos. No photo match, so the flat shows twice. *Hurts the searcher* (more noise), not the agent.
- A developer's show-flat photos are used for many similar units. They would merge into one card. *Hurts honest agents*, whose real separate flats get folded together.
- Same size alone is **not** a duplicate. Princess Tower repeats identical layouts on 101 floors. Our first version flagged 33 different flats as duplicates (see AI-LOG.md).

## 2. Photos that belong to another flat: likely misleading

**Rule.** If 2+ photos match an ad for a **different** flat (other bedrooms or size), mark it likely misleading.

**Where it is wrong.**
- One shared photo is usually a view from the tower or a lobby shot. That is why one match only gives "Ask first". Royal Place's 1-bed and 2-bed matched on a sea-view photo; the interiors differ.
- The agent typed the wrong size. McCone (1,189 sq ft) and Seafront (1,305 sq ft) use the same living-room photo. Our rule only saw one shared photo and said "Ask first", but a person can see it is one flat with two sizes. *Hurts the searcher* if the size is wrong. The rule should also flag "same photos, different size" as a question.
- An agency reuses photos of an identical unit on another floor because the tenant will not allow photos. Honest, but the photos are still not this flat. *Hurts an honest agent* if hidden, so the reason shown says "photos may not show this flat", not "fake".

## 3. Price far below what this size actually rented or sold for: ask first

**Rule.** Compare the ad with the last registered rents or sales for the same size in this tower (DLD records, shown on Property Finder through DataGuru). 15%+ below the median: ask the agent why. 15%+ above: shown as information, not a warning ("room to negotiate"). If there are no registered deals, fall back to the median of today's live ads per sq ft.

**Where it is wrong.**
- It is a real deal: an owner who needs to let fast, a low floor with no view, unfurnished. *Hurts an honest agent*: the listing gets a question instead of a call. That is why it is never hidden on price alone.
- Registered deals lag the market. Some sales in our data are from 2023-2024, and 2-bed rents in the tower fell about 20% in a year (DataGuru trend). In a falling market a fair new price can look "low" next to old deals. *Hurts an honest agent.* Fix: weight recent deals more and show the dates, which the listing page does.
- Same size is not the same flat: floor, view and furnishing move the price. *Hurts both sides* when a high-floor sea view is compared with a low-floor pool view.

## 4. Same flat for rent and for sale: ask first

**Rule.** If the same flat is listed both to rent and to buy, ask whether the owner has committed.

**Where it is wrong.** Many owners genuinely accept either, and this is normal in Dubai. *Hurts an honest agent* only a little: one extra question. Never hidden.

## 5. Holiday-home pricing shown as a yearly rent: ask first

**Rule.** If the ad mentions bills included, serviced, a holiday-home operator, or monthly payment, ask whether it is a normal yearly tenancy registered in Ejari.

**Where it is wrong.** Some yearly lets include bills and are a good deal for a newcomer. *Hurts an honest agent* a little. The question is neutral.

## 6. Ad says tenanted or a later date: ask first

**Rule.** If the ad text says tenanted, or available from a later date, ask when it is really free.

**Where it is wrong.** "Tenanted" can be an investor sale where the tenant is the point. For buyers it is information, not a warning. *Hurts an honest agent* when the searcher reads it as a red flag. The wording says what the ad says, not that the ad is wrong.

## 7. Ad older than 90 days: ask first

**Rule.** Ads live more than 90 days are often already let or sold, so ask.

**Where it is wrong.** Large or expensive flats (penthouses, 4-beds) take longer. *Hurts an honest agent* with a slow-moving unit. The agent's quick "still available" answer clears it, and that answer is what TrueUnit shows next time.

## 8. The Verified badge is not proof it is available today

**Rule.** Show the badge, but never treat it as "available now". All 6 ads TrueUnit marks likely misleading carry the Verified badge, because the badge checks the ad when it is posted.

**Where it is wrong.** Not wrong as a rule, but it can feel unfair to agents who paid for verification. The answer: confirmed answers from TrueUnit should feed their ranking (see ONE-PAGER.md).

## When TrueUnit is not sure

It does not guess. It writes the question for the agent, shows the person why, and lets them decide. The agent's answer, and whether it held at the viewing, is what makes the next decision better.
