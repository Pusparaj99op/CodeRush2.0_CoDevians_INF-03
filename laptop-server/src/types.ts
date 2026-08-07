// Minimal mirror of the payment types in website/lib/facilitator.ts and
// website/lib/types.ts. Kept duplicated (not imported cross-package) since
// this service ships and deploys independently of the website — it only
// needs to agree on wire shape, not share code.

export type PaymentScheme = "exact" | "upto";

export interface PaymentTerms {
  scheme: PaymentScheme;
  amountAlgo: number; // exact price, or the "upto" cap
  payeeAddress: string;
  network: "testnet";
}

export interface PaymentPayload {
  txnHash: string;
  payerAddress: string;
  payeeAddress: string;
  amountMicroAlgos: number;
}

export interface InferRequestBody {
  workflowId: string;
  stepId: string;
  task: string;
  input: string;
  payment?: PaymentPayload;
}

/** Shape of the facilitator's `POST /api/facilitator/settle` response. */
export interface SettleResponse {
  receipt?: {
    id: string;
    amountAlgo: number;
    txnHash: string;
    scheme: PaymentScheme;
    settledAt: string;
  };
  error?: string;
  reason?: string;
}
