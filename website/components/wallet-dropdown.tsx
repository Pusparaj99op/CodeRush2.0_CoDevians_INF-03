"use client";

import {
  Wallet,
  PlugsConnected,
  Planet,
  CaretDown,
  CheckCircle,
  XCircle,
  WarningCircle,
  ArrowSquareOut,
  Spinner,
  ShieldCheck,
  Lightning,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { connectLuteWallet } from "@/lib/lute-wallet";
import { connectFreighterWallet } from "@/lib/freighter-wallet";
import {
  connectMetaMask,
  isMetaMaskInstalled,
  SEPOLIA_CONFIG,
  subscribeMetaMaskEvents,
  switchOrAddSepoliaNetwork,
  fetchSepoliaBalance,
} from "@/lib/metamask-wallet";

type ActiveWalletType = "lute" | "freighter" | "metamask" | null;

export function WalletDropdown() {
  const [activeWallet, setActiveWallet] = useState<ActiveWalletType>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0.0000");
  const [isSepolia, setIsSepolia] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<ActiveWalletType>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [showMetaMaskModal, setShowMetaMaskModal] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  // Restore saved wallet state on load
  useEffect(() => {
    const savedType = localStorage.getItem("veldar:active_wallet_type") as ActiveWalletType;
    if (savedType === "metamask") {
      const saved = localStorage.getItem("veldar:metamask_address");
      if (saved) {
        setActiveWallet("metamask");
        setAddress(saved);
        void fetchSepoliaBalance(saved).then(setBalance);
      }
    } else if (savedType === "freighter") {
      const saved = localStorage.getItem("veldar:freighter_key");
      if (saved) {
        setActiveWallet("freighter");
        setAddress(saved);
      }
    } else if (savedType === "lute") {
      const saved = localStorage.getItem("veldar:lute_address");
      if (saved) {
        setActiveWallet("lute");
        setAddress(saved);
      }
    }
  }, []);

  // Listen for pointer down to close dropdown
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Listen for MetaMask window.ethereum accountsChanged and chainChanged
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const unsubscribe = subscribeMetaMaskEvents(
      (accounts) => {
        if (accounts && accounts.length > 0) {
          const newAddr = accounts[0]!;
          setAddress(newAddr);
          localStorage.setItem("veldar:metamask_address", newAddr);
          void fetchSepoliaBalance(newAddr).then(setBalance);
        } else {
          // Disconnected in extension
          if (activeWallet === "metamask") {
            handleDisconnect();
          }
        }
      },
      (chainIdHex) => {
        const onSepolia = chainIdHex.toLowerCase() === SEPOLIA_CONFIG.chainIdHex.toLowerCase();
        setIsSepolia(onSepolia);
        if (address) {
          void fetchSepoliaBalance(address).then(setBalance);
        }
      }
    );

    return () => unsubscribe();
  }, [activeWallet, address]);

  async function handleConnectLute() {
    setConnecting("lute");
    setError(null);
    try {
      const addr = await connectLuteWallet();
      setActiveWallet("lute");
      setAddress(addr);
      localStorage.setItem("veldar:active_wallet_type", "lute");
      localStorage.setItem("veldar:lute_address", addr);
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setConnecting(null);
    }
  }

  async function handleConnectFreighter() {
    setConnecting("freighter");
    setError(null);
    try {
      const key = await connectFreighterWallet();
      setActiveWallet("freighter");
      setAddress(key);
      localStorage.setItem("veldar:active_wallet_type", "freighter");
      localStorage.setItem("veldar:freighter_key", key);
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setConnecting(null);
    }
  }

  async function handleConnectMetaMask() {
    if (!isMetaMaskInstalled()) {
      setShowMetaMaskModal(true);
      setOpen(false);
      return;
    }

    setConnecting("metamask");
    setError(null);
    try {
      const res = await connectMetaMask();
      setActiveWallet("metamask");
      setAddress(res.address);
      setBalance(res.balance);
      setIsSepolia(res.isSepolia);
      localStorage.setItem("veldar:active_wallet_type", "metamask");
      localStorage.setItem("veldar:metamask_address", res.address);
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setConnecting(null);
    }
  }

  async function handleSwitchNetwork() {
    try {
      await switchOrAddSepoliaNetwork();
      setIsSepolia(true);
      if (address) {
        void fetchSepoliaBalance(address).then(setBalance);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function handleDisconnect() {
    setActiveWallet(null);
    setAddress(null);
    setBalance("0.0000");
    localStorage.removeItem("veldar:active_wallet_type");
    setOpen(false);
  }

  const shortAddr = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : null;

  return (
    <div ref={ref} className="relative z-[100]">
      {/* Navbar Trigger Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-[0.98] ${
          activeWallet
            ? activeWallet === "metamask"
              ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
              : activeWallet === "freighter"
              ? "border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
            : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-headline)] hover:border-[var(--color-accent)]/50 hover:bg-white/5"
        }`}
      >
        {connecting ? (
          <Spinner size={14} className="animate-spin text-[var(--color-accent)]" />
        ) : activeWallet === "metamask" ? (
          <Lightning size={14} className="text-amber-400" />
        ) : activeWallet === "freighter" ? (
          <Planet size={14} className="text-sky-400" />
        ) : activeWallet === "lute" ? (
          <PlugsConnected size={14} className="text-emerald-400" />
        ) : (
          <Wallet size={14} className="text-[var(--color-accent)]" />
        )}

        <span>
          {connecting
            ? "Connecting..."
            : activeWallet
            ? `${activeWallet.toUpperCase()}: ${shortAddr}`
            : "Connect Wallet"}
        </span>

        {activeWallet === "metamask" && balance && (
          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-200">
            {balance} SepoliaETH
          </span>
        )}

        <CaretDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu Modal */}
      {open && (
        <div className="absolute right-0 top-full z-[9999] mt-3 w-80 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[#12100e] p-2 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[var(--color-headline)] uppercase tracking-wider">
                Web3 Settlement Wallets
              </p>
              <span className="rounded-full bg-[var(--color-accent)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-accent)]">
                Multi-Chain
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[var(--color-muted)]">
              Choose your wallet for x402 payment settlement
            </p>
          </div>

          {/* Connected Wallet Dashboard Status */}
          {activeWallet && (
            <div className="my-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle size={14} weight="fill" />
                  Active: {activeWallet.toUpperCase()}
                </span>
                <button
                  onClick={handleDisconnect}
                  className="text-[11px] font-medium text-red-400 hover:text-red-300 underline"
                >
                  Disconnect
                </button>
              </div>

              <p className="mt-1.5 truncate font-mono text-[11px] text-[var(--color-headline)]">{address}</p>

              {activeWallet === "metamask" && (
                <div className="mt-2.5 flex flex-col gap-1.5 border-t border-white/10 pt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--color-muted)]">Sepolia Balance:</span>
                    <span className="font-mono font-bold text-amber-300">{balance} SepoliaETH</span>
                  </div>

                  {!isSepolia && (
                    <div className="mt-1 flex items-center justify-between rounded-lg bg-red-500/15 p-2 text-[11px] text-red-300">
                      <div className="flex items-center gap-1">
                        <WarningCircle size={14} />
                        <span>Wrong Network</span>
                      </div>
                      <button
                        onClick={handleSwitchNetwork}
                        className="rounded bg-red-500 px-2 py-0.5 font-bold text-white hover:bg-red-400"
                      >
                        Switch to Sepolia
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Wallet Selector List */}
          <div className="flex flex-col gap-1.5 py-1">
            {/* MetaMask Button */}
            <button
              onClick={handleConnectMetaMask}
              disabled={connecting !== null}
              className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                activeWallet === "metamask"
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-200"
                  : "border-white/5 bg-white/[0.02] text-[var(--color-headline)] hover:border-amber-500/30 hover:bg-amber-500/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/20 text-amber-400">
                  <Lightning size={18} weight="bold" />
                </div>
                <div>
                  <p className="text-xs font-semibold">MetaMask</p>
                  <p className="text-[10px] text-[var(--color-muted)]">Ethereum Sepolia Testnet</p>
                </div>
              </div>
              {activeWallet === "metamask" ? (
                <CheckCircle size={16} className="text-amber-400" weight="fill" />
              ) : (
                <span className="text-[10px] text-amber-400/80 font-mono">0xaa36a7</span>
              )}
            </button>

            {/* Freight Wallet Button */}
            <button
              onClick={handleConnectFreighter}
              disabled={connecting !== null}
              className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                activeWallet === "freighter"
                  ? "border-sky-500/50 bg-sky-500/15 text-sky-200"
                  : "border-white/5 bg-white/[0.02] text-[var(--color-headline)] hover:border-sky-500/30 hover:bg-sky-500/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-sky-500/20 text-sky-400">
                  <Planet size={18} weight="bold" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Freight Wallet</p>
                  <p className="text-[10px] text-[var(--color-muted)]">Stellar Network (XLM)</p>
                </div>
              </div>
              {activeWallet === "freighter" && <CheckCircle size={16} className="text-sky-400" weight="fill" />}
            </button>

            {/* Lute Wallet Button */}
            <button
              onClick={handleConnectLute}
              disabled={connecting !== null}
              className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                activeWallet === "lute"
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                  : "border-white/5 bg-white/[0.02] text-[var(--color-headline)] hover:border-emerald-500/30 hover:bg-emerald-500/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  <PlugsConnected size={18} weight="bold" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Lute Wallet</p>
                  <p className="text-[10px] text-[var(--color-muted)]">Algorand TestNet (ALGO)</p>
                </div>
              </div>
              {activeWallet === "lute" && <CheckCircle size={16} className="text-emerald-400" weight="fill" />}
            </button>
          </div>

          {error && <p className="mt-2 rounded-lg bg-red-500/20 p-2 text-[11px] text-red-300">{error}</p>}
        </div>
      )}

      {/* Fallback Modal for Undefined window.ethereum (MetaMask Not Installed) */}
      {showMetaMaskModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-amber-500/40 bg-[#141210] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                  <Lightning size={24} weight="bold" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-300">Install MetaMask Extension</h3>
                  <p className="text-xs text-gray-400">Ethereum Sepolia Web3 Wallet</p>
                </div>
              </div>
              <button
                onClick={() => setShowMetaMaskModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs leading-relaxed text-gray-300">
              MetaMask extension (<code className="text-amber-300 font-mono">window.ethereum</code>) was not detected in your browser. To execute Ethereum Sepolia x402 payment settlements, please install the MetaMask browser extension.
            </p>

            <div className="flex flex-col gap-2 rounded-xl bg-white/[0.03] p-3 text-xs">
              <span className="font-semibold text-amber-300">Sepolia Network Configuration:</span>
              <ul className="flex flex-col gap-1 text-[11px] font-mono text-gray-300">
                <li>• Chain ID: 1115511 (0xaa36a7)</li>
                <li>• RPC: https://rpc.sepolia.org</li>
                <li>• Currency: SepoliaETH</li>
                <li>• Explorer: https://sepolia.etherscan.io</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowMetaMaskModal(false)}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5"
              >
                Dismiss
              </button>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2 text-xs font-bold text-black hover:bg-amber-400"
              >
                <span>Download MetaMask</span>
                <ArrowSquareOut size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
