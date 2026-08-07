import type { Metadata } from "next";
import { Check, X } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Reveal } from "@/components/reveal";
import { COMPARISON_ROWS, PRICING_FAQ, TIERS, tierCapLabel, tierCutLabel } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pricing — Veldar",
  description: "Free, Pro, and ProMax: how much autonomy you give your agent and what it costs.",
};

function cellIcon(value: string) {
  if (value === "Yes") return <Check size={16} weight="bold" className="text-[var(--color-cta)]" />;
  if (value === "No") return <X size={16} weight="bold" className="text-[var(--color-footer-dim)]" />;
  return <span className="font-mono text-sm text-[var(--color-body)]">{value}</span>;
}

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="pt-16 pb-16 lg:pb-20">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.05] tracking-tight text-[var(--color-headline)] md:text-5xl">
              How much autonomy you give it is up to you.
            </h1>
            <p className="mx-auto mt-6 max-w-[52ch] text-lg leading-relaxed text-[var(--color-body)]">
              Every tier enforces its cap server-side. Upgrading changes how often Veldar asks
              before it spends, not whether it can be trusted.
            </p>
          </div>
        </section>

        <section className="pb-24 lg:pb-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {TIERS.map((tier, i) => (
                <Reveal key={tier.tier} delay={i * 0.1}>
                  <div
                    className={
                      tier.featured
                        ? "flex h-full flex-col rounded-2xl p-8 shadow-[0_24px_60px_rgb(255_82_40_/_0.18)] lg:-translate-y-3"
                        : "flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8"
                    }
                    style={
                      tier.featured
                        ? { background: "linear-gradient(160deg, var(--color-card-from), var(--color-card-to))" }
                        : undefined
                    }
                  >
                    <h2 className={tier.featured ? "text-lg font-semibold text-white" : "text-lg font-semibold text-[var(--color-headline)]"}>
                      {tier.name}
                    </h2>
                    <p className={tier.featured ? "mt-2 text-3xl font-semibold text-white" : "mt-2 text-3xl font-semibold text-[var(--color-headline)]"}>
                      {tier.price}
                    </p>
                    <p className={tier.featured ? "mt-1 text-sm text-white/85" : "mt-1 text-sm text-[var(--color-muted)]"}>
                      {tierCapLabel(tier.tier)} &middot; {tierCutLabel(tier.tier)}
                    </p>

                    <ul className="mt-6 flex flex-1 flex-col gap-3">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check
                            size={16}
                            weight="bold"
                            className={tier.featured ? "mt-0.5 shrink-0 text-white" : "mt-0.5 shrink-0 text-[var(--color-cta)]"}
                          />
                          <span className={tier.featured ? "text-white/90" : "text-[var(--color-body)]"}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/dashboard"
                      className={
                        tier.featured
                          ? "mt-8 rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-[var(--color-cta)] transition-transform active:scale-[0.98]"
                          : "mt-8 rounded-full border border-[var(--color-border)] px-6 py-3 text-center text-sm font-semibold text-[var(--color-headline)] transition-colors hover:border-[var(--color-headline)]/40"
                      }
                    >
                      Choose {tier.name}
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-24 lg:pb-32">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-headline)]">
              Compare plans
            </h2>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--color-border)]">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                    <th className="px-6 py-4 font-medium text-[var(--color-muted)]">Feature</th>
                    <th className="px-6 py-4 font-medium text-[var(--color-headline)]">Free</th>
                    <th className="px-6 py-4 font-medium text-[var(--color-headline)]">Pro</th>
                    <th className="px-6 py-4 font-medium text-[var(--color-headline)]">ProMax</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-[var(--color-border)] last:border-b-0">
                      <td className="px-6 py-4 text-[var(--color-body)]">{row.label}</td>
                      <td className="px-6 py-4">{cellIcon(row.free)}</td>
                      <td className="px-6 py-4">{cellIcon(row.pro)}</td>
                      <td className="px-6 py-4">{cellIcon(row.promax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="pb-24 lg:pb-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-headline)]">
              Questions
            </h2>
            <div className="mt-8 flex flex-col divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)]">
              {PRICING_FAQ.map((item) => (
                <details key={item.question} className="group px-6 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-[var(--color-headline)]">
                    {item.question}
                    <span className="ml-4 shrink-0 text-[var(--color-muted)] transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-body)]">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
