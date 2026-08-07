"use client";

import { useState } from "react";
import {
  Receipt,
  CheckCircle,
  Copy,
  DownloadSimple,
  Seal,
  Package,
  Truck,
  ArrowRight,
} from "@phosphor-icons/react";

function randomTxId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  return Array.from({ length: 52 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function randomAsaId() {
  return Math.floor(100_000_000 + Math.random() * 900_000_000).toString();
}

interface NftReceiptProps {
  productName: string;
  price: number;
  walletAddress?: string;
}

type SupplyStep = {
  label: string;
  emoji: string;
  status: "done" | "active" | "pending";
  txId?: string;
  timestamp?: string;
};

export function NftReceipt({ productName, price, walletAddress }: NftReceiptProps) {
  const [minted, setMinted] = useState(false);
  const [minting, setMinting] = useState(false);
  const [receiptTxId] = useState(randomTxId());
  const [asaId] = useState(randomAsaId());
  const [copied, setCopied] = useState(false);
  const [supplyPhase, setSupplyPhase] = useState(0);

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "ALGO...XXXX";

  const timestamp = new Date().toLocaleString("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const supplyChain: SupplyStep[] = [
    { label: "Order Confirmed", emoji: "✅", status: supplyPhase >= 1 ? "done" : "pending", txId: receiptTxId, timestamp },
    { label: "Payment Cleared", emoji: "💳", status: supplyPhase >= 2 ? "done" : supplyPhase === 1 ? "active" : "pending", txId: randomTxId(), timestamp: new Date(Date.now() + 60_000).toLocaleTimeString() },
    { label: "Warehouse Picked", emoji: "📦", status: supplyPhase >= 3 ? "done" : supplyPhase === 2 ? "active" : "pending" },
    { label: "Shipped (FedEx)", emoji: "🚚", status: supplyPhase >= 4 ? "done" : supplyPhase === 3 ? "active" : "pending" },
    { label: "Delivered — Escrow Released", emoji: "🔓", status: supplyPhase >= 5 ? "done" : "pending" },
  ];

  async function handleMint() {
    setMinting(true);
    // Simulate minting delay + supply chain progression
    await new Promise((r) => setTimeout(r, 1800));
    setMinted(true);
    setMinting(false);
    setSupplyPhase(1);
    // Progress supply chain automatically
    const advance = (phase: number, delay: number) =>
      setTimeout(() => setSupplyPhase(phase), delay);
    advance(2, 2500);
    advance(3, 5000);
    advance(4, 8500);
  }

  function handleCopy() {
    navigator.clipboard.writeText(receiptTxId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt size={16} className="text-emerald-400" weight="fill" />
          <span className="font-poppins text-xs font-bold text-[var(--color-headline)]">
            NFT Digital Receipt + Supply Chain
          </span>
        </div>
        <span className={`font-inter rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
          minted ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-[var(--color-border)] text-[var(--color-muted)]"
        }`}>
          {minted ? "✓ ASA Minted" : "Algorand ASA"}
        </span>
      </div>

      {/* Receipt card */}
      <div className={`rounded-xl border p-4 transition-all duration-500 ${
        minted ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent" : "border-white/5 bg-white/[0.02]"
      }`}>
        {/* Seal */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-poppins text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">
              Veldar Digital Receipt
            </p>
            <p className="font-poppins text-sm font-bold text-[var(--color-headline)] mt-0.5 truncate max-w-[200px]">
              {productName.split(":").pop()?.trim() ?? productName}
            </p>
          </div>
          <Seal
            size={32}
            className={`transition-all duration-500 ${minted ? "text-emerald-400" : "text-white/20"}`}
            weight={minted ? "fill" : "regular"}
          />
        </div>

        <div className="flex flex-col gap-1.5 font-inter text-[11px]">
          <div className="flex justify-between">
            <span className="text-[var(--color-muted)]">Amount Paid</span>
            <span className="font-semibold text-[var(--color-headline)]">${price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-muted)]">Buyer Wallet</span>
            <span className="font-mono text-[var(--color-body)]">{shortAddr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-muted)]">ASA Token ID</span>
            <span className="font-mono text-sky-400">#{asaId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-muted)]">Timestamp</span>
            <span className="text-[var(--color-body)]">{timestamp}</span>
          </div>
          {minted && (
            <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5">
              <span className="text-[var(--color-muted)]">Algorand TxID</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] text-emerald-400">
                  {receiptTxId.slice(0, 12)}...
                </span>
                <button onClick={handleCopy} className="text-[var(--color-muted)] hover:text-[var(--color-headline)] transition-colors">
                  {copied ? <CheckCircle size={11} className="text-emerald-400" /> : <Copy size={11} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Supply chain tracker */}
      {minted && (
        <div className="flex flex-col gap-2">
          <p className="font-poppins text-[11px] font-bold text-[var(--color-headline)]">
            📦 Supply Chain — Blockchain Anchored
          </p>
          <div className="flex flex-col gap-1.5">
            {supplyChain.map((step, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className={`h-2 w-2 rounded-full shrink-0 transition-all duration-500 ${
                  step.status === "done" ? "bg-emerald-400" : step.status === "active" ? "bg-amber-400 animate-pulse" : "bg-white/10"
                }`} />
                <span className="text-base">{step.emoji}</span>
                <span className={`font-inter text-[11px] flex-1 ${
                  step.status === "done" ? "text-[var(--color-body)]" : step.status === "active" ? "text-amber-400" : "text-[var(--color-muted)]"
                }`}>
                  {step.label}
                </span>
                {step.txId && step.status === "done" && (
                  <span className="font-mono text-[9px] text-emerald-300/60 shrink-0">
                    {step.txId.slice(0, 8)}...
                  </span>
                )}
                {step.status === "active" && (
                  <span className="font-inter text-[9px] text-amber-400/70">In progress...</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mint button */}
      {!minted ? (
        <button
          onClick={handleMint}
          disabled={minting}
          className="flex items-center justify-center gap-2 rounded-full bg-emerald-500 py-2.5 text-xs font-semibold text-white transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-60 font-poppins"
        >
          {minting ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Minting ASA on Algorand TestNet...
            </>
          ) : (
            <>
              <Seal size={14} weight="fill" />
              Mint NFT Receipt on Algorand
              <ArrowRight size={13} weight="bold" />
            </>
          )}
        </button>
      ) : (
        <button
          onClick={() => window.open(`https://testnet.algoexplorer.io/asset/${asaId}`, "_blank")}
          className="flex items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 py-2.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/10 font-poppins"
        >
          <DownloadSimple size={14} />
          View on Algorand Explorer
          <ArrowRight size={13} weight="bold" />
        </button>
      )}
    </div>
  );
}
