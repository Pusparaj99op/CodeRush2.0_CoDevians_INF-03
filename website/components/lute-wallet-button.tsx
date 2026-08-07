"use client";

import { Wallet, Check, PlugsConnected } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { connectLuteWallet } from "@/lib/lute-wallet";

export function LuteWalletButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("veldar:lute_address");
    if (saved) setAddress(saved);
  }, []);

  async function handleConnect() {
    setConnecting(true);
    setError(null);
    try {
      const addr = await connectLuteWallet();
      setAddress(addr);
      localStorage.setItem("veldar:lute_address", addr);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setConnecting(false);
    }
  }

  function handleDisconnect() {
    setAddress(null);
    localStorage.removeItem("veldar:lute_address");
  }

  if (address) {
    const shortAddr = `${address.slice(0, 4)}...${address.slice(-4)}`;
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDisconnect}
          title="Click to disconnect Lute Wallet"
          className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
        >
          <PlugsConnected size={14} className="text-emerald-400" />
          <span>Lute: {shortAddr}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-headline)] transition-colors hover:border-[var(--color-accent)]/50 hover:bg-white/5 active:scale-[0.98] disabled:opacity-50"
      >
        <Wallet size={14} className="text-[var(--color-accent)]" />
        <span>{connecting ? "Connecting Lute..." : "Connect Lute"}</span>
      </button>

      {error && (
        <div className="absolute right-0 top-full z-[9999] mt-2 w-60 rounded-xl border border-red-500/30 bg-[#12100e] p-3 text-xs text-red-300 shadow-xl">
          {error}
        </div>
      )}
    </div>
  );
}
