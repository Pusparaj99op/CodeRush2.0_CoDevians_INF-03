// The payer: turns a provider's 402 payment terms into a settled
// PaymentPayload.
//
// This is the piece that was missing entirely — algosdk was previously
// only used to *read* the chain, so a 402 could never actually be paid by
// anything in this repo. See Doc/specs/02-website.md.
//
// Safety boundary: this is the ONLY module that holds a signing key, it is
// server-side only, and it refuses to run against anything but TestNet.
// The laptop-server never sees the key (Doc/specs/03-laptop-server.md).

import algosdk from "algosdk";
import type { PaymentPayload, PaymentTerms } from "./facilitator";
import { settlementMode, SIMULATED_TXN_PREFIX } from "./settlement-mode";

const ALGOD_SERVER = process.env.ALGOD_SERVER ?? "https://testnet-api.algonode.cloud";
const ALGOD_TOKEN = process.env.ALGOD_TOKEN ?? "";
const ALGOD_PORT = process.env.ALGOD_PORT ?? "";

/** Rounds to wait for confirmation before giving up on a submitted txn. */
const CONFIRM_ROUNDS = Number(process.env.PAYER_CONFIRM_ROUNDS ?? 8);

export class PaymentError extends Error {
  readonly retryable: boolean;

  constructor(message: string, retryable = false) {
    super(message);
    this.name = "PaymentError";
    this.retryable = retryable;
  }
}

export interface PaidResult {
  payload: PaymentPayload;
  simulated: boolean;
}

/**
 * Refuses to sign against a non-TestNet node. The handbook's safety
 * boundary is TestNet-only, and a mis-set ALGOD_SERVER is exactly the
 * mistake that would quietly spend real funds.
 */
function assertTestnet(): void {
  const host = ALGOD_SERVER.toLowerCase();
  if (!host.includes("testnet") && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    throw new PaymentError(
      `refusing to sign: ALGOD_SERVER (${ALGOD_SERVER}) is not a TestNet or local node`
    );
  }
}

function getPayerAccount(): algosdk.Account {
  const mnemonic = process.env.DEMO_PAYER_MNEMONIC;
  if (!mnemonic) {
    throw new PaymentError("DEMO_PAYER_MNEMONIC is not set");
  }
  try {
    return algosdk.mnemonicToSecretKey(mnemonic.trim());
  } catch (err) {
    throw new PaymentError(`DEMO_PAYER_MNEMONIC is not a valid mnemonic: ${(err as Error).message}`);
  }
}

/**
 * Pays a provider's quoted terms and returns the payload the facilitator
 * needs to verify it.
 *
 * For the "upto" scheme the caller authorizes the full cap — the provider
 * meters the real cost and reports the unused remainder (see the
 * laptop-server's `settlement` block). We don't try to guess usage ahead
 * of time; that's the whole point of the scheme.
 */
export async function payProvider(terms: PaymentTerms): Promise<PaidResult> {
  const amountMicroAlgos = Math.round(terms.amountAlgo * 1_000_000);
  if (!Number.isFinite(amountMicroAlgos) || amountMicroAlgos <= 0) {
    throw new PaymentError(`invalid payment amount: ${terms.amountAlgo} ALGO`);
  }

  if (settlementMode() === "simulated") {
    return {
      simulated: true,
      payload: {
        txnHash: `${SIMULATED_TXN_PREFIX}${crypto.randomUUID()}`,
        payerAddress: `${SIMULATED_TXN_PREFIX}PAYER`,
        payeeAddress: terms.payeeAddress,
        amountMicroAlgos,
      },
    };
  }

  assertTestnet();
  const account = getPayerAccount();
  const client = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

  let txId: string;
  try {
    const suggestedParams = await client.getTransactionParams().do();
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: account.addr,
      to: terms.payeeAddress,
      amount: amountMicroAlgos,
      suggestedParams,
    });

    const signed = txn.signTxn(account.sk);
    ({ txId } = await client.sendRawTransaction(signed).do());
    await algosdk.waitForConfirmation(client, txId, CONFIRM_ROUNDS);
  } catch (err) {
    // Network hiccups and congestion are worth retrying; a rejected txn
    // (insufficient funds, bad address) is not, but we can't reliably
    // distinguish them from algod's error text, so callers treat payment
    // failure as a step failure and surface the reason verbatim.
    throw new PaymentError(`TestNet payment failed: ${(err as Error).message}`, true);
  }

  return {
    simulated: false,
    payload: {
      txnHash: txId,
      payerAddress: account.addr,
      payeeAddress: terms.payeeAddress,
      amountMicroAlgos,
    },
  };
}
