# Veldar 

## Pitch

Veldar is a personal AI agent that spends money on your behalf, safely. You give it a goal ("get this document translated and fact-checked," "plan and book a weekend trip," "run a market research pass"). Veldar's agent decomposes the goal into a workflow, shops for services from a marketplace of paid providers, pays each one in small Algorand micropayments as work is verified, and shows you the full trace — every offer, approval, payment, and result — so nothing happens you didn't authorize.

This is our take on hackathon problem statement **INF-03 — Composite Agentic Commerce Orchestrator**: build an orchestrator that lets an agent negotiate and execute a multi-step, multi-provider paid workflow (discovery → quotes → payment → conditional fulfillment → verification → settlement) while keeping budgets, business rules, and approvals visible and auditable.

## Why Algorand, and what's missing

Algorand gives us fast finality, low fixed fees, and Layer-1 smart contracts — good primitives for high-frequency micropayments. But three things an agentic-commerce product needs don't exist yet on Algorand:

1. **No native x402-style HTTP payments facilitator.** x402 (`docs.x402.org`) defines an HTTP-native flow — client requests a resource, server responds `402 Payment Required` with payment terms, client pays, server verifies/settles and serves the resource — but there's no standard Algorand facilitator implementing it. **Veldar builds one**: an Algorand facilitator service that any HTTP API (including our own marketplace providers) can sit behind to become pay-per-call.
2. **No agent-friendly orchestration layer.** Fast contracts alone don't make a workflow trustworthy — an agent still needs a way to compile a goal into a plan, track conditional steps, cap spend, and verify delivery before releasing the next payment. **The orchestrator is that layer**, purpose-built for AI agents transacting across multiple Algorand-paid services.
3. **Developer-centric tooling, no consumer UX.** algosdk/AlgoKit are for developers, not end users. **The App and Website are the human face**: goal input, plain-language approval prompts, a live spend dashboard, and a readable trace — so a non-technical user trusts an agent that's autonomously spending their money.

## Architecture

```
┌─────────────────────┐        ┌──────────────────────────────┐
│   Flutter App        │        │   Next.js Website             │
│  (iOS/Android)       │        │  Frontend (web dashboard,     │
│  - goal input         │        │  landing/marketing)           │
│  - approval prompts   │◄──────►│  Backend (API routes):        │
│  - spend dashboard    │  REST  │   - Orchestrator service      │
│  - Firebase Auth       │  JSON  │   - Algorand x402 Facilitator │
└─────────────────────┘        │   - Workflow ledger / trace   │
        │                        └───────────┬────────────────┘
        │ Firebase (auth, session cache)      │
        ▼                                      ▼
┌─────────────────────┐        ┌──────────────────────────────┐
│     Firestore         │        │   Algorand TestNet             │
│  users, sessions,      │        │   - payment verification       │
│  approvals, receipts   │        │     smart contract              │
└─────────────────────┘        │   - ASA / Algo microtx settle  │
                                  └──────────────────────────────┘
                                              ▲
                                              │ paid HTTP calls (x402 flow)
                                  ┌──────────────────────────────┐
                                  │   Laptop-as-Server (RTX 4050) │
                                  │   local inference provider,   │
                                  │   one marketplace participant │
                                  └──────────────────────────────┘
```

Control plane: Orchestrator (workflow compiler, budget manager, approval gates).
Data plane: Algorand TestNet contracts + facilitator settling each paid step.
Evidence plane: workflow ledger — every offer, quote, approval, payment, and verification is written to a replayable trace.

## Subscription tiers and agent autonomy

| Tier | Price | Autonomous spend cap / txn | Approval frequency | Platform cut |
|---|---|---|---|---|
| Free | $0 | Low fixed cap (e.g. 0.5 ALGO equiv) | Every payment requires approval | Small % per transaction |
| Pro | Paid | Higher cap, per-workflow budget | Approval only above cap or on new providers | Reduced % |
| ProMax | Paid | Unlimited payments, no per-txn cap | Approval only on policy exceptions (new category, publish/irreversible actions) | 0% / flat fee |

Tier gating lives in the orchestrator's budget/policy engine (see `02-website.md`), not just the UI — so a downgraded or free-tier session cannot bypass approval by calling the API directly.

## Safety boundaries (per handbook requirements)

- **TestNet / simulated funds only** for the entire hackathon build — no real public funds, no uncontrolled signing keys.
- **Explicit budget caps** enforced by the orchestrator's budget manager, not just displayed in the UI.
- **Human approval required** for: any payment above the tier cap, any new/unverified provider, any irreversible or publishing action.
- **Least privilege**: the facilitator's Algorand account is scoped to settlement only; it never holds custody of user funds beyond a single escrow-light step.
- **Full audit trail**: every agent decision, offer, approval, payment, and verification result is written to the workflow ledger and is replayable (see Evaluation section of INF-03).
- **Emergency stop**: user can cancel a workflow mid-run from the app/website; the ledger records what was delivered, what wasn't purchased, and how it was closed out.

## Brand

- Name: **Veldar**. Logo: `Images/veldar_logo.svg` — a currency-styled "V" (two horizontal strike bars, like a currency glyph) in royal red (`#A6192E`) on white, wordmark below in the same red.
- Palette: shades of red, black, and white. Use `#A6192E` as primary accent, near-black (`#0B0B0B` or similar) for dark surfaces/text, white for light surfaces — keep it high-contrast and restrained, no gradients.
- Typography: modern, clean sans (matches the logo's Helvetica/Arial wordmark treatment) — wide letter-spacing on headings/wordmark echoes the logo.
- Motion (website): GSAP + Lenis smooth scroll + Lottie for small agent/payment micro-animations (e.g. an animated "payment settling" indicator reflecting the currency-bar motif in the logo).
