// In-memory store — the zero-config fallback used when no Firebase service
// account is configured. Fine for local dev and unit tests; unreliable on a
// multi-instance deploy, which is exactly why the Firestore backend exists.

import type { Approval, LedgerEvent, Receipt, Workflow } from "../types";
import type { VeldarStore } from "./types";

class MemoryStore implements VeldarStore {
  readonly backend = "memory" as const;

  private workflows = new Map<string, Workflow>();
  private approvals = new Map<string, Approval>();
  private receipts = new Map<string, Receipt>();
  private ledger = new Map<string, LedgerEvent[]>();

  async getWorkflow(id: string): Promise<Workflow | null> {
    return this.workflows.get(id) ?? null;
  }

  async saveWorkflow(workflow: Workflow): Promise<void> {
    this.workflows.set(workflow.id, workflow);
  }

  async listWorkflowsByUser(userId: string): Promise<Workflow[]> {
    return [...this.workflows.values()]
      .filter((w) => w.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getApproval(id: string): Promise<Approval | null> {
    return this.approvals.get(id) ?? null;
  }

  async saveApproval(approval: Approval): Promise<void> {
    this.approvals.set(approval.id, approval);
  }

  async saveReceipt(receipt: Receipt): Promise<void> {
    this.receipts.set(receipt.id, receipt);
  }

  async findReceiptByStepAndTxn(stepId: string, txnHash: string): Promise<Receipt | null> {
    return (
      [...this.receipts.values()].find((r) => r.stepId === stepId && r.txnHash === txnHash) ?? null
    );
  }

  async appendLedgerEvent(event: LedgerEvent): Promise<void> {
    const events = this.ledger.get(event.workflowId) ?? [];
    events.push(event);
    this.ledger.set(event.workflowId, events);
  }

  async getTrace(workflowId: string): Promise<LedgerEvent[]> {
    return this.ledger.get(workflowId) ?? [];
  }
}

// A hot-reloaded dev server would otherwise create a fresh store per
// request; stash the singleton on globalThis to survive Next.js dev reloads.
const globalForStore = globalThis as unknown as { veldarMemoryStore?: MemoryStore };

export const memoryStore: VeldarStore = globalForStore.veldarMemoryStore ?? new MemoryStore();
globalForStore.veldarMemoryStore = memoryStore as MemoryStore;
