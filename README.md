# TrueUnit by Scout (prototype)

A Scout feature that shows the real flats behind the ads, explains which ads look misleading, and asks the agent before you call. Built on real Property Finder listings from Princess Tower, Dubai Marina.

**Live:** http://pf-trusted-search-e7cqex-164-52-211-4.traefik.me (works on a phone and on desktop)

Try:
- **Renter flow:** Scout home > "2-bed to rent" > Real flats > open a flat > Confirm before I call > Shortlist (agent reply arrives after a few seconds)
- **Buyer flow:** Buy > 2 bed > open the hidden section at the bottom > a "Likely misleading" ad and why
- **Agent side:** Agent view

## Accounts (optional)

Everything works without an account. Signing up (email and password, or Google) saves your shortlist and the agents' answers to your account, so a search started on a laptop continues on a phone. This is the web-to-app handoff from the one-pager, made real.

- Auth: Better Auth on Postgres. Tables are created on first use (`lib/db.ts`); `/api/health` reports the database state.
- Shortlist sync: `GET/PUT /api/shortlist`, merged with the device's shortlist when you sign in.
- Google sign-in turns on when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set.

## Docs

- [ONE-PAGER.md](ONE-PAGER.md): the problem, where it lives, metrics, the test, what is missing
- [AUDIT.md](AUDIT.md): all 242 ads checked, 87 listed one by one with links
- [RULES.md](RULES.md): the rules and where each one is wrong
- [AI-LOG.md](AI-LOG.md): five times the AI was confidently wrong, and how it was caught
- [DECISIONS.md](DECISIONS.md): decisions with times, and the research behind them

## How to run

```bash
pnpm install
cp .env.example .env.local   # DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL (Google keys optional)
pnpm dev            # http://localhost:3000
```

Rebuild the data (needs `uv`):

```bash
uv run scripts/photos.py      # photo fingerprints for every ad
uv run scripts/build_data.py  # checks + real-flat grouping -> data/app-data.json
python3 scripts/write_audit.py  # AUDIT.md
```

## What is real and what is mocked

| Real | Mocked |
|---|---|
| All 242 ads: price, size, beds, photos, agent, agency, text, listing date, Verified badge, captured from propertyfinder.ae on 25 Nov 2026 (`data/raw/princess.json`) | Sending questions to the agent, and the agent's reply (simulated after a few seconds) |
| Every check and every reason shown (`scripts/build_data.py`) | Agent view numbers (reply time, accuracy) |
| Photo matches between ads (perceptual hashes of each ad's first 3 photos) | Web-to-app sync and notifications (described, not built) |
| Tower medians per sq ft, from the live ads | Scout's chat box on the home screen (the suggestions link into search) |
| Accounts and the synced shortlist (real, stored in Postgres) | |

Stack: Next.js 15, shadcn/ui, Tailwind. Deployed with Docker on my own server.
