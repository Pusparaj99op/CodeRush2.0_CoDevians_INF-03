import { Check } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./reveal";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    cap: "0.5 ALGO cap per step",
    note: "Small cut per transaction",
    features: ["Every payment needs approval", "Full trace and history", "Cancel anytime"],
    featured: false,
  },
  {
    name: "Pro",
    price: "$12/mo",
    cap: "5 ALGO cap per step",
    note: "Reduced cut per transaction",
    features: ["Approval only above cap", "New-provider approvals", "Priority workflow queue"],
    featured: true,
  },
  {
    name: "ProMax",
    price: "$39/mo",
    cap: "No per-step cap",
    note: "No platform cut",
    features: ["Approval only on policy exceptions", "Unlimited concurrent workflows", "Flat monthly fee"],
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted)]">
            Plans
          </span>
          <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-3xl font-medium leading-tight text-[var(--color-headline)] md:text-4xl">
            How much autonomy you give it is up to you.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.1}>
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
                <h3 className={tier.featured ? "text-lg font-semibold text-white" : "text-lg font-semibold text-[var(--color-headline)]"}>
                  {tier.name}
                </h3>
                <p className={tier.featured ? "mt-2 text-3xl font-semibold text-white" : "mt-2 text-3xl font-semibold text-[var(--color-headline)]"}>
                  {tier.price}
                </p>
                <p className={tier.featured ? "mt-1 text-sm text-white/85" : "mt-1 text-sm text-[var(--color-muted)]"}>
                  {tier.cap} &middot; {tier.note}
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

                <button
                  className={
                    tier.featured
                      ? "mt-8 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--color-cta)] transition-transform active:scale-[0.98]"
                      : "mt-8 rounded-full border border-[var(--color-border)] px-6 py-3 text-sm font-semibold text-[var(--color-headline)] transition-colors hover:border-[var(--color-headline)]/40"
                  }
                >
                  Choose {tier.name}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
