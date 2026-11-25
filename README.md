# TrueUnit by Scout (prototype)

A personal search assistant inside Scout. It learns what one person needs, checks every ad in the building, hides the misleading ones with reasons, gives them a short list they can trust, and asks the agents for them before they call. The agent stays in the deal. Built on real Property Finder listings from Princess Tower, Dubai Marina.

**Live:** https://trueunit.hayyan.space (phone and desktop)

Try:
- **60-second demo:** https://trueunit.hayyan.space/assistant?demo=1 loads an example brief (2-bed, 130k, January, couple, cat, works at Property Finder in Media City, wants a gym, metro and supermarket nearby, new to Dubai)
- **Renter flow:** Scout assistant > "2-bed to rent under 130k a year, furnished, moving in January, I have a cat" > answer the quick questions > Build my shortlist > Ask all 5 agents (add a name and number, tick consent) > Shortlist: answers arrive in a few seconds > pick a viewing time
- **Buyer flow:** Scout assistant > "Buy a 2-bed to rent out, budget 2.5 million" > cash or mortgage > shortlist with investor questions (current rent, service charges)
- **New to Dubai:** start with "Moving to Dubai from London in January, 1-bed to rent under 100k" > the expat guide explains Ejari, DEWA, cheques, chiller and housing fee, and shows the cash needed to move in for the #1 flat (change 1 / 2 / 4 / 12 cheques)
- **Browse instead:** Rent or Buy > Real flats vs All ads > open the hidden section at the bottom > a "Likely misleading" ad and why
- **Agent side:** Agent view

## How Scout works

| Part | Who decides | Why |
|---|---|---|
| Reading the person's words into a brief | An LLM (Vercel AI SDK, OpenRouter, structured output). Falls back to built-in rules without a key. | Language is what LLMs are good at. The brief is shown back and editable. |
| Follow-up questions for missing essentials | Code (`missingEssentials`) | Ask only what is missing: budget, bedrooms, move-in, who is moving / live-in or invest / cash or mortgage. |
| Which ads are misleading, and the trusted top 5 | Deterministic rules (`scripts/build_data.py`, `lib/match.ts`) | Explainable and repeatable. The model never judges trust. |
| What to offer | Code (`lib/negotiate.ts`) from registered deals | A suggestion grounded in what the same size actually rented or sold for |
| Location: map, commute, what is nearby | MapLibre GL + OpenFreeMap tiles; places from OpenStreetMap (Overpass), live with a saved fallback; car times are estimates with Google Maps links for exact routes | The person's priorities (gym, metro, office) shown on a real map |
| Message to each agent | Code (`lib/message.ts`) from the brief, the flat's open questions and the suggested offer | Readable, copyable, the person sees exactly what is sent |
| Chat ("only furnished", "why is #1 top?") | The LLM picks from 5 tools; each result renders as a shadcn component filled from real data | Generative UI without letting the model invent a listing or price. |
| Contacting agents | The person, after adding contact details and ticking consent | Nothing is sent without a tap. |
| Questions on a listing (Scout panel beside the ad) | Code answers one-tap questions from the ad text with a quote. Free-text questions: the LLM splits and rewrites them and may quote the ad; every quote is checked against the ad text in code (`lib/custom-questions.ts`) | Answer from the ad before bothering the agent; the person picks what is sent |
| Negotiation brief | The LLM, given only registered deals, other ads and TrueUnit's checks; code rejects numbers out of order; rules fallback (`lib/negotiation-brief.ts`) | Saves money with evidence, cannot invent a price |
| What is known about each flat | Code (`lib/facts.ts`): agent confirmed, checked (data or a viewing), not verified, conflicting | An agent's answer is their word, not proof |
| Agent replies, nudges, viewing confirmations, offer answers | **Simulated** in the browser (`components/agent-simulator.tsx`) and labelled so | Shows the full loop; the real version needs Property Finder's lead inbox |

## Accounts (optional)

Everything works as a guest: the brief, shortlist and contact details stay in the browser. Signing up (email and password, or Google) saves the brief, shortlist and agents' answers to the account, so a search started on a laptop continues on a phone. The newer copy wins when you sign in.

- Auth: Better Auth on Postgres. Tables are created on first use (`lib/db.ts`); `/api/health` reports the database state.
- Sync: `GET/PUT /api/shortlist` and `GET/PUT /api/brief`.
- Google sign-in turns on with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Scout's AI turns on with `OPENROUTER_API_KEY` (model: `ASSISTANT_MODEL`, default `google/gemini-2.5-flash`).

## Docs

- [ONE-PAGER.md](ONE-PAGER.md): the problem, where it lives, metrics, the test, what is missing
- [AUDIT.md](AUDIT.md): all 242 ads checked, 92 listed one by one with links
- [RULES.md](RULES.md): 10 rules, where each one is wrong, and who gets hurt
- [AI-LOG.md](AI-LOG.md): six times the AI was confidently wrong, and how it was caught
- [DECISIONS.md](DECISIONS.md): decisions with times, and the research behind them

## How to run

```bash
pnpm install
cp .env.example .env.local   # DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL; optional Google, OpenRouter, SMTP keys
pnpm dev                     # http://localhost:3000
```

Rebuild the data (needs `uv`):

```bash
uv run scripts/photos.py             # photo fingerprints for every ad
uv run scripts/photos_neighbours.py  # photos vs 343 ads in 8 neighbouring towers
uv run scripts/build_data.py         # checks, registered deals, real-flat grouping -> data/app-data.json
python3 scripts/write_audit.py       # AUDIT.md
```

## What is real and what is mocked

| Real | Mocked |
|---|---|
| All 242 ads: price, size, beds, photos, agent, agency, text, listing date, Verified badge, captured from propertyfinder.ae on 25 Nov 2026 (`data/raw/`) | Sending questions to agents, their replies, and viewing confirmation (simulated after a few seconds) |
| Every check and every reason shown (`scripts/build_data.py`) | Agent view numbers (reply time, accuracy) |
| Nearby places from OpenStreetMap; commute by car as an estimate (distance x road factor, off-peak and rush-hour speeds) | Exact metro/tram times (link to Google Maps instead) |
| Expat guide figures (DEWA deposit, Ejari, 5% housing fee, deposit, agency fee, chiller) as ranges from public renting guides, linked in the app | |
| Registered rents and sales per size and price trends: the DLD records Property Finder shows via DataGuru (`data/raw/dataguru.json`) | Push notifications when an agent answers (described, not built) |
| Photo matches between ads, and against 343 ads in 8 neighbouring towers (perceptual hashes) | |
| The brief, follow-up questions, trusted top 5, contact and consent, accounts and sync (Postgres) | |

Stack: Next.js 15, shadcn/ui, Tailwind, Vercel AI SDK, OpenRouter, Better Auth, Postgres. Deployed with Docker on my own server (Dokploy).
