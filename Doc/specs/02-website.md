# Veldar — Website Spec (Frontend + Backend)

See `00-overview.md` for architecture context and brand guidelines.

## Frontend

- **Stack**: Next.js + TypeScript, deployed on Vercel (hobby plan).
- **Motion**: GSAP for scroll/interaction animation, Lenis for smooth scroll, Lottie for small vector animations (e.g. payment-settling indicator echoing the logo's currency-bar motif).
- **Surfaces**:
  - Marketing/landing site: pitch, how-it-works (goal → agent → marketplace → Algorand payment → verified result), sponsor callout for Algorand, subscription pricing table.
  - Web dashboard: a browser-based mirror of the App's live trace and approval UI, so judges/users can watch a workflow run without needing the mobile app — this is also the primary **demo surface** for the hackathon walkthrough.
  - Trace viewer: a dedicated page rendering a workflow's full replayable trace (offers, quotes, approvals, payments, verifications) per the INF-03 "evidence" requirement.
- **Theme**: red/black/white per `00-overview.md`, using `Images/veldar_logo.svg`.

## Backend

Implemented as Next.js API routes (or a separate Node.js service if load requires it) in **TypeScript**, shared types with the frontend. Two responsibilities live here:

### 1. Orchestrator

- **Workflow compiler**: turns a submitted goal + constraints into a directed graph of steps (provider calls), with prerequisites, parallel branches, conditional edges (e.g. skip a step if quality is already met), and approval checkpoints.
- **Quote & budget manager**: tracks estimated vs. settled cost per step, reserves budget before a step runs, releases it if skipped, and enforces the user's subscription-tier cap (see `00-overview.md` tier table) server-side — never trusts the client.
- **Fulfillment verifier**: before releasing the next step's payment, checks the previous step's result against schema/quality/provenance rules declared by the workflow.
- **Human-in-the-loop gate**: pauses the workflow and pushes an approval request (via Firestore write → FCM push to the App) whenever a step exceeds the tier's auto-approve threshold or targets a new/unverified provider; resumes on approval, cancels/compensates on denial.
- **Workflow ledger**: append-only log of every offer seen, quote, approval decision, payment, verification result, and retry — keyed by `workflowId`, replayable for the trace viewer and for hackathon judging.

### 2. Algorand x402 Facilitator

Implements the x402 HTTP payment flow (`docs.x402.org`) with Algorand as settlement:

- A protected provider endpoint (ours, or a third-party one) responds `402 Payment Required` with payment terms (amount, Algorand asset, network = TestNet, facilitator address, scheme).
- Client (orchestrator, on behalf of the agent) constructs a payment payload and submits an Algorand TestNet transaction.
- Facilitator verifies the payment payload against the transaction actually confirmed on-chain (via algosdk, querying an Algorand TestNet node/indexer), and either settles locally or confirms settlement to the resource server.
- Supports both **exact** scheme (fixed price per call, e.g. one translation) and **upto** scheme (usage-based, e.g. pay up to a cap, settle actual usage — used for the Laptop-as-Server compute provider).
- Idempotency: payment payloads are keyed so a retried request can't double-settle.
- Receipts: every settlement produces a receipt (txn hash, amount, payer/payee, timestamp) written to the workflow ledger.

**Tooling**: `algosdk` (JS/TS) for transaction construction/signing and TestNet queries; **AlgoKit** for scaffolding/deploying the on-chain verification contract (a minimal escrow-light contract that confirms a payment matches declared terms before the facilitator reports settlement — this is what makes the facilitator's claim about payment auditable on-chain, not just a database entry).

## API surface (sketch — matches App's client calls)

| Endpoint | Purpose |
|---|---|
| `POST /api/workflows` | Submit a goal + constraints, returns `workflowId` and the compiled step graph. |
| `GET /api/workflows/:id` | Current workflow status, step graph, ledger snapshot. |
| `GET /api/workflows/:id/trace` | Full replayable trace for the trace viewer. |
| `POST /api/workflows/:id/approve` | Approve a pending step (approvalId, decision). |
| `POST /api/workflows/:id/cancel` | Cancel workflow; returns what was delivered vs. not purchased and ledger close-out. |
| `POST /api/facilitator/verify` | x402 facilitator: verify a submitted payment payload against terms. |
| `POST /api/facilitator/settle` | x402 facilitator: confirm settlement, issue receipt. |
| `GET /api/providers` | Marketplace: list available paid providers/offers (includes Laptop-as-Server when online). |

## Data storage

- **Firestore** (shared with the App): users, workflows, approvals, receipts — kept as the synced read layer for both clients.
- **Workflow ledger** (append-only, source of truth for replay/audit): can live in the same Firestore in a dedicated `ledger/{workflowId}/events` subcollection to avoid standing up a second database during the hackathon; each event is immutable once written.
