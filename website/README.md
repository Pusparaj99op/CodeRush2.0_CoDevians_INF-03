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

## What's implemented

- **Orchestrator** (`lib/orchestrator.ts`): compiles a goal into a step
  graph, quotes each step against the marketplace, enforces the
  subscription-tier budget cap, opens human-approval gates when a step
  exceeds the cap or targets an unverified provider, and verifies
  fulfillment before a workflow is marked complete.
- **Algorand x402 facilitator** (`lib/facilitator.ts`): verifies a payment
  payload against Algorand TestNet (via `algosdk`) and issues idempotent
  settlement receipts. Supports both `exact` and `upto` schemes.
- **In-memory ledger** (`lib/store.ts`): append-only event log per
  workflow, standing in for the Firestore `ledger/{workflowId}/events`
  collection described in the spec — same shape, swap later without
  touching route handlers.
- **API routes** (`app/api/**`): matches the table in
  `Doc/specs/02-website.md`.

## API surface

| Endpoint | Purpose |
|---|---|
| `POST /api/workflows` | Submit `{ userId, goal, budgetAlgo, tier? }`, get back a compiled workflow. |
| `GET /api/workflows/:id` | Workflow status, step graph, last 10 ledger events. |
| `GET /api/workflows/:id/trace` | Full replayable trace. |
| `POST /api/workflows/:id/approve` | `{ approvalId, decision }` — approve/deny a pending step. |
| `POST /api/workflows/:id/cancel` | Cancel a running workflow; returns delivered vs. not-purchased steps. |
| `POST /api/facilitator/verify` | `{ workflowId, stepId, payload }` — verify a payment payload against declared terms. |
| `POST /api/facilitator/settle` | Same body — confirm settlement, issue a receipt. |
| `GET /api/providers` | List marketplace providers (includes the laptop server once its tunnel URL is set). |

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

- Firebase Auth verification on requests (currently `userId` is trusted as-is).
- Firestore-backed persistence (currently in-memory, resets on server restart).
- General-purpose workflow compilation (currently a fixed two-provider pipeline).
- The on-chain escrow-light verification contract (AlgoKit) — `lib/facilitator.ts`
  currently verifies against a plain payment transaction, not a contract call.
