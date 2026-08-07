# Veldar Laptop-as-Server

Local-inference marketplace provider (RTX 4050) implementing the *provider*
side of the x402 flow, on the **`upto` (usage-based) payment scheme**. See
[`Doc/specs/03-laptop-server.md`](../Doc/specs/03-laptop-server.md).

## Prerequisites

- Node 22+ (uses `--env-file-if-exists` and the built-in test runner).
- [Ollama](https://ollama.com) running locally, with a model pulled:
  ```bash
  ollama pull llama3.2:3b
  ```
- The [website backend](../website) running (or reachable), since this
  service delegates payment verification/settlement to its facilitator —
  it holds no Algorand keys itself.

## Setup

```bash
cd laptop-server
npm install
cp .env.example .env   # then edit PAYEE_ADDRESS / FACILITATOR_BASE_URL
npm run dev
```

Listens on `http://localhost:8787` by default. It starts even with Ollama
down — `/health` reports `degraded` and `/infer` refuses *before* taking
payment.

```bash
npm test        # pricing + concurrency unit tests
npm run typecheck
```

## Expose it to the orchestrator

During the hackathon demo the orchestrator (running on Vercel) needs to
reach this laptop over the internet:

```bash
ngrok http 8787
# or: cloudflared tunnel --url http://localhost:8787
```

Then set `LAPTOP_SERVER_URL` in the website's `.env.local` to the tunnel
URL (that's what `website/lib/providers.ts` reads for the
`laptop-inference` provider's endpoint), and set this service's
`PAYEE_ADDRESS` to match the website's `FACILITATOR_PAYEE_ADDRESS`.

## API

### `GET /health`
Liveness check for the marketplace. Actually probes Ollama (`/api/tags`)
rather than just confirming this process is up, and returns **503** when
the model isn't ready:

```json
{ "status": "ok", "model": "llama3.2:3b", "busy": false,
  "ollama": { "reachable": true, "modelReady": true, "models": ["llama3.2:3b"] },
  "terms": { "scheme": "upto", "amountAlgo": 3, "payeeAddress": "…", "network": "testnet" } }
```

`status` is `ok` | `busy` (serving an inference) | `degraded` (can't serve).

### `GET /terms`
Unauthenticated price quote, so the marketplace can display terms without
provoking a 402.

### `POST /infer`
Body: `{ workflowId, stepId, task, input, payment? }`

- **No `payment`** → `402 { error, terms }` where `terms` matches the
  `PaymentTerms` shape the orchestrator already expects (`scheme: "upto"`,
  `amountAlgo` cap, `payeeAddress`, `network: "testnet"`).
- **With `payment`** → forwards the payload to the website's
  `POST /api/facilitator/settle` for on-chain verification. Only if that
  succeeds does it run inference and return `{ result, usage, settlement, receipt }`.

```bash
# 1. unpaid request -> 402 with terms
curl -s -X POST localhost:8787/infer \
  -H "content-type: application/json" \
  -d '{"workflowId":"wf_x","stepId":"step_x","task":"summarize","input":"..."}'

# 2. paid request (payment payload requires a real confirmed TestNet txn —
#    see website/README.md for how the facilitator verifies it)
curl -s -X POST localhost:8787/infer \
  -H "content-type: application/json" \
  -d '{"workflowId":"wf_x","stepId":"step_x","task":"summarize","input":"...","payment":{"txnHash":"...","payerAddress":"...","payeeAddress":"...","amountMicroAlgos":3000000}}'
```

## The `upto` scheme, concretely

This provider is the demo's **usage-based pricing** example, complementing
the `exact`-scheme providers in `website/lib/providers.ts`. The caller
authorizes *up to* `PRICE_CAP_ALGO`; the real charge is metered from the
tokens Ollama actually generated:

```
cost = min(PRICE_BASE_ALGO + tokensGenerated * PRICE_PER_TOKEN_ALGO, PRICE_CAP_ALGO)
```

Every paid response carries the arithmetic so a trace can re-derive it:

```json
{
  "usage": { "tokensGenerated": 100, "durationMs": 1240, "baseAlgo": 0.25,
             "perTokenAlgo": 0.002, "rawCostAlgo": 0.45, "costAlgo": 0.45,
             "capAlgo": 3, "cappedAt": false },
  "settlement": { "scheme": "upto", "authorizedAlgo": 3,
                  "chargedAlgo": 0.45, "unusedAlgo": 2.55 }
}
```

`unusedAlgo` is what a full x402 settle-down would refund. On the TestNet
demo it is reported, not returned — the authorized amount is what settles
on chain. If Ollama reports no token count, the charge falls back to the
base rate, never to the cap.

## Failure behaviour

The spec treats provider failure as a scenario to *demonstrate* (INF-03's
"dependency failure" hard-mode extension), so each mode has a distinct,
retryable-tagged response instead of a crash:

| Situation | Response |
|---|---|
| GPU already serving a request | `503 { error: "provider busy", retryable: true }` — checked **before** settling payment |
| Authorized amount above the cap | `402 { error: "authorized amount exceeds upto cap", terms }` |
| Facilitator unreachable / times out | `502 { error: "could not reach facilitator", retryable: true }` |
| Facilitator rejects the payment | `402 { error: "payment not settled", detail }` |
| Ollama dies after payment settled | `503 { error: "inference backend unavailable", receipt, retryable: true }` — receipt included so the loss is traceable, never silent |
| Input over `MAX_INPUT_CHARS` | `413` |

`SIGINT`/`SIGTERM` drain the in-flight request before exiting, so Ctrl-C
during the demo doesn't sever the tunnel mid-response.

## Notes / limitations

- **Single-flight**: the RTX 4050's 8GB VRAM is sized for one inference at
  a time. `src/gpu-lock.ts` enforces exactly one and fast-fails the rest
  with a 503 — no queue, because queueing behind a possibly-dead tunnel
  turns a quick failure into an unbounded wait. Documented limitation, not
  a bug.
- Generation is capped at `OLLAMA_MAX_TOKENS` (512) and
  `OLLAMA_TIMEOUT_MS` (120s) per request.
- TestNet only. This service never holds a signing key for user funds — it
  only relays payment payloads to the website's facilitator, which is the
  only component that talks to algod.
