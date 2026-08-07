import Link from "next/link";
import { GAPS } from "@/lib/content";
import { GsapReveal } from "./gsap-reveal";

export function GapSection() {
  return (
    <section id="algorand" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <GsapReveal className="flex flex-col items-start gap-6 border-b border-[var(--color-border)] pb-10 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-xl font-[family-name:var(--font-display)] text-3xl font-medium leading-tight text-[var(--color-headline)] md:text-4xl">
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
              className="text-sm font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
            >
              Read the technical story
            </Link>
          </div>
        </GsapReveal>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {GAPS.map(({ id, icon: Icon, title, teaser }, i) => (
            <GsapReveal key={id} delay={i * 0.1}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-7">
                <Icon size={26} weight="duotone" className="text-[var(--color-cta)]" />
                <h3 className="text-base font-semibold text-[var(--color-headline)]">{title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-body)]">{teaser}</p>
              </div>
            </GsapReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
