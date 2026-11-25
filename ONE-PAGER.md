# TrueUnit: fewer, better decisions

Scout today helps people find more homes. TrueUnit makes Scout help one person decide: it groups ads into real flats, hides the misleading ones and says why, shows what moving in really costs, and asks the agents on the person's behalf. The agent stays in the deal.

## The problem behind the problem

On 25 Nov 2026 I checked all 242 live ads in Princess Tower, Dubai Marina (144 rent, 98 sale).

- **98 of 242 (40%) need a question before they are worth a call**: the same flat at another price, tenanted or available later, a different contact named, or live for 90+ days.
- **6 use photos of a different flat, and all 6 carry the Verified badge.**
- **Rental ads ask a median 8% above registered deals** (DLD data via DataGuru). 58 of 144 ask 15% or more above. Registered 2-bed rents fell from AED 153,750 to 123,750 in a year.
- **0 of 144 rental ads say whether chiller is included.**

The cause: a listing is an ad that buys calls, not stock. A stale or duplicate ad costs the agent nothing and still brings calls. Portals check the ad when it is posted. Nobody checks the flat when the person is deciding.

## Where it lives

Three pillars, each placed where trust breaks:

1. **Listing integrity, in search.** "Scout checked these 144 ads: 140 real flats." Property Finder's own filters, plus a real-flats switch; misleading ads are folded away with the reason.
2. **Financial clarity, on the listing.** Registered rents for that size, an estimate of the cash needed to move in (cheques, deposit, Ejari, DEWA, cooling), and an AI negotiation brief built only from registered deals.
3. **Agent intelligence, in a Scout panel beside the listing.** One-tap and free-text questions; Scout answers from the ad, quotes it, and sends the rest to the agent only after the person confirms. Replies come back into one thread: nudges, viewings, feedback and an offer. Each fact is labelled **agent confirmed, checked, not verified, or conflicting**. An agent's word is not proof.

The brief and shortlist sync to the account, so web and app continue each other.

## Why use it, and when not to

Use it to skip calls about flats that are gone, compare one flat's prices across agencies, and get the price, cheques and fees in writing before a viewing. Just call when there is one clean ad, when you already trust the agent, or when you need a viewing today. Call stays one tap away.

## What it means for agents and Property Finder

Honest agents get qualified leads: a known budget, move-in date and specific questions. Fast, accurate answers should raise the ad's rank and SuperAgent score; stale ads lose rank instead of collecting calls. The risk is fewer raw calls. The argument to agents: fewer wasted calls, more viewings per lead. For Property Finder: spend shifts to ads that hold up, and searchers who trust results come back.

## Metrics

Portal metrics: contact rate, lead-to-viewing rate, time to a signed deal, return rate; for agents, cost per lead and renewal. TrueUnit should raise lead-to-viewing and return rate, with raw contacts flat or slightly down.

## The one number

**Verified viewing rate: the share of searchers who book a viewing after Scout has checked the details, within 7 days of their first search.**

Test on 1% of Dubai rental searchers for 4 weeks against a control group. Target: a 15% relative lift. Guardrails: leads per agent, agent reply rate, agent complaints.

**What proves me wrong:** no lift, leads per agent falling more than 10% without more viewings, or agents answering fewer than half of the requests.

## What I could not build

| Feature | Why it matters | Why not here |
|---|---|---|
| Real messages through the lead inbox and agent app | The ask-confirm loop on record; replies here are simulated and labelled | Internal systems |
| Agent answers feeding rank and SuperAgent score | Makes honesty pay | Internal ranking |
| Unit identity from the DLD permit | Duplicates without relying on photos | DLD / internal data |
| Full DLD deal history | Weight by floor, view and date, not 5 recent deals | Internal DataGuru access |
| Photo matching at upload, portal-wide | Stop reused photos before they go live | Image pipeline at scale |
| Comparing areas by commute | One tower here, so commute is the same for every flat | An audit per area and a routing API |
