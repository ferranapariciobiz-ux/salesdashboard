# Sales Dashboard

Internal dashboard for tracking the sales team's daily performance (1 closer, 2 setters today, but reps can be added anytime).

## How it works

- **`/report`** — no-login page where the closer/setters submit their daily numbers. Picking a name adapts the form to that person's role (closer vs. setter fields). Submitting again for the same person + date overwrites that day's entry instead of creating a duplicate.
- **`/dashboard`** — the metrics view: team totals, per-rep breakdown tables, and trend charts, filterable by date range. Sits behind a shared-password gate.
- **`/dashboard/reps`** — add/deactivate closers and setters. New reps show up on `/report` immediately. Same password gate as `/dashboard`.

Data is stored in Postgres via Prisma.

## Metrics and formulas

**Closer:**
| Metric | Formula |
|---|---|
| Show up rate | Calls taken / Calls scheduled |
| No-show rate | No shows / Calls scheduled |
| Cancel rate | Cancelled / Calls scheduled |
| Reschedule rate | Rescheduled / Calls scheduled |
| Offer rate | Offers / Calls taken |
| Close rate | Closes / Calls taken |
| Cash per booked call | Cash collected / Calls scheduled |
| AOV | Revenue / Closes |
| Upfront cash | Sum of deposits collected |

A rescheduled call does **not** count against no-show or cancel rate — it's tracked separately and isn't re-entered as a new "scheduled" call on its new date (per Ferran's rule: avoid double-counting the same booked call).

**Setter:**
| Metric | Formula |
|---|---|
| Dial-to-set rate | New sets / Outbound dials |
| Triage completion rate | Triages completed / Inbound triages |
| DQ rate | DQs / (Outbound dials + Inbound triages) |

Formulas live in [`src/lib/metrics.ts`](src/lib/metrics.ts) — if any of these should be calculated differently, that's the one file to change.

## Running locally

Needs a Postgres connection string in `.env` as `DATABASE_URL` (the same hosted dev database the live site uses is the simplest option for a team this size — ask whoever set up the Netlify DB for the connection string). Alternatively, run `netlify link` once and then use `netlify dev` instead of `npm run dev`, which spins up a local Postgres automatically.

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. `/dashboard` will redirect to `/login` unless `DASHBOARD_PASSWORD` is also set in `.env` — leave it unset locally to skip the gate.

## Deployment (Netlify)

This app is built to deploy on Netlify with zero extra config beyond environment variables:

- **Database**: [Netlify DB](https://docs.netlify.com/build/data-and-storage/netlify-database/) (Postgres, powered by Neon), provisioned from the site's dashboard or via `netlify database init`. Netlify injects the connection string as `NETLIFY_DB_URL`, which `prisma.config.ts` and `src/lib/db.ts` fall back to automatically if `DATABASE_URL` isn't set.
- **Build**: `npm run build` runs `prisma db push` (syncs the schema straight to Postgres, no migration files to manage) before `next build`. `netlify.toml` wires up `@netlify/plugin-nextjs`.
- **Password gate**: set a `DASHBOARD_PASSWORD` environment variable on the Netlify site. `/dashboard` and `/dashboard/reps` redirect to `/login` until the right password is entered (see `src/proxy.ts`, `src/lib/auth.ts`). `/report` is never gated.

### One-time setup

1. Push this repo to GitHub (already configured to push to `ferranapariciobiz-ux/salesdashboard`).
2. In Netlify: **Add new site → Import an existing project** → pick the repo. Netlify auto-detects Next.js.
3. On the new site, provision a database: **Site → Extensions/Databases → Netlify DB** (or run `netlify database init` from the CLI once linked). This sets `NETLIFY_DB_URL` automatically — no need to set `DATABASE_URL` yourself.
4. Add the `DASHBOARD_PASSWORD` environment variable under **Site configuration → Environment variables**, set to whatever password you want to share with your cofounder/team.
5. Trigger a deploy. First deploy runs `prisma db push` against the fresh database, creating all the tables.

After that, every push to the main branch redeploys automatically, and the site is reachable at the `*.netlify.app` URL (or a custom domain) at all times — no local server needs to be running to share it.
