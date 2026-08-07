import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { GAPS } from "@/lib/content";
import { GsapReveal } from "./gsap-reveal";

export function GapSection() {
  return (
    <section id="algorand" className="relative py-24 lg:py-32">
      {/* Subtle ambient radial glow anchoring the section */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 82, 40, 0.25) 0%, rgba(10, 9, 8, 0) 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <GsapReveal className="flex flex-col items-start gap-6 border-b border-white/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-xl font-display text-3xl font-medium leading-tight text-[var(--color-headline)] md:text-4xl">
            Built for what Algorand doesn&apos;t have yet.
          </h2>
          <div className="flex shrink-0 items-center gap-5">
            <img
              src="https://cdn.simpleicons.org/algorand/F5F3F0"
              alt="Algorand"
              className="h-8 w-auto opacity-90"
            />
            <Link
              href="/algorand"
              className="veldar-link-arrow shrink-0 text-sm font-medium"
            >
              <span>Read the technical story</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </GsapReveal>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {GAPS.map(({ id, icon: Icon, title, teaser }, i) => (
            <GsapReveal key={id} delay={i * 0.1}>
              <div className="veldar-card-outline flex h-full flex-col gap-4 p-8">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#ff5228]/30 bg-[#ff5228]/15 text-[#ff5228]">
                  <Icon size={20} weight="duotone" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-headline)]">{title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-body)]">{teaser}</p>
              </div>
            </GsapReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
