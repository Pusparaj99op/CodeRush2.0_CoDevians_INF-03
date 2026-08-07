# Veldar Laptop-as-Server

Local-inference marketplace provider (RTX 4050) implementing the *provider*
side of the x402 flow. See
[`Doc/specs/03-laptop-server.md`](../Doc/specs/03-laptop-server.md).

## Prerequisites

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

Listens on `http://localhost:8787` by default.

## Expose it to the orchestrator

During the hackathon demo the orchestrator (running on Vercel) needs to
reach this laptop over the internet:

```bash
ngrok http 8787
# or: cloudflared tunnel --url http://localhost:8787
```

Then set `LAPTOP_SERVER_URL` in the website's `.env.local` to the tunnel
URL, and set this service's `PAYEE_ADDRESS` to match the website's
`FACILITATOR_PAYEE_ADDRESS`.

## API

### `GET /health`
Returns model/config info — use it as the marketplace's liveness check.

### `POST /infer`
Body: `{ workflowId, stepId, task, input, payment? }`

- **No `payment`** → `402 { error, terms }` where `terms` matches the
  `PaymentTerms` shape the orchestrator already expects (`scheme: "upto"`,
  `amountAlgo` cap, `payeeAddress`, `network: "testnet"`).
- **With `payment`** → forwards the payload to the website's
  `POST /api/facilitator/settle` for verification. Only if that succeeds
  does it run inference via Ollama and return `{ result, receipt }`.

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

## Notes / limitations

- Single-flight: the RTX 4050's 8GB VRAM is sized for one inference
  request at a time during the demo — no internal queue or concurrency
  control is implemented (documented limitation, not a bug).
- If this service or its tunnel drops mid-workflow, the orchestrator's
  fulfillment verifier is expected to treat that as a normal
  provider-failure case (INF-03 "dependency failure" hard-mode
  extension), not a crash.
