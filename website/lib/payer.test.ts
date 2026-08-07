import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import type { PaymentTerms } from "./facilitator";

const TERMS: PaymentTerms = {
  scheme: "upto",
  amountAlgo: 3,
  payeeAddress: "PAYEE",
  network: "testnet",
};

afterEach(() => {
  delete process.env.DEMO_PAYER_MNEMONIC;
});

test("simulated mode pays without a key and marks the payload synthetic", async () => {
  delete process.env.DEMO_PAYER_MNEMONIC;
  const { payProvider } = await import("./payer");
  const { isSimulatedTxn, settlementMode } = await import("./settlement-mode");

  assert.equal(settlementMode(), "simulated");

  const paid = await payProvider(TERMS);
  assert.equal(paid.simulated, true);
  assert.ok(isSimulatedTxn(paid.payload.txnHash));
  assert.equal(paid.payload.payeeAddress, "PAYEE");
  assert.equal(paid.payload.amountMicroAlgos, 3_000_000);
});

test("rejects a non-positive amount before doing anything", async () => {
  const { payProvider, PaymentError } = await import("./payer");
  await assert.rejects(payProvider({ ...TERMS, amountAlgo: 0 }), PaymentError);
});

test("a simulated txn is only acceptable while running keyless", async () => {
  const { verifyPayment } = await import("./facilitator");
  const payload = {
    txnHash: "SIMULATED-abc",
    payerAddress: "SIMULATED-PAYER",
    payeeAddress: "PAYEE",
    amountMicroAlgos: 3_000_000,
  };

  const keyless = await verifyPayment(payload, TERMS);
  assert.equal(keyless.valid, true);
  assert.equal(keyless.simulated, true);

  // With a real payer configured, a synthetic txn id must be refused —
  // otherwise anyone could spoof a settlement.
  process.env.DEMO_PAYER_MNEMONIC = "x ".repeat(25).trim();
  const withKey = await verifyPayment(payload, TERMS);
  assert.equal(withKey.valid, false);
  assert.match(withKey.reason ?? "", /settlement mode is 'real'/);
});

test("upto terms reject an amount above the cap before touching the chain", async () => {
  const { verifyPayment } = await import("./facilitator");
  const result = await verifyPayment(
    {
      txnHash: "SIMULATED-over",
      payerAddress: "P",
      payeeAddress: "PAYEE",
      amountMicroAlgos: 9_000_000,
    },
    TERMS
  );
  assert.equal(result.valid, false);
  assert.match(result.reason ?? "", /exceeds upto-scheme cap/);
});
