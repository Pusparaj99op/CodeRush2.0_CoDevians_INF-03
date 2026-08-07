# Veldar — Laptop-as-Server Spec

See `00-overview.md` for architecture context.

## Purpose

The team's laptop (RTX 4050) runs as a local compute node providing heavy AI inference — so the hosted orchestrator/website isn't paying per-token API costs during development and, more importantly, **doubles as a real paid provider in the Veldar marketplace** for the hackathon demo. This gives the INF-03 demo a concrete, self-controlled third-party-style service to discover, quote, pay (via the Algorand facilitator), and verify — without depending on an external paid API during the live walkthrough.

## What it does

- Runs local model inference (e.g. a local LLM via Ollama, or a smaller verification/embedding model) for tasks the orchestrator's workflow calls for — e.g. "verify this translation is faithful to the source" or "summarize and score this research output."
- Exposed as one HTTP endpoint implementing the **provider side** of the x402 flow: returns `402 Payment Required` with Algorand TestNet payment terms on first request, serves the result once the facilitator confirms settlement.

## Stack

- **Inference runtime**: Ollama (or equivalent local server) running on the RTX 4050, model chosen for demo speed (small/quantized) over benchmark quality.
- **HTTP wrapper**: lightweight Node.js (or Python/FastAPI) service in front of the inference runtime that:
  1. Accepts a task request.
  2. Returns `402` with price/terms if unpaid (reuses the same payment-terms schema as the facilitator in `02-website.md`).
  3. On a valid settled payment (confirmed via the facilitator's verify/settle endpoints), runs inference and returns the result.
- **Exposure**: tunneled to a public URL via ngrok or Cloudflare Tunnel so the hosted orchestrator (on Vercel) can reach it during the demo; registered in the marketplace's `GET /api/providers` list with its live tunnel URL.
- **GPU utilization**: single RTX 4050 (8GB VRAM) — keep concurrent inference to one request at a time for the demo; note this as a documented limitation (see reproducibility checklist in the handbook) rather than pretending it scales.

## Role in the INF-03 demo

Acts as the **"upto" scheme** example in the workflow (usage-based pricing — pay per token/second of compute rather than a flat fee), complementing an **"exact"**-scheme provider elsewhere in the workflow. This gives the demo trace a concrete example of both x402 payment schemes settling on Algorand TestNet within a single multi-provider workflow, which is explicitly called out as a capability the orchestrator must support.

## Safety notes

- TestNet only, capped per-request price, no persistent custody of funds on the laptop itself — it only receives settlement confirmations from the facilitator, never holds a signing key for user funds.
- If the tunnel drops or the laptop goes offline mid-demo, the orchestrator's fulfillment verifier should surface this as a normal provider-failure case (already a required scenario per INF-03's "hard-mode extensions": dependency failure) rather than crash the workflow — treat it as a resilience feature to demonstrate, not just a risk to avoid.
