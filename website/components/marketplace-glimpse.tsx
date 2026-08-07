import { ArrowUpRight, Cpu, FileCode, MagnifyingGlass, ShieldCheck, Translate } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { GsapReveal } from "./gsap-reveal";

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
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <GsapReveal className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted)]">
              x402 Ecosystem
            </span>
            <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-3xl font-medium leading-tight text-[var(--color-headline)] md:text-4xl">
              A marketplace of paid service providers.
            </h2>
          </div>
          <Link
            href="/product"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
          >
            Explore marketplace spec
            <ArrowUpRight size={16} />
          </Link>
        </GsapReveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROVIDERS.map((p, i) => {
            const Icon = p.icon;
            return (
              <GsapReveal key={p.name} delay={i * 0.08}>
                <div className="flex h-full flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 transition-all hover:border-[var(--color-headline)]/30 hover:bg-white/[0.03]">
                  <div>
                    <div className="flex items-center justify-between">
                      <Icon size={26} weight="duotone" className="text-[var(--color-cta)]" />
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        {p.badge}
                      </span>
                    </div>

                    <h3 className="mt-4 font-mono text-sm font-semibold text-[var(--color-headline)]">{p.name}</h3>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">{p.type}</p>
                  </div>

                  <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[var(--color-footer-dim)]">Scheme</span>
                      <span className="rounded bg-white/5 px-1.5 py-0.5 uppercase text-[var(--color-headline)]">{p.scheme}</span>
                    </div>
                    <p className="mt-2 font-mono text-xs text-[var(--color-body)]">{p.pricing}</p>
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
