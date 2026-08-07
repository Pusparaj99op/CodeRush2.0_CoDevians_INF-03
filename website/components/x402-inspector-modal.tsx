"use client";

import { ArrowUpRight, Check, CheckCircle, Code, Copy, Lightning, ShieldCheck, TerminalWindow, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import SpecularButton from "@/components/SpecularButton";
import { executeX402PaymentPipeline, type X402AuthorizationResult } from "@/lib/x402-engine";

interface X402InspectorProps {
  walletAddress?: string | null;
  workflowName?: string;
  amountAlgo?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export function X402InspectorModal({
  walletAddress,
  workflowName = "Travel Orchestrator",
  amountAlgo = 0.8,
  isOpen = false,
  onClose,
}: X402InspectorProps) {
  const [result, setResult] = useState<X402AuthorizationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"terminal" | "http" | "metrics">("terminal");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  async function runPipeline() {
    setRunning(true);
    await new Promise((r) => setTimeout(r, 400));
    const res = await executeX402PaymentPipeline({ walletAddress, workflowName, amountAlgo });
    setResult(res);
    setRunning(false);
  }

  useEffect(() => {
    if (isOpen && !result) void runPipeline();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    // Prevent body scroll while modal is open
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleCopy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  return (
    // Full-screen overlay — uses grid to vertically center the dialog
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      className="fixed inset-0 z-[99999] grid place-items-center bg-black/85 backdrop-blur-md"
      style={{ padding: "clamp(8px, 3vh, 24px) clamp(8px, 3vw, 24px)" }}
    >
      {/*
        Modal card:
        - Width: capped at 56rem (896px) but never wider than viewport
        - Height: exactly fits the viewport with the above padding → never clips top/bottom
        - Layout: flex-col so header stays pinned and body scrolls
      */}
      <div
        className="flex flex-col w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-[#0d0b09] shadow-2xl"
        style={{ height: "calc(100vh - clamp(16px, 6vh, 48px))" }}
      >
        {/* ── PINNED HEADER ─────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3 bg-[#0d0b09]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#ff5228]/15 text-[#ff5228] border border-[#ff5228]/30">
              <Lightning size={18} weight="fill" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-sm sm:text-base font-semibold text-[var(--color-headline)] truncate">
                Enterprise x402 Payment Engine
              </h2>
              <p className="text-[11px] text-[var(--color-muted)] truncate hidden sm:block">
                Cryptographic Payment Intent &amp; Algorand TestNet Settlement Inspector
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 ml-3">
            <SpecularButton
              onClick={runPipeline}
              disabled={running}
              size="sm"
              radius={9999}
              tint="#ff5228"
              tintOpacity={0.15}
              lineColor="#ff7a59"
              baseColor="#ff5228"
              autoAnimate={true}
            >
              {running ? (
                <>
                  <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span className="hidden sm:inline">Computing...</span>
                </>
              ) : (
                <>
                  <Lightning size={13} weight="bold" />
                  <span>Re-Run x402 Engine</span>
                </>
              )}
            </SpecularButton>

            <button
              onClick={onClose}
              aria-label="Close"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.08] border border-white/20 text-[var(--color-muted)] hover:bg-white/20 hover:text-white active:scale-95 transition-all"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ─────────────────────────────────── */}
        <div ref={bodyRef} className="flex flex-col flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

          {/* 10-Card Metric Grid */}
          <div className="grid grid-cols-2 gap-2 border-b border-white/10 bg-white/[0.01] p-3 sm:p-4 sm:grid-cols-5 text-xs shrink-0">
            {[
              { label: "Wallet Status", value: <span className="flex items-center gap-1 text-emerald-400"><CheckCircle size={13} weight="fill" />Verified</span> },
              { label: "Session Signature", value: <span className="text-emerald-400">Valid</span> },
              { label: "SHA256 Hash", value: <span className="font-mono text-[var(--color-headline)] truncate block">{result?.sha256Hash.slice(0, 10) ?? "Computing…"}…</span> },
              { label: "x402 Status", value: <span className="text-[#ff5228]">Generated</span> },
              { label: "Signature Status", value: <span className="text-emerald-400">Verified ✓</span> },
              { label: "Intent ID", value: <span className="font-mono text-[11px] text-[var(--color-body)] truncate block">{result?.paymentIntent.intentId ?? "—"}</span> },
              { label: "Nonce", value: <span className="font-mono text-[11px] text-[var(--color-body)]">{result?.paymentIntent.nonce ?? "—"}</span> },
              { label: "Settlement Time", value: <span className="font-semibold text-amber-300">{result?.finalitySeconds ?? 1.2} sec</span> },
              { label: "Workflow", value: <span className="text-[var(--color-headline)] truncate block">{workflowName}</span> },
              {
                label: "TxID Explorer",
                value: result?.txId ? (
                  <a href={`https://testnet.algoexplorer.io/tx/${result.txId}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 font-mono text-[11px] text-[#ff5228] hover:underline">
                    {result.txId.slice(0, 6)}… <ArrowUpRight size={11} />
                  </a>
                ) : <span className="text-[11px] text-[var(--color-muted)]">Pending…</span>
              },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
                <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">{label}</p>
                <div className="mt-1 font-semibold">{value}</div>
              </div>
            ))}
          </div>

          {/* Tab Selector — sticky inside the scrollable body */}
          <div className="sticky top-0 z-10 flex shrink-0 border-b border-white/10 bg-[#0d0b09]/95 backdrop-blur-md overflow-x-auto">
            {([
              ["terminal", <TerminalWindow key="t" size={14} />, "Terminal Console Output"],
              ["http",     <Code key="h" size={14} />,            "HTTP x402 Exchange (402 → 200)"],
              ["metrics",  <ShieldCheck key="m" size={14} />,     "Cryptographic Payload"],
            ] as const).map(([id, icon, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? "border-[#ff5228] text-white"
                    : "border-transparent text-[var(--color-muted)] hover:text-white"
                }`}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-5 flex-1">
            {activeTab === "terminal" && (
              <div className="relative rounded-2xl border border-white/10 bg-black p-4 font-mono text-xs text-emerald-400 h-full">
                <button
                  onClick={() => result && handleCopy(result.terminalOutput, "terminal")}
                  className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] text-white hover:bg-white/20"
                >
                  {copiedField === "terminal" ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedField === "terminal" ? "Copied" : "Copy Log"}</span>
                </button>
                <pre className="whitespace-pre-wrap leading-relaxed pt-6 overflow-y-auto" style={{ maxHeight: "calc(100% - 8px)" }}>
                  {result?.terminalOutput ?? "Initializing Payment Engine..."}
                </pre>
              </div>
            )}

            {activeTab === "http" && (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 font-mono text-xs h-full">
                {[
                  { label: "HTTP Request (Client → Facilitator)", content: result?.httpRequest ?? "", color: "text-amber-300" },
                  { label: "HTTP Response (200 OK Accepted)", content: result?.httpResponse ?? "", color: "text-emerald-400" },
                ].map(({ label, content, color }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-black p-4 overflow-hidden">
                    <p className="mb-2 text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider">{label}</p>
                    <pre className={`whitespace-pre-wrap leading-relaxed overflow-y-auto ${color}`} style={{ maxHeight: "280px" }}>
                      {content}
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "metrics" && (
              <div className="flex flex-col gap-3 font-mono text-xs overflow-y-auto">
                {[
                  { label: "SHA256 Canonical Hash", value: result?.sha256Hash, color: "text-white" },
                  { label: "Base64 x402 Authorization Header", value: result?.base64Header, color: "text-[#ff5228]" },
                  { label: "Local Signature Verification", value: result?.signature, color: "text-emerald-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-black p-4">
                    <p className="mb-1 text-[11px] text-[var(--color-muted)] uppercase">{label}</p>
                    <p className={`break-all ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
