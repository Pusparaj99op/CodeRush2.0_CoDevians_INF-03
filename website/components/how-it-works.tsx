import { ChatCircleText, HandCoins, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Reveal } from "./reveal";

const STEPS = [
  {
    icon: ChatCircleText,
    tone: "elevated",
    title: "Say what you need",
    body: "A plain-language goal and a budget. Veldar compiles it into a step graph, with conditions for what can be skipped.",
  },
  {
    icon: HandCoins,
    tone: "gradient",
    title: "It shops and pays",
    body: "Providers quote in ALGO. Veldar pays through the Algorand x402 facilitator as each step clears, never before.",
  },
  {
    icon: ShieldCheck,
    tone: "elevated",
    title: "You stay in control",
    body: "Anything above your cap pauses for approval. Cancel any time and see exactly what was and wasn't purchased.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-xl font-[family-name:var(--font-display)] text-3xl font-medium leading-tight text-[var(--color-headline)] md:text-4xl">
            Three steps, one visible trace.
          </h2>
          <Link
            href="/product"
            className="shrink-0 text-sm font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
          >
            See the full workflow
          </Link>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, tone, title, body }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <div
                className={
                  tone === "gradient"
                    ? "flex h-full flex-col justify-between rounded-2xl p-8"
                    : "flex h-full flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8"
                }
                style={
                  tone === "gradient"
                    ? { background: "linear-gradient(160deg, var(--color-card-from), var(--color-card-to))" }
                    : undefined
                }
              >
                <Icon size={28} weight="duotone" className={tone === "gradient" ? "text-white" : "text-[var(--color-cta)]"} />
                <div className="mt-8">
                  <h3 className={tone === "gradient" ? "text-xl font-semibold text-white" : "text-xl font-semibold text-[var(--color-headline)]"}>
                    {title}
                  </h3>
                  <p className={tone === "gradient" ? "mt-2 text-sm leading-relaxed text-white/85" : "mt-2 text-sm leading-relaxed text-[var(--color-body)]"}>
                    {body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
