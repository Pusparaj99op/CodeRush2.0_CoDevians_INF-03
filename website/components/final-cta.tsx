import { ArrowRight, Sparkle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { GsapReveal } from "./gsap-reveal";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[450px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 blur-[120px]"
        style={{ background: "linear-gradient(135deg, var(--color-card-from), var(--color-accent))" }}
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        <GsapReveal>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white/5 px-4 py-1.5 text-xs font-semibold text-[var(--color-headline)]">
            <Sparkle size={14} className="text-[var(--color-cta)]" weight="fill" />
            Ready for Agentic Micropayments
          </span>

          <h2 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.1] tracking-tight text-[var(--color-headline)] md:text-5xl lg:text-6xl">
            Give it a goal. Watch it pay.
          </h2>

          <p className="mx-auto mt-6 max-w-[50ch] text-lg leading-relaxed text-[var(--color-body)]">
            Start on Algorand TestNet with zero friction. Every payment requires your explicit approval on the free tier until you choose your policy cap.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-cta)] px-8 py-4 text-base font-semibold text-white transition-all hover:bg-[var(--color-cta-hover)] active:scale-[0.98]"
            >
              Get started for free
              <ArrowRight size={18} weight="bold" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-8 py-4 text-base font-semibold text-[var(--color-headline)] transition-colors hover:border-[var(--color-headline)]/40"
            >
              Read the docs
            </Link>
          </div>
        </GsapReveal>
      </div>
    </section>
  );
}
