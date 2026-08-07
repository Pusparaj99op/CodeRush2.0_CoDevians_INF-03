// Algorand x402 facilitator.
//
// Implements the verify/settle half of the x402 HTTP payment flow
// (docs.x402.org) with Algorand TestNet as the settlement network, per
// Doc/specs/02-website.md "Algorand x402 Facilitator".
//
// A resource server (a marketplace Provider) responds 402 with payment
// terms; the orchestrator submits a TestNet transaction and posts the
// payload here; this module confirms it against the chain via algosdk
// before the orchestrator is allowed to treat the step as paid.
//
// TestNet-only per the handbook's safety boundaries — never wire this to
// MainNet or a wallet holding real funds.

import algosdk from "algosdk";
import { newId, nowIso } from "./id";
import type { PaymentScheme, Receipt } from "./types";

const ALGOD_SERVER = process.env.ALGOD_SERVER ?? "https://testnet-api.algonode.cloud";
const ALGOD_TOKEN = process.env.ALGOD_TOKEN ?? "";
const ALGOD_PORT = process.env.ALGOD_PORT ?? "";

let algodClient: algosdk.Algodv2 | null = null;

function getAlgodClient(): algosdk.Algodv2 {
  if (!algodClient) {
    algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
  }
  return algodClient;
}

export interface PaymentPayload {
  txnHash: string; // confirmed Algorand txn id
  payerAddress: string;
  payeeAddress: string;
  amountMicroAlgos: number;
}

export interface PaymentTerms {
  scheme: PaymentScheme;
  amountAlgo: number; // exact price, or the "upto" cap
  payeeAddress: string;
  network: "testnet";
}

export interface VerifyResult {
  valid: boolean;
  reason?: string;
}

/**
 * Verifies a submitted payment payload against the on-chain transaction
 * and the declared terms. Does not settle anything by itself — see
 * `settle` for that.
 */
export async function verifyPayment(
  payload: PaymentPayload,
  terms: PaymentTerms
): Promise<VerifyResult> {
  if (payload.payeeAddress !== terms.payeeAddress) {
    return { valid: false, reason: "payee address does not match declared terms" };
  }

  const declaredMicroAlgos = Math.round(terms.amountAlgo * 1_000_000);
  if (terms.scheme === "exact" && payload.amountMicroAlgos !== declaredMicroAlgos) {
    return { valid: false, reason: "amount does not match exact-scheme price" };
  }
  if (terms.scheme === "upto" && payload.amountMicroAlgos > declaredMicroAlgos) {
    return { valid: false, reason: "amount exceeds upto-scheme cap" };
  }

  try {
    const client = getAlgodClient();
    const txnInfo = await client.pendingTransactionInformation(payload.txnHash).do();
    const confirmed = Boolean(txnInfo["confirmed-round"]);
    if (!confirmed) {
      return { valid: false, reason: "transaction not yet confirmed on TestNet" };
    }
  } catch (err) {
    // In a hackathon demo without network access to a node, surface this
    // clearly rather than silently treating an unverifiable payment as
    // valid — that would violate the "safe by construction" requirement.
    return {
      valid: false,
      reason: `could not confirm transaction on TestNet: ${(err as Error).message}`,
    };
  }

  return { valid: true };
}

/**
 * Records settlement and issues a receipt once verification has passed.
 * Idempotent on txnHash so a retried settle call can't double-count.
 */
export function settlePayment(
  workflowId: string,
  stepId: string,
  providerId: string,
  payload: PaymentPayload,
  scheme: PaymentScheme,
  existingReceiptForTxn?: Receipt
): Receipt {
  if (existingReceiptForTxn) {
    return existingReceiptForTxn;
  }

  return {
    id: newId("receipt"),
    workflowId,
    stepId,
    providerId,
    amountAlgo: payload.amountMicroAlgos / 1_000_000,
    scheme,
    txnHash: payload.txnHash,
    network: "testnet",
    settledAt: nowIso(),
  };
}
