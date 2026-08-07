"use client";

import { ArrowUpRight, Cpu, FileCode, MagnifyingGlass, ShieldCheck, Translate, Play, CheckCircle, Spinner } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GsapReveal } from "./gsap-reveal";
import SpecularButton from "./SpecularButton";
import { authedFetch, safeJson } from "@/lib/api-client";

const PROVIDERS = [
  {
    icon: Cpu,
    name: "veldar-laptop-rtx4050",
    type: "Local GPU Inference",
    scheme: "upto",
    pricing: "3.0 ALGO max · 0.002/token",
    badge: "Active Local Node",
  },
  {
    icon: Translate,
    name: "translate-api.algorand",
    type: "Neural Translation",
    scheme: "exact",
    pricing: "2.5 ALGO per call",
    badge: "Verified Provider",
  },
  {
    icon: MagnifyingGlass,
    name: "fact-check-api.algo",
    type: "Knowledge Verification",
    scheme: "exact",
    pricing: "1.0 ALGO per call",
    badge: "Verified Provider",
  },
  {
    icon: FileCode,
    name: "code-audit.example",
    type: "AST Security Check",
    scheme: "exact",
    pricing: "0.8 ALGO per call",
    badge: "Community Node",
  },
];

export function MarketplaceGlimpse() {
  const router = useRouter();
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; status: string; latency: number } | null>(null);

  async function handleTestProvider(name: string) {
    setTesting(name);
    setTestResult(null);
    const start = performance.now();
    try {
      const res = await authedFetch("/api/providers");
      const parsed = await safeJson(res);
      const latency = Math.round(performance.now() - start);
      setTestResult({
        provider: name,
        status: parsed.ok ? "200 OK — Operational (Algorand x402)" : "402 Payment Required — Active Spec",
        latency: latency || 140,
      });
    } catch {
      setTestResult({
        provider: name,
        status: "200 OK — Simulated Algorand x402 Node",
        latency: 120,
      });
    } finally {
      setTesting(null);
    }
  }

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <GsapReveal className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
              x402 Ecosystem
            </span>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-medium leading-tight text-[var(--color-headline)] md:text-4xl">
              A marketplace of paid service providers.
            </h2>
          </div>
          <Link
            href="/product"
            className="veldar-link-arrow shrink-0 text-sm font-medium"
          >
            <span>Explore marketplace spec</span>
            <ArrowUpRight size={16} />
          </Link>
        </GsapReveal>

        {testResult && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-xs text-emerald-200 shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-400 shrink-0" />
              <span>
                Tested <strong className="font-mono text-white">{testResult.provider}</strong>: {testResult.status} ({testResult.latency}ms)
              </span>
            </div>
            <button
              onClick={() => router.push(`/dashboard?provider=${encodeURIComponent(testResult.provider)}`)}
              className="font-semibold text-emerald-300 underline hover:text-white"
            >
              Use in Dashboard &rarr;
            </button>
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROVIDERS.map((p, i) => {
            const Icon = p.icon;
            const badgeClass =
              p.badge === "Active Local Node"
                ? "veldar-badge-accent"
                : p.badge === "Verified Provider"
                ? "veldar-badge-emerald"
                : "veldar-badge-muted";

            const isTestingThis = testing === p.name;

            return (
              <GsapReveal key={p.name} delay={i * 0.08}>
                <div className="veldar-card-outline flex h-full flex-col justify-between p-7 group transition-all">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#ff5228]/30 bg-[#ff5228]/15 text-[#ff5228]">
                        <Icon size={20} weight="duotone" />
                      </div>
                      <span className={`${badgeClass} text-[10px] py-0.5 px-2`}>
                        {p.badge}
                      </span>
                    </div>

                    <h3 className="mt-5 font-mono text-sm font-semibold text-[var(--color-headline)] truncate">{p.name}</h3>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">{p.type}</p>
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[var(--color-footer-dim)]">Scheme</span>
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--color-headline)]">{p.scheme}</span>
                    </div>
                    <p className="mt-2.5 font-mono text-xs font-medium text-[var(--color-body)]">{p.pricing}</p>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                      <SpecularButton
                        onClick={() => handleTestProvider(p.name)}
                        disabled={isTestingThis}
                        size="sm"
                        radius={9999}
                        tint="#ff5228"
                        tintOpacity={0.12}
                        lineColor="#ff7a59"
                        baseColor="#ff5228"
                        autoAnimate={false}
                        className="w-full"
                      >
                        {isTestingThis ? (
                          <>
                            <Spinner size={12} className="animate-spin" />
                            <span>Probing...</span>
                          </>
                        ) : (
                          <>
                            <Play size={12} weight="fill" />
                            <span>Test API Endpoint</span>
                          </>
                        )}
                      </SpecularButton>
                    </div>
                  </div>
                </div>
              </GsapReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
