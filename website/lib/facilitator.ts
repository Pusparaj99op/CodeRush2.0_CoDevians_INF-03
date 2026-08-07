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
import { isSimulatedTxn, settlementMode } from "./settlement-mode";
import type { PaymentScheme, Receipt } from "./types";

const ALGOD_SERVER = process.env.ALGOD_SERVER ?? "https://testnet-api.algonode.cloud";
const ALGOD_TOKEN = process.env.ALGOD_TOKEN ?? "";
const ALGOD_PORT = process.env.ALGOD_PORT ?? "";
const INDEXER_SERVER = process.env.INDEXER_SERVER ?? "https://testnet-idx.algonode.cloud";
const INDEXER_TOKEN = process.env.INDEXER_TOKEN ?? "";
const INDEXER_PORT = process.env.INDEXER_PORT ?? "";

let algodClient: algosdk.Algodv2 | null = null;
let indexerClient: algosdk.Indexer | null = null;

function getAlgodClient(): algosdk.Algodv2 {
  if (!algodClient) {
    algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
  }
  return algodClient;
}

function getIndexerClient(): algosdk.Indexer {
  if (!indexerClient) {
    indexerClient = new algosdk.Indexer(INDEXER_TOKEN, INDEXER_SERVER, INDEXER_PORT);
  }
  return indexerClient;
}

/** What the chain actually says a payment transaction did. */
interface OnChainPayment {
  receiver: string;
  amountMicroAlgos: number;
}

/**
 * Looks a payment txn up on chain.
 *
 * algod's `pendingTransactionInformation` only covers the pending pool and
 * the last handful of rounds, so it 404s for anything older — which is
 * every txn by the time a multi-step workflow finishes. Fall back to the
 * indexer, which retains history.
 */
async function lookupPayment(txnHash: string): Promise<OnChainPayment> {
  try {
    const info = (await getAlgodClient().pendingTransactionInformation(txnHash).do()) as {
      "confirmed-round"?: number;
      txn?: { txn?: { rcv?: string; amt?: number } };
    };
    if (info["confirmed-round"]) {
      return {
        receiver: info.txn?.txn?.rcv ?? "",
        amountMicroAlgos: info.txn?.txn?.amt ?? 0,
      };
    }
    throw new Error("transaction not yet confirmed on TestNet");
  } catch (algodErr) {
    try {
      const found = (await getIndexerClient().lookupTransactionByID(txnHash).do()) as {
        transaction?: {
          "confirmed-round"?: number;
          "payment-transaction"?: { receiver?: string; amount?: number };
        };
      };
      const txn = found.transaction;
      if (!txn?.["confirmed-round"]) {
        throw new Error("indexer has no confirmed round for this transaction");
      }
      return {
        receiver: txn["payment-transaction"]?.receiver ?? "",
        amountMicroAlgos: txn["payment-transaction"]?.amount ?? 0,
      };
    } catch (indexerErr) {
      throw new Error(
        `algod: ${(algodErr as Error).message}; indexer: ${(indexerErr as Error).message}`
      );
    }
  }
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
  /** True when this "settlement" never touched the chain. Propagated into
   *  the receipt and the ledger so a trace can't imply a real payment. */
  simulated?: boolean;
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

  // Synthetic payments are only ever acceptable while the orchestrator is
  // running keyless. If a real payer key is configured, a SIMULATED- txn id
  // means something is wrong (or someone is spoofing) — reject it.
  if (isSimulatedTxn(payload.txnHash)) {
    if (settlementMode() !== "simulated") {
      return { valid: false, reason: "simulated payment rejected: settlement mode is 'real'" };
    }
    return { valid: true, simulated: true };
  }

  let onChain: OnChainPayment;
  try {
    onChain = await lookupPayment(payload.txnHash);
  } catch (err) {
    // Surface this clearly rather than silently treating an unverifiable
    // payment as valid — that would violate "safe by construction".
    return {
      valid: false,
      reason: `could not confirm transaction on TestNet: ${(err as Error).message}`,
    };
  }

  // Trust the chain, not the payload. Previously the amount and receiver
  // were only checked against what the caller claimed, so a payload could
  // describe a payment that the referenced txn never made.
  if (onChain.receiver !== payload.payeeAddress) {
    return {
      valid: false,
      reason: `on-chain receiver ${onChain.receiver} does not match the declared payee`,
    };
  }
  if (onChain.amountMicroAlgos !== payload.amountMicroAlgos) {
    return {
      valid: false,
      reason: `on-chain amount ${onChain.amountMicroAlgos} does not match the declared ${payload.amountMicroAlgos} microAlgos`,
    };
  }

  return { valid: true, simulated: false };
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
    simulated: isSimulatedTxn(payload.txnHash),
    settledAt: nowIso(),
  };
}
