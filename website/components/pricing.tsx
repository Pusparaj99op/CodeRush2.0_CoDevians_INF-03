import { ArrowRight, Check, Star } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { TIERS, tierCapLabel, tierCutLabel } from "@/lib/content";
import { Reveal } from "./reveal";

export function Pricing() {
  return (
    <section id="pricing" className="relative z-10 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
              Plans
            </span>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-medium leading-tight text-[var(--color-headline)] md:text-4xl">
              How much autonomy you give it is up to you.
            </h2>
          </div>
          <Link
            href="/pricing"
            className="veldar-link-arrow shrink-0 text-sm font-medium"
          >
            <span>Compare all plans</span>
            <ArrowRight size={16} />
          </Link>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.tier} delay={i * 0.1}>
              <div
                className={`relative flex h-full flex-col justify-between ${
                  tier.featured ? "veldar-card-featured" : "veldar-card-outline"
                } p-8`}
              >
                {tier.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="veldar-badge-accent shadow-md text-[11px] font-semibold">
                      <Star size={12} weight="fill" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-headline)]">
                    {tier.name}
                  </h3>
                  <p className="mt-2 text-3xl font-bold font-display text-[var(--color-headline)]">
                    {tier.price}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[var(--color-muted)]">
                    {tierCapLabel(tier.tier)} &middot; {tierCutLabel(tier.tier)}
                  </p>

                  <ul className="mt-6 flex flex-col gap-3.5 border-t border-white/10 pt-6">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check
                          size={16}
                          weight="bold"
                          className="mt-0.5 shrink-0 text-[#ff5228]"
                        />
                        <span className="text-[var(--color-body)] leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    href="/dashboard"
                    className={`w-full py-3.5 text-sm font-semibold text-center ${
                      tier.featured
                        ? "btn-spectacular"
                        : "btn-secondary"
                    }`}
                  >
                    Choose {tier.name}
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
