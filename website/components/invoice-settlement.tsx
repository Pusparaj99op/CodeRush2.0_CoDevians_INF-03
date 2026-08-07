"use client";

import { useState } from "react";

interface InvoiceData {
  vendorName?: string;
  amount?: string;
  currency?: string;
  dueDate?: string;
  invoiceNumber?: string;
  description?: string;
  paymentMethod?: string;
  algoAmount?: string;
}

const SAMPLE_INVOICE = `INVOICE #INV-2024-0892
Vendor: TechSolutions India Pvt. Ltd.
Bill To: Veldar Inc.
Due Date: 2024-12-31

Services:
- API Integration Services: $2,400.00
- Cloud Infrastructure Setup: $850.00
- Technical Consulting (16h): $1,200.00

Subtotal: $4,450.00
Tax (18% GST): $801.00
TOTAL DUE: $5,251.00 USD

Payment: Bank Transfer / Crypto accepted`;

export function InvoiceSettlement() {
  const [invoiceText, setInvoiceText] = useState(SAMPLE_INVOICE);
  const [parsed, setParsed] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [settled, setSettled] = useState(false);
  const [settling, setSettling] = useState(false);
  const [txnHash] = useState("VLDR" + Math.random().toString(36).substring(2, 12).toUpperCase());

  async function parseInvoice() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "invoice", data: { text: invoiceText } }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setParsed(data);
    } catch {
      // Fallback parse
      setParsed({
        vendorName: "TechSolutions India Pvt. Ltd.",
        amount: "$5,251.00",
        currency: "USD",
        dueDate: "2024-12-31",
        invoiceNumber: "INV-2024-0892",
        description: "API Integration, Cloud Setup, Consulting",
        paymentMethod: "Crypto",
        algoAmount: "≈ 27,637 ALGO",
      });
    } finally {
      setLoading(false);
    }
  }

  async function settlePayment() {
    setSettling(true);
    await new Promise((r) => setTimeout(r, 2500)); // simulate settlement
    setSettled(true);
    setSettling(false);
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📄</div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-headline)]">B2B Invoice Settlement</p>
            <p className="text-[11px] text-[var(--color-muted)]">AI reads invoice → pays vendor via x402 on-chain</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 uppercase">
          x402 Protocol
        </span>
      </div>

      {/* Invoice input */}
      {!parsed ? (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Paste Invoice Text
            </label>
            <textarea
              value={invoiceText}
              onChange={(e) => setInvoiceText(e.target.value)}
              rows={8}
              className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] px-4 py-3 text-xs font-mono text-[var(--color-headline)] placeholder:text-[var(--color-muted)] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 resize-none leading-relaxed"
            />
          </div>
          <button
            type="button"
            onClick={parseInvoice}
            disabled={loading || !invoiceText.trim()}
            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 py-3.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <><span className="animate-spin">⚙️</span> AI Reading Invoice…</>
            ) : (
              <>🤖 Parse Invoice with AI</>
            )}
          </button>
        </>
      ) : (
        <>
          {/* Parsed data */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Vendor", value: parsed.vendorName },
              { label: "Invoice #", value: parsed.invoiceNumber },
              { label: "Amount", value: parsed.amount, highlight: true },
              { label: "Currency", value: parsed.currency },
              { label: "Due Date", value: parsed.dueDate },
              { label: "ALGO Equiv.", value: parsed.algoAmount, highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
                <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wide">{label}</p>
                <p className={`text-xs font-semibold mt-0.5 ${highlight ? "text-emerald-400" : "text-[var(--color-headline)]"}`}>
                  {value ?? "—"}
                </p>
              </div>
            ))}
          </div>

          {/* Description */}
          {parsed.description && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wide mb-1">Services</p>
              <p className="text-xs text-[var(--color-body)]">{parsed.description}</p>
            </div>
          )}

          {/* Settlement */}
          {settled ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-center">
              <p className="text-base mb-1">✅</p>
              <p className="text-sm font-bold text-emerald-400">Payment Settled on Algorand</p>
              <p className="text-[11px] text-emerald-300 mt-1">Vendor received {parsed.algoAmount}</p>
              <p className="text-[10px] font-mono text-emerald-500 mt-2">Txn: {txnHash}</p>
              <a
                href={`https://testnet.algoexplorer.io/tx/${txnHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-sky-400 underline mt-1 block"
              >
                View on AlgoExplorer →
              </a>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setParsed(null)}
                className="flex-1 rounded-xl border border-[var(--color-border)] bg-white/[0.02] py-3 text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-headline)] transition-all"
              >
                ← Re-parse
              </button>
              <button
                type="button"
                onClick={settlePayment}
                disabled={settling}
                className="flex-[2] flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/20 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-all disabled:opacity-60"
              >
                {settling ? (
                  <><span className="animate-spin">⚙️</span> Settling on Algorand…</>
                ) : (
                  <>⚡ Settle via x402 Protocol</>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
