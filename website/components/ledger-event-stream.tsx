"use client";

import {
  CheckCircle,
  Clock,
  Code,
  Coins,
  Copy,
  Check,
  FileText,
  Hourglass,
  Lightning,
  MagnifyingGlass,
  Package,
  Receipt,
  ShieldCheck,
  Tag,
  Truck,
  XCircle,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import { useState } from "react";
import type { LedgerEvent } from "@/lib/types";

export function LedgerEventStream({ trace }: { trace: LedgerEvent[] }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyPayload = (id: string, detail: Record<string, unknown>) => {
    navigator.clipboard.writeText(JSON.stringify(detail, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTrace = trace.filter((evt) => {
    const matchesFilter =
      filterType === "all" ||
      (filterType === "offers" && evt.type.includes("offer")) ||
      (filterType === "quotes" && evt.type.includes("quote")) ||
      (filterType === "approvals" && evt.type.includes("approval")) ||
      (filterType === "payments" && (evt.type.includes("payment") || evt.type.includes("settle")));

    const query = search.toLowerCase().trim();
    const detailString = JSON.stringify(evt.detail || {}).toLowerCase();
    const matchesSearch =
      !query ||
      evt.type.toLowerCase().includes(query) ||
      detailString.includes(query);

    return matchesFilter && matchesSearch;
  });

  const getEventMeta = (type: string) => {
    switch (type) {
      case "offer_seen":
        return {
          icon: Tag,
          badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
          label: "Offer Discovered",
        };
      case "quote_received":
        return {
          icon: Coins,
          badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          label: "Quote Received",
        };
      case "approval_requested":
        return {
          icon: Hourglass,
          badgeColor: "bg-amber-500/20 text-amber-200 border-amber-400/40 animate-pulse",
          label: "Human Approval Requested",
        };
      case "approval_decided":
        return {
          icon: ShieldCheck,
          badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
          label: "Approval Decided",
        };
      case "payment_verified":
        return {
          icon: ShieldCheck,
          badgeColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
          label: "Payment Verified",
        };
      case "payment_settled":
        return {
          icon: Lightning,
          badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
          label: "Settled on Chain",
        };
      case "fulfillment_verified":
        return {
          icon: Package,
          badgeColor: "bg-sky-500/20 text-sky-200 border-sky-400/40",
          label: "Fulfillment Confirmed",
        };
      case "step_failed":
        return {
          icon: XCircle,
          badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
          label: "Execution Error",
        };
      default:
        return {
          icon: FileText,
          badgeColor: "bg-white/10 text-[var(--color-body)] border-white/10",
          label: type.replace(/_/g, " "),
        };
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Stream Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-[var(--color-headline)]">
            Algorand TestNet Stream
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono font-medium text-[var(--color-muted)]">
            {trace.length} events
          </span>
        </div>

        {/* Search Input */}
        <div className="relative flex items-center min-w-[200px]">
          <MagnifyingGlass size={14} className="absolute left-3 text-[var(--color-muted)]" />
          <input
            type="text"
            placeholder="Search events, providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-black/40 py-1.5 pl-8 pr-3 text-xs text-[var(--color-headline)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[var(--color-border)]/60 pb-2.5">
        {[
          { id: "all", label: `All (${trace.length})` },
          { id: "offers", label: "Offers" },
          { id: "quotes", label: "Quotes" },
          { id: "approvals", label: "Approvals" },
          { id: "payments", label: "Settlements" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`rounded-lg px-3 py-1 text-[11px] font-semibold transition-colors ${
              filterType === tab.id
                ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/40"
                : "bg-white/[0.03] text-[var(--color-muted)] hover:bg-white/[0.08] hover:text-[var(--color-headline)] border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Event Items List */}
      <ul className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1">
        {filteredTrace.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center text-xs text-[var(--color-muted)]">
            No ledger events match your current filter query.
          </div>
        )}

        {filteredTrace.map((event) => {
          const meta = getEventMeta(event.type);
          const Icon = meta.icon;
          const isExpanded = !!expandedIds[event.id];
          const hasDetail = Object.keys(event.detail || {}).length > 0;
          const providerId = (event.detail?.providerId as string) || (event.detail?.provider as string);
          const amountAlgo = (event.detail?.priceAlgo as number) ?? (event.detail?.amountAlgo as number);

          return (
            <li
              key={event.id}
              className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)]/60 bg-white/[0.015] p-3.5 text-xs transition-colors hover:border-white/20 hover:bg-white/[0.03]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${meta.badgeColor} border`}>
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--color-headline)] truncate">
                        {meta.label}
                      </span>
                      {providerId && (
                        <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-[var(--color-body)] border border-white/10">
                          {providerId}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--color-muted)] capitalize">
                      {event.type.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {amountAlgo !== undefined && amountAlgo !== null && (
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {amountAlgo} ALGO
                    </span>
                  )}

                  <span className="font-mono text-[10px] text-[var(--color-muted)]">
                    {new Date(event.at).toLocaleTimeString()}
                  </span>

                  {hasDetail && (
                    <button
                      onClick={() => toggleExpand(event.id)}
                      className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-white/5 px-2 py-1 text-[11px] font-medium text-[var(--color-body)] hover:bg-white/10 hover:text-[var(--color-headline)] transition-colors"
                    >
                      <Code size={13} />
                      <span>{isExpanded ? "Hide JSON" : "View JSON"}</span>
                      {isExpanded ? <CaretUp size={12} /> : <CaretDown size={12} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded JSON Detail Box */}
              {isExpanded && hasDetail && (
                <div className="mt-2 rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-[11px]">
                  <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-1.5 text-[10px] text-[var(--color-muted)]">
                    <span>Cryptographic Event Payload</span>
                    <button
                      onClick={() => copyPayload(event.id, event.detail)}
                      className="flex items-center gap-1 text-[10px] text-[var(--color-accent)] hover:underline"
                    >
                      {copiedId === event.id ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Payload</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="max-h-48 overflow-x-auto text-[var(--color-body)] leading-relaxed">
                    {JSON.stringify(event.detail, null, 2)}
                  </pre>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
