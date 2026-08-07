// Which settlement mode the orchestrator is running in.
//
// "real"      — a funded TestNet account signs and submits an actual
//               Algorand payment for every step. Requires DEMO_PAYER_MNEMONIC.
// "simulated" — no chain contact; payments get a clearly-marked synthetic
//               txn id. This is the zero-config default so the demo runs
//               on a fresh clone (and on the live Vercel deploy) without a
//               key, but every receipt and ledger event it produces is
//               flagged `simulated: true` — a trace must never imply a
//               settlement that didn't happen.
//
// The mode is derived from one thing only: whether a mnemonic is present.
// There is deliberately no SETTLEMENT_MODE=real override, because the only
// way to "force" real mode is to actually supply a key.

export type SettlementMode = "real" | "simulated";

/** Marks a txn id as synthetic. Chosen so it can never collide with a
 *  real Algorand txn id (those are 52-char base32, no hyphens). */
export const SIMULATED_TXN_PREFIX = "SIMULATED-";

export function settlementMode(): SettlementMode {
  return process.env.DEMO_PAYER_MNEMONIC ? "real" : "simulated";
}

export function isSimulatedTxn(txnHash: string): boolean {
  return txnHash.startsWith(SIMULATED_TXN_PREFIX);
}
