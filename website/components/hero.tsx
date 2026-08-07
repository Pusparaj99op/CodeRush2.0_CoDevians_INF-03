import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { TracePreview } from "./trace-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 lg:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "linear-gradient(135deg, var(--color-card-from), var(--color-card-to))" }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
        <div>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white/5 px-3 py-1 text-xs font-medium text-[var(--color-headline)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              Algorand TestNet
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white/5 px-3 py-1 text-xs font-medium text-[var(--color-body)]">
              x402 Micropayments
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white/5 px-3 py-1 text-xs font-medium text-[var(--color-body)]">
              Budget Enforced
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.05] tracking-tight text-[var(--color-headline)] md:text-5xl lg:text-6xl">
            An agent that spends carefully.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-[var(--color-body)]">
            Give Veldar a goal. It shops a marketplace of paid services, pays each one in small
            Algorand transfers, and shows you everything before it&apos;s final.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-cta)] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-cta-hover)] active:scale-[0.98]"
            >
              Get started
              <ArrowRight size={16} weight="bold" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-6 py-3.5 text-sm font-semibold text-[var(--color-headline)] transition-colors hover:border-[var(--color-headline)]/40"
            >
              See how it works
            </a>
          </div>
        </div>

        <TracePreview />
      </div>
    </section>
  );
}
