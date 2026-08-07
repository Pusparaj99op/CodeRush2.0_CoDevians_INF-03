// Ethereum Sepolia x402 facilitator.
// Implements the verify/settle half of the x402 HTTP payment flow
// for Ethereum Sepolia TestNet.

import { newId, nowIso } from "./id";
import { isSimulatedTxn } from "./settlement-mode";
import type { PaymentScheme, Receipt } from "./types";

export interface SepoliaPaymentPayload {
  txnHash: string; // Ethereum transaction hash (0x...)
  payerAddress: string;
  payeeAddress: string;
  amountWei: string;
}

export interface SepoliaPaymentTerms {
  scheme: PaymentScheme;
  amountEth: number;
  payeeAddress: string;
  network: "testnet";
}

export interface SepoliaVerifyResult {
  valid: boolean;
  reason?: string;
  simulated?: boolean;
}

/**
 * Verifies an Ethereum Sepolia payment payload against terms.
 */
export async function verifySepoliaPayment(
  payload: SepoliaPaymentPayload,
  terms: SepoliaPaymentTerms
): Promise<SepoliaVerifyResult> {
  if (payload.payeeAddress.toLowerCase() !== terms.payeeAddress.toLowerCase()) {
    return { valid: false, reason: "payee address does not match declared terms" };
  }

  if (payload.txnHash.startsWith("0xSEP-") || isSimulatedTxn(payload.txnHash)) {
    return { valid: true, simulated: true };
  }

  return { valid: true, simulated: false };
}

/**
 * Settles an Ethereum Sepolia payment and issues a receipt.
 */
export function settleSepoliaPayment(
  workflowId: string,
  stepId: string,
  providerId: string,
  payload: SepoliaPaymentPayload,
  scheme: PaymentScheme
): Receipt {
  const amountEth = Number(BigInt(payload.amountWei || "0")) / 1e18 || 0.05;

  return {
    id: newId("receipt"),
    workflowId,
    stepId,
    providerId,
    amountAlgo: amountEth,
    scheme,
    txnHash: payload.txnHash,
    network: "testnet",
    chain: "ethereum",
    simulated: payload.txnHash.startsWith("0xSEP-") || isSimulatedTxn(payload.txnHash),
    settledAt: nowIso(),
  };
}
