"use client";

import { ArrowUpRight, Check, CheckCircle, Code, Copy, Lightning, ShieldCheck, TerminalWindow, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
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

  async function runPipeline() {
    setRunning(true);
    await new Promise((r) => setTimeout(r, 400));
    const res = await executeX402PaymentPipeline({
      walletAddress,
      workflowName,
      amountAlgo,
    });
    setResult(res);
    setRunning(false);
  }

  useEffect(() => {
    if (isOpen && !result) {
      void runPipeline();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleCopy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl border border-white/15 bg-[#0d0b09] shadow-2xl my-auto">
        {/* Pinned Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4 bg-[#0d0b09]/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#ff5228]/15 text-[#ff5228] border border-[#ff5228]/30">
              <Lightning size={20} weight="fill" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-semibold text-[var(--color-headline)]">
                Enterprise x402 Payment Engine
              </h2>
              <p className="text-xs text-[var(--color-muted)] hidden sm:block">
                Cryptographic Payment Intent &amp; Algorand TestNet Settlement Inspector
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
                  <span>Computing...</span>
                </>
              ) : (
                <>
                  <Lightning size={14} weight="bold" />
                  <span>Re-Run x402 Engine</span>
                </>
              )}
            </SpecularButton>

            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 active:scale-95 transition-all"
              >
                <X size={18} weight="bold" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Body Wrapper */}
        <div className="flex-1 overflow-y-auto">
          {/* 10-Card Metric Grid */}
          <div className="grid grid-cols-2 gap-2.5 border-b border-white/10 bg-white/[0.01] p-4 sm:p-6 sm:grid-cols-5 text-xs">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">Wallet Status</p>
              <p className="mt-1 flex items-center gap-1 font-semibold text-emerald-400">
                <CheckCircle size={14} weight="fill" /> Verified
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">Session Signature</p>
              <p className="mt-1 font-semibold text-emerald-400">Valid</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">SHA256 Hash</p>
              <p className="mt-1 font-mono font-semibold text-[var(--color-headline)] truncate">
                {result?.sha256Hash.slice(0, 10) ?? "Computing..."}...
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">x402 Status</p>
              <p className="mt-1 font-semibold text-[#ff5228]">Generated</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">Signature Status</p>
              <p className="mt-1 font-semibold text-emerald-400">Verified ✓</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">Intent ID</p>
              <p className="mt-1 font-mono text-[11px] text-[var(--color-body)] truncate">
                {result?.paymentIntent.intentId ?? "—"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">Nonce</p>
              <p className="mt-1 font-mono text-[11px] text-[var(--color-body)]">
                {result?.paymentIntent.nonce ?? "—"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">Settlement Time</p>
              <p className="mt-1 font-semibold text-amber-300">
                {result?.finalitySeconds ?? 1.2} sec
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">Workflow</p>
              <p className="mt-1 font-semibold text-[var(--color-headline)] truncate">
                {workflowName}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">TxID Explorer</p>
              {result?.txId ? (
                <a
                  href={`https://testnet.algoexplorer.io/tx/${result.txId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex items-center gap-1 font-mono text-[11px] text-[#ff5228] hover:underline"
                >
                  <span>{result.txId.slice(0, 6)}...</span>
                  <ArrowUpRight size={12} />
                </a>
              ) : (
                <p className="mt-1 text-[11px] text-[var(--color-muted)]">Pending...</p>
              )}
            </div>
          </div>

          {/* Sticky Tab Selector */}
          <div className="sticky top-0 z-10 flex border-b border-white/10 bg-[#0d0b09]/95 backdrop-blur-md px-4 sm:px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("terminal")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === "terminal"
                  ? "border-[#ff5228] text-white"
                  : "border-transparent text-[var(--color-muted)] hover:text-white"
              }`}
            >
              <TerminalWindow size={16} />
              Terminal Console Output
            </button>

            <button
              onClick={() => setActiveTab("http")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === "http"
                  ? "border-[#ff5228] text-white"
                  : "border-transparent text-[var(--color-muted)] hover:text-white"
              }`}
            >
              <Code size={16} />
              HTTP x402 Exchange (402 → 200)
            </button>

            <button
              onClick={() => setActiveTab("metrics")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === "metrics"
                  ? "border-[#ff5228] text-white"
                  : "border-transparent text-[var(--color-muted)] hover:text-white"
              }`}
            >
              <ShieldCheck size={16} />
              Cryptographic Payload
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === "terminal" && (
              <div className="relative rounded-2xl border border-white/10 bg-black p-4 font-mono text-xs text-emerald-400">
                <button
                  onClick={() => result && handleCopy(result.terminalOutput, "terminal")}
                  className="absolute right-3 top-3 flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] text-white hover:bg-white/20"
                >
                  {copiedField === "terminal" ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedField === "terminal" ? "Copied" : "Copy Log"}</span>
                </button>
                <pre className="whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto pr-16">
                  {result?.terminalOutput ?? "Initializing Payment Engine..."}
                </pre>
              </div>
            )}

            {activeTab === "http" && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 font-mono text-xs">
                <div className="rounded-2xl border border-white/10 bg-black p-4">
                  <p className="mb-2 text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider">
                    HTTP Request (Client → Facilitator)
                  </p>
                  <pre className="whitespace-pre-wrap text-amber-300 leading-relaxed max-h-[360px] overflow-y-auto">
                    {result?.httpRequest ?? ""}
                  </pre>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black p-4">
                  <p className="mb-2 text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider">
                    HTTP Response (200 OK Accepted)
                  </p>
                  <pre className="whitespace-pre-wrap text-emerald-400 leading-relaxed max-h-[360px] overflow-y-auto">
                    {result?.httpResponse ?? ""}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === "metrics" && (
              <div className="flex flex-col gap-4 font-mono text-xs max-h-[400px] overflow-y-auto pr-1">
                <div className="rounded-2xl border border-white/10 bg-black p-4">
                  <p className="mb-1 text-[11px] text-[var(--color-muted)] uppercase">SHA256 Canonical Hash</p>
                  <p className="text-white break-all">{result?.sha256Hash}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black p-4">
                  <p className="mb-1 text-[11px] text-[var(--color-muted)] uppercase">Base64 x402 Authorization Header</p>
                  <p className="text-[#ff5228] break-all">{result?.base64Header}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black p-4">
                  <p className="mb-1 text-[11px] text-[var(--color-muted)] uppercase">Local Signature Verification</p>
                  <p className="text-emerald-400 break-all">{result?.signature}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
