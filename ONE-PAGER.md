# TrueUnit: fewer, better decisions

I built a personal assistant for people renting or buying in Dubai. It's on their side, but it works with agents, not around them. It checks the ads before you spend a call, asks every agent only what their ad doesn't say, and puts every answer in one place.

## The problem behind the problem

I pulled every Princess Tower ad from Property Finder (242: 144 rent, 98 sale, 25 Nov 2026), let code group repeats and match photos, then checked what it flagged.

**98 of 242 needed a question before they were worth a call.** Most weren't fake, just stale or silent: live 90+ days, also for sale, "tenanted" in the small print. Not one rental ad says if chiller is included. And the typical rental ad asks 8% more than the same size actually rented for (DLD records via DataGuru).

The photos taught me the most. My rule hid 6 ads that shared photos with an ad of a different size, and **all 6 said Verified**. Most turned out to be one flat listed for rent and sale with a size typo, so my rule was too harsh. But one pair was two sale ads, AED 2.0M and 2.7M, with the same photos.

Why? An ad buys calls, not flats. A stale copy or a reused photo costs the agent nothing and still rings the phone. The badge checks the ad when it goes up, not the flat when you're deciding.

## Where it lives

Not on the homepage. People need help right before they waste time or money:

- **In search:** "144 ads, 140 real flats", with the odd ones folded away and the reason shown.
- **On a listing:** an "Ask Scout" panel beside the ad. It answers from the ad when it can, shows the price against registered rents and the cash to move in, and adds what the ad doesn't say to your questions.
- **Before you call:** "Confirm before I call" sends those questions after you've seen them. Answers come back into one thread, each marked agent confirmed, checked, not verified, or conflicting.

Your brief and shortlist save to your account, so you can start on a laptop and finish on your phone.

## When not to use it

Just call when there's one ad and nothing's flagged, when you trust the agent, or when you need to see it today. Scout waits for written answers, which is slower. The Call button stays one tap away.

## What it means for agents and Property Finder

Honest agents get better leads: a known budget, move-in date and specific questions, not "is this still available?" ten times a day. The risk is fewer raw calls, and agents pay for leads. But more viewings per lead is a better deal, and if fast, true answers lift an ad's rank, honesty starts to pay. People who trust the results come back.

## Metrics

Property Finder already watches contacts, lead-to-viewing, time to a deal and return rate. I'd expect lead-to-viewing and return rate to go up, with raw contacts flat or slightly down.

## The one number

**How many people book a viewing after Scout checks the flat for them.**

A viewing is when someone stops scrolling and goes to see a home. That's the step all the wasted calls get in the way of.

I'd turn Scout on for 1 in every 100 people renting in Dubai for 4 weeks and compare them with everyone else. My starting guess is about 15% more viewings (10 in 100 becomes 11 or 12). I'd set the real target with the team: today's viewing rate, whether 1 in 100 is enough people to notice, and what lift makes Scout worth running.

**I'm wrong if** viewings don't go up, if agents get a lot fewer leads without more viewings, or if agents don't answer at least half of Scout's questions.

## What I couldn't build

These need Property Finder's own systems:

- **Real messages to agents.** The prototype's replies are pretend, and labelled that way.
- **Rewarding honest agents** in ranking.
- **Knowing the exact flat** from its government permit, instead of guessing from photos.
- **All past deals, not just 5,** for a sharper fair-price check.
- **Checking photos when an ad is posted,** across the whole site.
