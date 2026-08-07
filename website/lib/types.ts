// Core domain types for the Veldar orchestrator + Algorand x402 facilitator.
// See Doc/specs/02-website.md for the full design this implements.

export type Tier = "free" | "pro" | "promax";

export const TIER_CAPS: Record<Tier, { perTxnCapAlgo: number | null; platformCutBps: number }> = {
  free: { perTxnCapAlgo: 0.5, platformCutBps: 250 }, // 2.5%
  pro: { perTxnCapAlgo: 5, platformCutBps: 100 }, // 1%
  promax: { perTxnCapAlgo: null, platformCutBps: 0 }, // unlimited, no cut
};

export type PaymentScheme = "exact" | "upto";

export interface Provider {
  id: string;
  name: string;
  endpoint: string;
  capability: string;
  scheme: PaymentScheme;
  priceAlgo: number; // for "exact": fixed price. for "upto": max price.
  verified: boolean;
}

export type StepStatus =
  | "pending"
  | "quoted"
  | "awaiting_approval"
  | "paying"
  | "paid"
  | "verifying"
  | "fulfilled"
  | "skipped"
  | "failed"
  | "cancelled";

export interface WorkflowStep {
  id: string;
  providerId: string;
  description: string;
  condition?: string; // human-readable condition for conditional edges
  dependsOn: string[]; // step ids that must complete first
  status: StepStatus;
  quotedPriceAlgo: number | null;
  settledPriceAlgo: number | null;
  receiptId: string | null;
}

export type WorkflowStatus = "planning" | "running" | "cancelled" | "completed" | "failed";

export interface Workflow {
  id: string;
  userId: string;
  tier: Tier;
  goal: string;
  budgetAlgo: number;
  spentAlgo: number;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

export interface Approval {
  id: string;
  workflowId: string;
  stepId: string;
  providerId: string;
  amountAlgo: number;
  reason: string;
  status: "pending" | "approved" | "denied";
  createdAt: string;
  decidedAt: string | null;
}

export interface Receipt {
  id: string;
  workflowId: string;
  stepId: string;
  providerId: string;
  amountAlgo: number;
  scheme: PaymentScheme;
  txnHash: string;
  network: "testnet";
  settledAt: string;
}

export type LedgerEventType =
  | "workflow_created"
  | "offer_seen"
  | "quote_received"
  | "approval_requested"
  | "approval_decided"
  | "payment_verified"
  | "payment_settled"
  | "fulfillment_verified"
  | "step_failed"
  | "workflow_cancelled"
  | "workflow_completed";

export interface LedgerEvent {
  id: string;
  workflowId: string;
  type: LedgerEventType;
  stepId?: string;
  detail: Record<string, unknown>;
  at: string;
}
