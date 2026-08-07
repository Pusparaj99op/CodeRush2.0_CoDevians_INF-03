// The persistence interface the orchestrator and route handlers code
// against. Two backends implement it: Firestore (production / the live
// Vercel deploy) and an in-memory map store (zero-config local dev).
//
// Async by design. The previous synchronous Map-based store worked in dev
// but is wrong on Vercel: each request can land on a different instance,
// so a workflow created by one request is invisible to the next.
// Doc/specs/02-website.md specifies Firestore (`ledger/{workflowId}/events`).

import type { Approval, LedgerEvent, Receipt, Workflow } from "../types";

export interface VeldarStore {
  getWorkflow(id: string): Promise<Workflow | null>;
  saveWorkflow(workflow: Workflow): Promise<void>;
  listWorkflowsByUser(userId: string): Promise<Workflow[]>;

  getApproval(id: string): Promise<Approval | null>;
  saveApproval(approval: Approval): Promise<void>;

  saveReceipt(receipt: Receipt): Promise<void>;
  /** Idempotency lookup: has this txn already been settled for this step? */
  findReceiptByStepAndTxn(stepId: string, txnHash: string): Promise<Receipt | null>;

  /** Append-only. Ledger events are never updated or deleted. */
  appendLedgerEvent(event: LedgerEvent): Promise<void>;
  getTrace(workflowId: string): Promise<LedgerEvent[]>;

  /** Human-readable backend name, surfaced by /api/providers for debugging. */
  readonly backend: "firestore" | "memory";
}
