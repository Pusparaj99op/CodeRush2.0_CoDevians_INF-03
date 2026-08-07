// Exercises the x402 consumer flow against a real local HTTP server that
// impersonates the laptop-server's contract (402 -> pay -> 200), plus the
// failure branches the orchestrator has to distinguish.

import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { after, test } from "node:test";
import { callProvider, probeProvider, ProviderError } from "./provider-client";
import type { Provider } from "./types";

type Handler = (
  method: string,
  url: string,
  body: Record<string, unknown>
) => { status: number; body: unknown };

const servers: Server[] = [];

async function startStub(handler: Handler): Promise<string> {
  const server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c as Buffer));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString() || "{}";
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const out = handler(req.method ?? "GET", req.url ?? "/", parsed);
      res.writeHead(out.status, { "content-type": "application/json" });
      res.end(JSON.stringify(out.body));
    });
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  servers.push(server);
  const address = server.address();
  if (typeof address === "string" || address === null) throw new Error("no port");
  return `http://127.0.0.1:${address.port}`;
}

after(() => {
  for (const s of servers) s.close();
});

function providerFor(base: string): Provider {
  return {
    id: "laptop-inference",
    name: "stub-laptop",
    endpoint: `${base}/infer`,
    healthEndpoint: `${base}/health`,
    capability: "local-inference",
    scheme: "upto",
    priceAlgo: 3,
    verified: false,
    mock: false,
  };
}

const TERMS = { scheme: "upto", amountAlgo: 3, payeeAddress: "PAYEE", network: "testnet" };
const REQUEST = { workflowId: "wf_1", stepId: "step_1", task: "verify", input: "hello" };

test("402 -> pay -> 200 returns the result and the payment it made", async () => {
  const seen: Record<string, unknown>[] = [];
  const base = await startStub((_method, url, body) => {
    if (url === "/health") return { status: 200, body: { status: "ok", model: "llama3.2:3b" } };
    seen.push(body);
    if (!body.payment) return { status: 402, body: { error: "payment required", terms: TERMS } };
    return {
      status: 200,
      body: {
        result: { output: "verified: faithful" },
        usage: { tokensGenerated: 100, costAlgo: 0.45 },
        settlement: { authorizedAlgo: 3, chargedAlgo: 0.45, unusedAlgo: 2.55 },
      },
    };
  });

  const result = await callProvider(providerFor(base), REQUEST);

  assert.equal(result.output, "verified: faithful");
  assert.equal(result.mocked, false);
  assert.equal(result.simulatedPayment, true); // keyless test env
  assert.equal(result.usage?.costAlgo, 0.45);
  // Two round trips: one unpaid to get the quote, one carrying the payment.
  assert.equal(seen.length, 2);
  assert.equal(seen[0]?.payment, undefined);
  assert.ok(seen[1]?.payment);
});

test("a busy provider is a retryable failure, not a hard rejection", async () => {
  const base = await startStub(() => ({
    status: 503,
    body: { error: "provider busy", retryable: true },
  }));

  await assert.rejects(callProvider(providerFor(base), REQUEST), (err: ProviderError) => {
    assert.equal(err.name, "ProviderError");
    assert.equal(err.retryable, true);
    return true;
  });
});

test("an unreachable provider is retryable (tunnel dropped mid-demo)", async () => {
  const dead = providerFor("http://127.0.0.1:1");
  await assert.rejects(callProvider(dead, REQUEST), (err: ProviderError) => {
    assert.equal(err.retryable, true);
    assert.match(err.message, /unreachable/);
    return true;
  });
});

test("refuses to overpay when the provider quotes above its advertised price", async () => {
  const base = await startStub(() => ({
    status: 402,
    body: { error: "payment required", terms: { ...TERMS, amountAlgo: 99 } },
  }));

  await assert.rejects(callProvider(providerFor(base), REQUEST), (err: ProviderError) => {
    assert.match(err.message, /above its advertised/);
    assert.equal(err.retryable, false);
    return true;
  });
});

test("probeProvider reports an offline provider instead of throwing", async () => {
  const status = await probeProvider(providerFor("http://127.0.0.1:1"));
  assert.equal(status.online, false);
  assert.ok(status.reason);
});

test("probeProvider reads the laptop's health payload", async () => {
  const base = await startStub(() => ({
    status: 200,
    body: { status: "ok", busy: false, model: "llama3.2:3b" },
  }));
  const status = await probeProvider(providerFor(base));
  assert.equal(status.online, true);
  assert.equal(status.model, "llama3.2:3b");
});

test("mock providers are stubbed locally and never hit the network", async () => {
  const mock: Provider = {
    id: "translate-api",
    name: "translate-api.example",
    endpoint: "https://translate-api.example/v1/translate",
    capability: "translation",
    scheme: "exact",
    priceAlgo: 2.5,
    verified: true,
    mock: true,
  };

  const result = await callProvider(mock, REQUEST);
  assert.equal(result.mocked, true);
  assert.match(result.output, /\[mock translation\]/);
});
