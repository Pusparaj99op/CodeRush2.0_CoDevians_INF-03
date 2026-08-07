import assert from "node:assert/strict";
import { test } from "node:test";
import { priceUsage, unusedAlgo } from "./pricing";

test("meters cost from generated tokens", () => {
  const usage = priceUsage(100, 1200, 3.0);
  // defaults: 0.25 base + 100 * 0.002
  assert.equal(usage.rawCostAlgo, 0.45);
  assert.equal(usage.costAlgo, 0.45);
  assert.equal(usage.cappedAt, false);
});

test("never charges above the upto cap", () => {
  const usage = priceUsage(100_000, 9000, 3.0);
  assert.equal(usage.costAlgo, 3.0);
  assert.equal(usage.cappedAt, true);
  assert.ok(usage.rawCostAlgo > usage.capAlgo);
});

test("unmetered inference falls back to the base charge, not the cap", () => {
  const usage = priceUsage(null, null, 3.0);
  assert.equal(usage.costAlgo, 0.25);
  assert.equal(usage.tokensGenerated, null);
});

test("unused authorization is the cap minus the metered charge", () => {
  assert.equal(unusedAlgo(3.0, 0.45), 2.55);
  // Never negative, even if a charge somehow exceeds what was authorized.
  assert.equal(unusedAlgo(0.1, 0.45), 0);
});
