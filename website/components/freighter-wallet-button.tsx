"use client";

import { Wallet, PlugsConnected, Planet } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { connectFreighterWallet } from "@/lib/freighter-wallet";

export function FreighterWalletButton() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("veldar:freighter_key");
    if (saved) setPublicKey(saved);
  }, []);

  async function handleConnect() {
    setConnecting(true);
    setError(null);
    try {
      const key = await connectFreighterWallet();
      setPublicKey(key);
      localStorage.setItem("veldar:freighter_key", key);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setConnecting(false);
    }
  }

  function handleDisconnect() {
    setPublicKey(null);
    localStorage.removeItem("veldar:freighter_key");
  }

  if (publicKey) {
    const shortKey = `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDisconnect}
          title="Click to disconnect Freight Wallet"
          className="flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-sky-300 transition-colors hover:bg-sky-500/20"
        >
          <PlugsConnected size={14} className="text-sky-400" />
          <span>Freight: {shortKey}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-headline)] transition-colors hover:border-sky-400/50 hover:bg-white/5 active:scale-[0.98] disabled:opacity-50"
      >
        <Planet size={14} className="text-sky-400" />
        <span>{connecting ? "Connecting Freight..." : "Connect Freight (Stellar)"}</span>
      </button>

      {error && (
        <div className="absolute right-0 top-full z-[9999] mt-2 w-60 rounded-xl border border-red-500/30 bg-[#12100e] p-3 text-xs text-red-300 shadow-xl">
          {error}
        </div>
      )}
    </div>
  );
}
