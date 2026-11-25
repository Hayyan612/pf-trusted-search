# TrueUnit: the real flats behind the ads

A personal assistant inside Scout for one person searching. It learns what they need in a minute, groups ads into real flats, hides the misleading ones and says why, gives them a short list they can trust, and asks the agents for them before they spend a call or a Saturday. The agent stays in the deal.

## The problem behind the problem

**What the audit showed.** I checked all 242 live ads in Princess Tower, Dubai Marina (144 rent, 98 sale) on 25 Nov 2026. 98 of 242 (40%) need a question before they are worth a call: the same flat listed again at another price, also listed for sale or rent, "tenanted" or an out-of-date date in the text, holiday-home pricing shown as a yearly rent, a different person named as the contact (5 ads), or live for 90+ days. 6 use photos of a different flat. Identical photos, re-watermarked by two agencies, sell one flat at AED 2.0M and 2.1M. **All 6 likely-misleading ads carry the Verified badge.** Against registered deals (DLD data via DataGuru), the typical rental ad asks 8% more than the same size actually rented for, and 58 of 144 rental ads ask 15%+ more, while registered 2-bed rents in the tower fell from AED 153,750 to 123,750 in a year. Ads lag the market. None of the 144 rental ads says whether cooling (chiller) is included, though in the Marina it can add several hundred dirhams a month. No ad used photos from the 8 neighbouring towers I checked: here, the misleading photos come from other flats in the same tower.

**Why it exists.** A listing is an ad that buys calls, not stock. Agents pay for visibility and are judged on leads, so a second copy of a flat, a low price or a let flat left online costs them nothing and still brings calls. Property Finder, Bayut and Dubizzle all check the ad when it is posted (Verified, TruCheck, DLD permits). Nobody checks the flat when the person is deciding.

**What people want.** Not fewer listings. They want one entry per real flat, and someone accountable saying it is free, at this price, on these terms. Today that "someone" is the one agent they give up and hand everything to.

## Where it lives

Not on the homepage. In the search itself, at the moments trust breaks:

1. **Starting a search**: Scout's box ("Tell Scout what you are looking for"). One sentence becomes a brief; Scout asks only what is missing (budget, move-in, who is moving or, for buyers, live in or invest and cash or mortgage; where they work and what they want nearby) and returns a **trusted top 5** with what fits, what to ask, a suggested offer from registered deals, and a map of their priorities and commute.
2. **Search results**: "Scout checked these 69 ads. They are 66 real flats; 28 need a question." A "Real flats / All ads" switch; misleading ads drop into a collapsed hidden section, with reasons.
3. **Listing page**: a "TrueUnit check" panel next to the price, the registered rents or sales for that size, and the other agencies' prices for the same flat.
4. **New to Dubai**: one tap turns on an expat guide (Ejari, DEWA, 1 vs 4 vs 12 cheques, chiller, the 5% housing fee) and an estimate of the cash needed to move in, on the shortlist and every rental listing. Most people searching in Dubai are expats.
5. **Before contacting**: "Confirm before I call" next to Call, or "Ask all 5 agents" from the shortlist. Scout asks for a name, how to reply (WhatsApp, email or app only) and consent, then sends each agent only the questions for their flat.

The brief, shortlist and answers live in the Property Finder account (built in the prototype: guest in the browser, synced when signed in), so a search started on the web continues in the app.

## Why use it, and when not to

**Use it** to skip ten calls about flats that are gone, to see one flat's five prices side by side, and to get the price, cheques, deposit and agency fee in writing before a viewing.

**Just call the agent** when there is one ad and nothing is flagged, when you already trust the agent, when you need a viewing today, or when you want to negotiate by voice. Call is always one tap away.

## What it means for agents and Property Finder's revenue

Honest agents get serious leads: a known budget, move-in date and clear questions, answered in one tap from their app. Fast, accurate answers should raise the listing's rank and feed the SuperAgent score. Stale or bait ads lose rank instead of collecting calls. Agents pay for leads, so the risk is fewer raw calls; the argument to them is fewer wasted calls and more viewings per lead. Revenue: listing spend moves toward agents whose ads hold up, and searchers who trust the results come back.

## Metrics

**The big metrics for a portal**: searchers who become leads (contact rate), leads that become viewings, time from first search to a signed deal, searcher return rate; for agents, cost per lead and spend renewal.

**What TrueUnit moves.** Lead-to-viewing rate up (leads are pre-qualified and the flat is confirmed). Raw contacts per search flat or slightly down (fewer calls on bait). Return rate up. Rough size, as a hypothesis to test: if 40% of ads need a question, removing wasted calls could lift lead-to-viewing by 10-20%.

## The one number

**Share of searchers who reach a confirmed viewing within 7 days of their first search.**

**Test on 1%.** Randomise 1% of Dubai rental searchers (by account) to see TrueUnit for 4 weeks; the rest see today's search. Guardrails: leads per agent, agent reply rate, complaints from agents.

**What proves me wrong.** No lift in the 7-day confirmed-viewing share, or agents' leads falling more than 10% without more viewings, or agents answering fewer than half of the requests.

## What I could not build

| # | Feature | Why it is needed | Why I could not add it |
|---|---|---|---|
| 1 | Real messages to agents through Property Finder's lead inbox and agent app | The whole "ask before I call" loop; answers on record | Internal Property Finder connection |
| 2 | Agent answers feeding listing rank and SuperAgent score | Makes honesty pay for agents | Internal ranking and SuperAgent systems |
| 3 | Unit identity from the DLD permit (building, floor, unit) | Duplicates without relying on photos; catches "same photos, different size" | Permit-to-unit data is internal / DLD integration |
| 4 | Price checks against all DLD registered deals, not just the last 5 per size | The prototype uses the 5 recent rents and sales Property Finder shows per listing (DataGuru); a full history would let it weight by floor, view and date | Internal DataGuru access |
| 5 | Photo matching across the whole portal at upload | Catch reused photos before they go live, not only in one tower | Engineering help: image pipeline at scale |
| 6 | TrueUnit inside the real Scout chat and app | The prototype has its own Scout box (LLM reads the brief; rules decide trust); the real one is where people already start | Scout's internal API and app |
| 7 | Push notifications when an agent answers | The prototype syncs the brief and shortlist to an account; the app should ping the person | Property Finder's notification system |
| 8 | Choosing between areas by commute (Marina vs JLT vs Barsha Heights), with real metro and tram times | The prototype covers one tower, so commute is the same for every flat; it shows a car estimate and links to Google Maps | An audit per area, and a paid routing API (Google Routes) for public transport |
| 9 | Arabic and other languages | Five markets, many first languages | Time; needs a review by native speakers |
