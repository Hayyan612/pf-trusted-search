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

**How many people book a viewing after Scout checks the flat for them.**

A viewing is when someone stops scrolling and actually goes to see a home. That's the step all the wasted calls get in the way of. If Scout works, more people should get there, and faster.

To test it, I'd turn Scout on for 1 in every 100 people renting in Dubai for 4 weeks, and compare them with everyone else.

My starting guess is about 15% more viewings (if 10 in 100 book one today, that's 11 or 12). I'd set the real target with the team from three things: how many people book viewings today, whether 1 in 100 gives us enough people to notice the change, and what lift makes Scout worth running.

**I'm wrong if** viewings don't go up, if agents get a lot fewer leads without getting more viewings, or if agents don't answer at least half of Scout's questions.

## What I couldn't build

These need Property Finder's own systems, which I don't have access to:

- **Real messages to agents.** In my prototype the agents' replies are pretend, and labelled that way. The real thing would go through Property Finder's agent app.
- **Rewarding honest agents.** Fast, true answers should push an agent's ads higher. That needs Property Finder's ranking.
- **Knowing the exact flat.** Every ad has a government permit. Matching ads by permit would spot repeats without guessing from photos.
- **All past deals, not just 5.** More history would make the "fair price" check much sharper.
- **Checking photos when an ad is posted.** Catching reused photos before the ad goes live, across the whole site, not just one tower.
