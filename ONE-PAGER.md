# TrueUnit: the real flats behind the ads

A Scout feature for one person searching. It groups ads into real flats, flags the ones that look misleading and says why, and asks the agent before the person spends a call or a Saturday on it. The agent stays in the deal.

## The problem behind the problem

**What the audit showed.** I checked all 242 live ads in Princess Tower, Dubai Marina (144 rent, 98 sale) on 25 Nov 2026. 94 of 242 (39%) need a question before they are worth a call: the same flat listed again at another price, also listed for sale or rent, "tenanted" in the text, holiday-home pricing shown as a yearly rent, or live for 90+ days. 6 use photos of a different flat. Identical photos, re-watermarked by two agencies, sell one flat at AED 2.0M and 2.1M. **All 6 likely-misleading ads carry the Verified badge.**

**Why it exists.** A listing is an ad that buys calls, not stock. Agents pay for visibility and are judged on leads, so a second copy of a flat, a low price or a let flat left online costs them nothing and still brings calls. Property Finder, Bayut and Dubizzle all check the ad when it is posted (Verified, TruCheck, DLD permits). Nobody checks the flat when the person is deciding.

**What people want.** Not fewer listings. They want one entry per real flat, and someone accountable saying it is free, at this price, on these terms. Today that "someone" is the one agent they give up and hand everything to.

## Where it lives

Not on the homepage. At the three moments trust breaks:

1. **Search results**: a banner, "Scout checked these 69 ads. They are 66 real flats; 21 need a question." with a "Real flats / All ads" switch. Misleading ads drop into a collapsed "hidden" section, with reasons.
2. **Listing page**: a "TrueUnit check" panel next to the price, with every reason and the other agencies' prices for the same flat.
3. **Before contacting**: "Confirm before I call" next to Call and WhatsApp. Scout sends the questions this listing needs and brings the answers back.

The shortlist and Scout's threads with agents live in the Property Finder account, so a search started on the web continues in the app, with a push notification when an agent answers. Scout's chat links straight into the same views.

## Why use it, and when not to

**Use it** to skip ten calls about flats that are gone, to see one flat's five prices side by side, and to get the price, cheques, deposit and agency fee in writing before a viewing.

**Just call the agent** when there is one ad and nothing is flagged, when you already trust the agent, when you need a viewing today, or when you want to negotiate by voice. Call is always one tap away.

## What it means for agents and Property Finder's revenue

Honest agents get serious leads: a known budget, move-in date and clear questions, answered in one tap from their app. Fast, accurate answers should raise the listing's rank and feed the SuperAgent score. Stale or bait ads lose rank instead of collecting calls. Agents pay for leads, so the risk is fewer raw calls; the argument to them is fewer wasted calls and more viewings per lead. Revenue: listing spend moves toward agents whose ads hold up, and searchers who trust the results come back.

## Metrics

**The big metrics for a portal**: searchers who become leads (contact rate), leads that become viewings, time from first search to a signed deal, searcher return rate; for agents, cost per lead and spend renewal.

**What TrueUnit moves.** Lead-to-viewing rate up (leads are pre-qualified and the flat is confirmed). Raw contacts per search flat or slightly down (fewer calls on bait). Return rate up. Rough size, as a hypothesis to test: if 39% of ads need a question, removing wasted calls could lift lead-to-viewing by 10-20%.

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
| 4 | Price checks against DLD registered rents and sales | Live ads are a biased benchmark | Government data not connected (allowed to skip) |
| 5 | Photo matching across the whole portal at upload | Catch reused photos before they go live, not only in one tower | Engineering help: image pipeline at scale |
| 6 | Scout understanding requests in plain words, inside Scout's chat | The entry point people already use | Scout's internal API |
| 7 | Account sync and push notifications between web and app | The web-to-app handoff | Internal accounts and notification systems |
| 8 | Arabic and other languages | Five markets, many first languages | Time; needs a review by native speakers |
