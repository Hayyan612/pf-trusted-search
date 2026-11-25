# TrueUnit: fewer, better decisions

I built a personal assistant for people renting or buying in Dubai. It's on their side, but it works with agents, not around them.

It does three things. It checks the ads before you spend a call. It remembers what you need and asks every agent only what their ad doesn't already say. And it puts every answer in one place, so you can decide.

## The problem behind the problem

I didn't read 242 ads one by one. I pulled every Princess Tower ad from Property Finder (144 rent, 98 sale, 25 Nov 2026), let code group the repeats and match photos, then checked what it flagged.

**98 of 242 needed a question before they were worth a call.** Most weren't fake, just stale or silent: live 90+ days, also listed for sale, "tenanted" in the small print. Not one of 144 rental ads says if chiller is included.

Prices lag too. The typical rental ad asks 8% more than the same size actually rented for (DLD records via DataGuru), and 58 of 144 ask 15% or more. Registered 2-bed rents here fell from AED 153,750 to 123,750 in a year.

The photos taught me the most. My rule hid 6 ads that shared photos with an ad of a different size, and **all 6 said Verified**. When I opened them, most were one flat listed for rent and sale with a size typo, so my rule was too harsh. But one pair was two sale ads, AED 2.0M and 2.7M, with the same photos. From the ad alone you can't tell which flat you'd see.

Why does this exist? An ad buys calls, not flats. A stale copy or a reused photo costs the agent nothing and still rings the phone. And the badge checks the ad when it goes up, not the flat when you're deciding.

## Where it lives

Not on the homepage. People don't need help while browsing; they need it right before they waste time or money.

- **In search:** "144 ads, 140 real flats", with the odd ones folded away and the reason shown.
- **On a listing:** an "Ask Scout" panel beside the ad. It answers from the ad when it can, shows the price against registered rents and the cash you'd need to move in, and adds anything the ad doesn't say to your questions.
- **Before you call:** "Confirm before I call" sends those questions for you, after you've seen them. Answers come back into one thread, and each fact is marked agent confirmed, checked, not verified, or conflicting. An agent's word isn't proof.

Your brief and shortlist save to your account, so you can start on a laptop and get the answers on your phone.

## When not to use it

Just call when there's one ad and nothing's flagged, when you already trust the agent, or when you need to see it today. Scout waits for written answers, which is slower than a call. Same if you'd rather negotiate by voice. The Call button stays one tap away.

## What it means for agents and Property Finder

Honest agents get better leads: a known budget, move-in date and specific questions, not "is this still available?" ten times a day.

The risk is fewer raw calls, and agents pay for leads. But fewer wasted calls and more viewings per lead is a better deal. If fast, accurate answers lift an ad's rank and SuperAgent score, honesty starts to pay, and stale ads lose visibility instead of collecting calls. For Property Finder: people who trust the results come back.

## Metrics

The portal already watches contact rate, lead-to-viewing, time to a signed deal and return rate. I'd expect TrueUnit to raise lead-to-viewing and return rate, with raw contacts flat or slightly down. That drop is fine if viewings go up.

## The one number

**Verified viewing rate:** the share of searchers who book a viewing after Scout has checked the details, within 7 days of their first search.

I picked it because a viewing is where a search becomes a deal, and it's the step all the wasted calls get in the way of. I'd test it on 1% of Dubai rental searchers for 4 weeks against a control group, aiming for a 15% lift, while watching leads per agent and how often agents reply.

**I'm wrong if** viewings don't go up, if agents lose more than 10% of leads without more viewings, or if agents answer fewer than half of Scout's questions. Then the idea doesn't work, however nice it looks.

## What I couldn't build

| What | Why it matters | Why not here |
|---|---|---|
| Real messages through the lead inbox and agent app | Answers on record. Replies in the prototype are simulated and labelled | Internal systems |
| Agent answers feeding rank and SuperAgent score | Makes honesty pay | Internal ranking |
| Unit identity from the DLD permit | Spot duplicates without guessing from photos | DLD and internal data |
| Full registered-deal history | Weigh price by floor and view, not 5 recent deals | Internal DataGuru access |
| Photo matching at upload, across the portal | Stop reused photos before they go live | Image pipeline at scale |
