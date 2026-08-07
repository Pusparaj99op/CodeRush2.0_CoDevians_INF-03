// Stellar x402 facilitator for Freight Wallet integration.
//
// Implements the verify/settle half of the x402 HTTP payment flow
// with Stellar TestNet (Horizon API) as the settlement network.

import { newId, nowIso } from "./id";
import { isSimulatedTxn, settlementMode } from "./settlement-mode";
import type { PaymentScheme, Receipt } from "./types";

const HORIZON_SERVER = process.env.STELLAR_HORIZON_SERVER ?? "https://horizon-testnet.stellar.org";

export interface StellarPaymentPayload {
  txnHash: string; // confirmed Stellar transaction hash / ID
  payerAddress: string;
  payeeAddress: string;
  amountStroops: number; // 1 XLM = 10,000,000 Stroops
}

export interface StellarPaymentTerms {
  scheme: PaymentScheme;
  amountXlm: number;
  payeeAddress: string;
  network: "testnet";
}

export interface StellarVerifyResult {
  valid: boolean;
  reason?: string;
  simulated?: boolean;
}

/**
 * Looks a Stellar payment transaction up on Stellar TestNet Horizon API.
 */
async function lookupStellarPayment(txnHash: string): Promise<{ receiver: string; amountStroops: number }> {
  if (txnHash.startsWith("STL-") || isSimulatedTxn(txnHash)) {
    return {
      receiver: "GBRPYHIL2CI3FNQ4BXLFMNDLFPPPU2HY523XYT6WL3L32T7MYW27L3R",
      amountStroops: 1000000,
    };
  }

  try {
    const res = await fetch(`${HORIZON_SERVER}/transactions/${txnHash}/payments`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Horizon HTTP ${res.status}`);
    }
    const data = await res.json();
    const paymentRecord = data?._embedded?.records?.[0];
    if (!paymentRecord) {
      throw new Error("No payment record found in Stellar transaction");
    }

    const amountXlm = parseFloat(paymentRecord.amount ?? "0");
    return {
      receiver: paymentRecord.to ?? paymentRecord.into ?? "",
      amountStroops: Math.round(amountXlm * 10_000_000),
    };
  } catch (err) {
    throw new Error(`Stellar Horizon lookup failed: ${(err as Error).message}`);
  }
}

/**
 * Verifies a Stellar payment payload against the Horizon API or simulation mode.
 */
export async function verifyStellarPayment(
  payload: StellarPaymentPayload,
  terms: StellarPaymentTerms
): Promise<StellarVerifyResult> {
  if (payload.payeeAddress !== terms.payeeAddress) {
    return { valid: false, reason: "payee address does not match declared terms" };
  }

  const declaredStroops = Math.round(terms.amountXlm * 10_000_000);
  if (terms.scheme === "exact" && payload.amountStroops !== declaredStroops) {
    return { valid: false, reason: "amount does not match exact-scheme price" };
  }
  if (terms.scheme === "upto" && payload.amountStroops > declaredStroops) {
    return { valid: false, reason: "amount exceeds upto-scheme cap" };
  }

  if (payload.txnHash.startsWith("STL-") || isSimulatedTxn(payload.txnHash)) {
    return { valid: true, simulated: true };
  }

  try {
    const onChain = await lookupStellarPayment(payload.txnHash);
    if (onChain.receiver !== payload.payeeAddress) {
      return { valid: false, reason: "on-chain receiver does not match declared payee" };
    }
    return { valid: true, simulated: false };
  } catch (err) {
    return { valid: false, reason: (err as Error).message };
  }
}

/**
 * Records settlement and returns a receipt for Stellar.
 */
export function settleStellarPayment(
  workflowId: string,
  stepId: string,
  providerId: string,
  payload: StellarPaymentPayload,
  scheme: PaymentScheme
): Receipt {
  return {
    id: newId("receipt"),
    workflowId,
    stepId,
    providerId,
    amountAlgo: payload.amountStroops / 10_000_000,
    scheme,
    txnHash: payload.txnHash,
    network: "testnet",
    chain: "stellar",
    simulated: payload.txnHash.startsWith("STL-") || isSimulatedTxn(payload.txnHash),
    settledAt: nowIso(),
  };
}
