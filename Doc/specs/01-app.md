# Veldar — Mobile App Spec.

See `00-overview.md` for architecture context and brand guidelines.

## Purpose

The App is the primary consumer surface for Veldar. It's where a user states a goal, watches their agent work, approves or denies spend, and reviews history — all in plain language, no blockchain jargon required. It does not run the orchestrator itself; it's a thin, fast client over the Website's backend API (see `02-website.md`).

## Stack

- **Framework**: Flutter (single codebase, iOS + Android).
- **Auth**: Firebase Authentication with Google OAuth sign-in.
- **Client-side state/cache**: Firestore, used for: cached user profile, active agent session state, pending approvals, and local transaction/receipt history (source of truth for ledger data remains the backend; Firestore here is a synced read cache + push-notification trigger surface).
- **Push notifications**: Firebase Cloud Messaging — used to alert the user the instant an approval is needed (agent blocks on approval mid-workflow and must not silently proceed).
- **Networking**: REST/JSON calls to Website API routes, bearer-token auth (Firebase ID token verified server-side).

## Key screens / flows

1. **Onboarding**
   - Google sign-in (Firebase Auth).
   - Wallet setup: generate or import an Algorand TestNet wallet; app never stores the raw private key — delegates signing to a scoped session key or a facilitator-mediated flow so the app itself isn't a custody risk.
   - Subscription tier selection (free / pro / promax) — see `00-overview.md` tier table.

2. **Goal submission**
   - Free-text goal input + optional structured constraints (max budget, deadline, required approvals).
   - Submits to backend `POST /api/workflows` (see `02-website.md` API surface); receives a `workflowId`.

3. **Live agent trace / approval UI**
   - Real-time (poll or websocket) view of the workflow graph: steps completed, in-progress, blocked-on-approval.
   - Each step shows: provider, price quoted, condition being checked, and current status.
   - **Approval prompt**: plain-language card — "Veldar wants to pay 2.5 ALGO to `translate-api.example` to translate your document. Approve?" with Approve / Deny / Adjust budget.
   - Cancel workflow button, visible at every stage (maps to the safety "emergency stop" requirement).

4. **Transaction / spend dashboard**
   - List of past workflows, expandable into full trace (offers seen, payments made, verification results) — this is the human-readable view of the ledger's replay capability.
   - Running spend total against tier budget.

5. **Subscription management**
   - View/change tier, see per-transaction cut (free tier) or flat pricing (pro/promax).

## Backend interaction

- All business logic (workflow compilation, budget checks, payments, verification) lives server-side in the Website's API/orchestrator — the app never talks to Algorand or the facilitator directly. This keeps signing keys and policy enforcement off the mobile client and centralizes the audit trail.
- Auth flow: Firebase ID token attached to every API call; backend verifies token, maps to user + tier, and enforces budget/approval policy server-side regardless of what the client displays (defense against a compromised or modified client).

## Data model (client-side / Firestore cache)

- `users/{uid}`: profile, tier, linked wallet address, spend-to-date.
- `workflows/{workflowId}`: goal text, status, budget, step graph snapshot (synced from backend).
- `approvals/{approvalId}`: workflowId, step, provider, amount, status (pending/approved/denied), timestamp.
- `receipts/{receiptId}`: workflowId, step, provider, amount settled, txn hash (TestNet), verification result.
