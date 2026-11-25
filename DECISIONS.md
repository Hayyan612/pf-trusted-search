# Decisions log

Times are IST on 2026-11-25. The challenge timer started at about 13:05.

| Time | Decision | Why | Decided by |
|---|---|---|---|
| 13:12 | Audit **Princess Tower, Dubai Marina** | Close to Property Finder's office in Dubai Media City; 144 rentals and 99 sales live, so renters and buyers use the same evidence | Hayyan |
| 13:12 | Host the prototype on my own Dokploy server | Already set up; no new accounts needed | Hayyan |
| 13:15 | Check **every** live listing (243), not just 30, then hand-check the cases the checks flag | Cheap to do with scripts; hand checks go where the signal is | Hayyan (proposed by Claude) |
| 13:18 | Drop "same size = duplicate" | Princess Tower stacks identical layouts across 101 floors, so 33 "duplicates" were different flats. See AI-LOG.md | Hayyan, after checking |
| 13:19 | Only count photo reuse across different flats when 2+ photos match | A single matching photo was usually a sea-view shot taken from the same tower | Hayyan, after viewing the photos |
| 13:22 | Name: **TrueUnit** | Says what it gives you: the real unit behind the ads | Hayyan |
| 13:24 | Problem behind the problem: listings are ads that buy calls, so a duplicate, a low price or a stale unit costs the agent nothing. People want one entry per real flat, confirmed by someone accountable | See research below | Hayyan |
| 13:24 | Where it lives: banner in search results, a check panel on each listing, "Confirm before I call" | The moments where trust breaks: scanning results, deciding to call | Hayyan |
| 13:24 | The one number: share of searchers who reach a confirmed viewing within 7 days | It measures trust turning into action, not clicks | Hayyan |
| 13:26 | Build with Next.js and shadcn/ui, look close to Property Finder and Scout | The UX team owns the final look; a familiar look keeps the focus on the idea | Hayyan |

## Research behind the angle (13:20-13:28)

How others handle fake listings:

- **Bayut TruCheck / Checked**: agent uploads Form A or an NOC, Bayut's team reviews it, badge and higher ranking. Checks the ad when it goes up.
- **Dubizzle Verified**: Dubizzle's team checks photos and details at upload.
- **DLD Madmoun / Trakheesi permits** (Dubai) and **Madhmoun** (Abu Dhabi): permit with a QR code per ad; Abu Dhabi's rollout cut listings from about 75,000 to about 20,000.
- **Housing.com (India)**: a relationship manager calls the owners or agents of the flats you shortlisted to confirm they are real and available. The only model that checks at decision time.
- **NoBroker (India)**: promises verified listings and a relationship manager; reviews complain about fake photos and managers who do not reply.

How Property Finder already handles it:

- **Verified badge** (quality control team, at posting), **regular availability checks** and the **Listing Action Tracker**, **SuperAgent** ranking (response time, quality score 85-90%, reported listings), removal for rule breaches, and **100% DLD permit compliance** since Nov 2025.
- Its own listing data already carries a quality score, an availability flag and an "under offer elsewhere" flag, but people searching do not see a combined view.

What this says: everyone checks the **ad** when it is posted. Nobody checks the **flat** at the moment the person decides, and nobody collapses many ads into one real flat. In our audit, all 6 listings TrueUnit marks likely misleading carry the Verified badge.

## Later decisions (25 Nov, after the first build; times approximate)

| Time | Decision | Why | Decided by |
|---|---|---|---|
| 13:40 | Responsive: a real desktop layout, not a phone frame on desktop | Reviewers will open it on laptops too | Hayyan |
| 13:45 | Optional accounts (email, Google), guests never blocked | Makes the web-to-app handoff real without a login wall for reviewers | Hayyan |
| 14:10 | Look and structure close to Property Finder's listing page (agent card, details, regulatory info) | Familiar to the team; keeps attention on the idea | Hayyan |
| 14:35 | Use DataGuru's registered rents and sales (shown on each listing) for the price check, instead of live-ad medians | Live ads are a biased benchmark; registered deals show what people actually paid | Hayyan |
| 14:40 | shadcn components throughout, interactive price chart | Consistent, accessible UI | Hayyan |
| 14:45 | Dropped the Vercel copy | One live link is enough; less to maintain | Hayyan |
| 15:00 | Build a personal assistant, not just a better search page | The brief asks for a personal assistant and a short list they can trust | Hayyan |
| 15:00 | LLM only reads the person's words and picks which component to show; deterministic rules decide trust; nothing is sent to agents without the person's tap | Explainable, defensible, and cannot invent listings or prices | Hayyan |
| 15:05 | Onboarding: one sentence, then only the missing essentials, different for renters and buyers; contact and consent at the moment of sending; sign-up offered after sending | A minute to value; ask for personal data only when it is needed | Hayyan |
| 15:20 | Checked photos against 343 ads in 8 neighbouring towers: no match. Added a check for ads that name a different person to contact (5 ads) | The brief asks whether photos match the building; the agent mismatch came up while reading ads | Hayyan |
| 15:35 | Expat mode: "first home in Dubai?" in onboarding, a glossary, a move-in cost estimate with 1/2/4/12 cheques, and a chiller question to every rental agent | Most of Dubai's residents are expats (about 92% by secondary estimates); none of the 144 rental ads say whether cooling is included | Hayyan |
| 15:50 | Added: what to offer (from registered deals), a full message per agent, a 60-second demo, and a location card (MapLibre + OpenFreeMap, OpenStreetMap places, commute estimate) with the person's priorities | Make "deals with agents for you" concrete, save the person money with our strongest evidence, and let reviewers see the whole loop fast. Did not add live scraping of other areas: one tower is the evidence base | Hayyan |
