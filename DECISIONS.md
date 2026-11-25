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
