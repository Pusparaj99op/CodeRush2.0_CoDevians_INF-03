# Veldar Website (Frontend + Backend)

Backend scaffold for the orchestrator + Algorand x402 facilitator described in
[`Doc/specs/02-website.md`](../Doc/specs/02-website.md).

## Setup

```bash
cd website
npm install
cp .env.example .env.local   # optional — public TestNet defaults work out of the box
npm run dev
```

Server runs at `http://localhost:3000`.

## Frontend

Landing page (`/`) and web dashboard (`/dashboard`) built with Next.js App
Router + Tailwind v4 + Motion, using the brand palette in
`app/globals.css` (`@theme` block: near-black background, orange CTA
`#FF5228`, indigo accent `#6B5EF5`) and the font stack Poppins (UI/body,
via `next/font`), Inter (small/meta text), and FlechaM-Medium (display
headlines — licensed font, not bundled; see the `@font-face` comment in
`app/globals.css` for how to drop it in once you have the files).

The dashboard is a real client for the orchestrator API above: it submits
a goal via `POST /api/workflows`, polls `GET /api/workflows/:id/trace`,
and can approve/deny via `POST /api/workflows/:id/approve`.

### Google Sign-In (Firebase)

Auth reuses the same Firebase project as the Flutter app (project number
`511913451189`, Android app `1:511913451189:android:22c363e9d044db05ca68fc`),
but the web SDK needs its **own Web app registration** — the Android app ID
alone doesn't give you the API key/authDomain the JS SDK needs:

1. Firebase console → that project → Project settings → Add app → Web.
2. Copy the generated config into `.env.local` as the `NEXT_PUBLIC_FIREBASE_*`
   values (see `.env.example`).
3. Enable the Google sign-in provider under Authentication → Sign-in method,
   if it isn't already on for the Android app.

Until those env vars are set, `lib/firebase.ts` reports `isFirebaseConfigured
= false` and the UI shows a "Firebase isn't configured yet" state instead of
crashing.

**If sign-in fails on a deployed domain** (`auth/unauthorized-domain` in the
error banner the UI now shows): Firebase only allows Google sign-in from
domains explicitly listed under Authentication > Settings > Authorized
domains. `localhost` is allowlisted by default, but a new deploy domain is
not. Add every domain the site is served from, e.g.:

- `veldar-gray.vercel.app`
- `codevians.online` and `www.codevians.online`
- any other Vercel preview domain you test from

`lib/auth-context.tsx` also falls back from popup to `signInWithRedirect`
automatically when the popup is blocked or closed (common on iOS Safari /
in-app browsers), and surfaces the real Firebase error message in the UI
instead of failing silently.

### Sign in / sign up

Dedicated pages, not just a nav button: `/signin`, `/signup`, and
`/forgot-password`. Both Google and email/password are supported, so
**enable Email/Password too** under Authentication → Sign-in method.
Signed-out visits to `/dashboard/*` redirect to `/signin?next=…` and land
back where they were headed. Sign-out lives in the nav account menu and on
the Settings page.

### Full app access from the website

The dashboard is a tab shell (`components/dashboard-shell.tsx`), not a
single page: **Overview** (submit a goal, approve/deny, live trace),
**Workflows** (`/dashboard/workflows`, full history via `GET
/api/workflows`), and **Settings** (`/dashboard/settings`, profile
and default tier). Every workflow links to its full `/trace/[id]` view.

## What's implemented

- **Orchestrator** (`lib/orchestrator.ts`): compiles a goal into a step
  graph, quotes each step against the marketplace, enforces the
  subscription-tier budget cap, opens human-approval gates when a step
  exceeds the cap or targets an unverified provider, and verifies
  fulfillment before a workflow is marked complete.
- **Provider client** (`lib/provider-client.ts`): the outbound x402
  consumer flow — POST unpaid, get a 402 with terms, pay them, POST again
  with proof. This is what actually buys work from the laptop-server.
- **Payer** (`lib/payer.ts`): signs and submits the TestNet payment. The
  only module holding a key, and it refuses to sign against a non-TestNet
  node. See "Settlement modes" below.
- **Algorand x402 facilitator** (`lib/facilitator.ts`): verifies a payment
  against Algorand TestNet (algod, falling back to the indexer for txns
  older than the pending window) and issues idempotent settlement
  receipts. Asserts the on-chain receiver and amount rather than trusting
  the submitted payload. Supports both `exact` and `upto` schemes.
- **Persistence** (`lib/store/`): Firestore when
  `FIREBASE_SERVICE_ACCOUNT_JSON` is set, otherwise an in-memory fallback.
  Set it on Vercel — without it, each serverless instance has its own
  store and workflows appear to vanish between requests.
- **API auth** (`lib/api-auth.ts`): routes derive the caller from a
  verified Firebase ID token (`Authorization: Bearer`), not a
  client-supplied `userId`.
- **API routes** (`app/api/**`): matches the table in
  `Doc/specs/02-website.md`.

## Settlement modes

Set by one thing only: whether `DEMO_PAYER_MNEMONIC` is present.

| | `simulated` (default, keyless) | `real` |
|---|---|---|
| Setup | none | 25-word TestNet mnemonic, faucet-funded |
| Chain | never contacted | txn signed, submitted, confirmed |
| txnHash | `SIMULATED-…` | real Algorand txn id |
| Receipts/ledger | flagged `simulated: true` | `simulated: false` |

Simulated mode exists so the demo runs end-to-end on a fresh clone with no
key and no funds. It never pretends otherwise: a synthetic txn id is
rejected outright once a real payer key is configured, and the two
placeholder marketplace providers (`*.example`, flagged `mock: true`) are
labelled as mocks in `GET /api/providers` and in the trace.

## Connection to the laptop-server

`GET /api/providers` probes the laptop's `/health` on every request, so a
dropped tunnel shows as offline rather than being quoted and then failing
mid-payment. The laptop fetches its payee address from
`GET /api/facilitator/terms` instead of duplicating it in its own env —
previously both sides read separate env vars that had to agree by hand,
and when they didn't the only symptom was a verification failure *after*
the payment had been made.

Point `LAPTOP_SERVER_URL` at the tunnel; `/infer` and `/health` are derived
from it.

## API surface

| Endpoint | Purpose |
|---|---|
| `POST /api/workflows` | Submit `{ goal, budgetAlgo, tier? }` with a Bearer ID token; returns a compiled workflow, already advanced as far as it can go. |
| `GET /api/workflows` | The caller's workflows, newest first. |
| `GET /api/workflows/:id` | Workflow status, step graph, last 10 ledger events. |
| `GET /api/workflows/:id/trace` | Full replayable trace. |
| `POST /api/workflows/:id/approve` | `{ approvalId, decision }` — approve/deny a pending step. |
| `POST /api/workflows/:id/cancel` | Cancel a running workflow; returns delivered vs. not-purchased steps. |
| `POST /api/workflows/:id/steps/:stepId/execute` | Buy one step's work; use it to retry after a provider outage. |
| `GET /api/facilitator/terms` | Canonical payee address providers should quote in their 402. |
| `POST /api/facilitator/verify` | `{ workflowId, stepId, payload }` — verify a payment payload against declared terms. |
| `POST /api/facilitator/settle` | Same body — confirm settlement, issue a receipt. |
| `GET /api/providers` | Marketplace providers with live `status` from a health probe, plus the active settlement mode and store backend. |

## Try it end-to-end (no wallet needed for the shape of the flow)

```bash
# 1. create a workflow
curl -s -X POST localhost:3000/api/workflows \
  -H "content-type: application/json" \
  -d '{"userId":"demo-user","goal":"translate and fact-check a document","budgetAlgo":10,"tier":"free"}'

# -> note the workflow.id and, if present, workflow.steps[0] + any approval

# 2. inspect status/trace
curl -s localhost:3000/api/workflows/<id>
curl -s localhost:3000/api/workflows/<id>/trace
```

The free tier's per-transaction cap (0.5 ALGO) is below both demo providers'
prices, so the first step should come back `awaiting_approval` — approve it
via `POST /api/workflows/:id/approve` with the `approvalId` from the trace.

Actually calling `/api/facilitator/verify` or `/settle` requires a real
confirmed TestNet transaction hash (construct one with `algosdk` against a
funded TestNet account) — the facilitator deliberately refuses to settle an
unverifiable payment rather than trusting the client.

## Not yet implemented (see specs for full scope)

- General-purpose workflow compilation (currently a fixed three-provider pipeline).
- A settle-down/refund for the `upto` scheme: the unused remainder is
  computed and reported (`settlement.unusedAlgo`) but not returned on chain.
- The on-chain escrow-light verification contract (AlgoKit) — `lib/facilitator.ts`
  currently verifies against a plain payment transaction, not a contract call.
