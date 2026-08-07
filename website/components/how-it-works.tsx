import { ChatCircleText, HandCoins, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { StickyStack } from "./sticky-stack";

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
        <h2 className="max-w-xl font-[family-name:var(--font-display)] text-3xl font-medium leading-tight text-[var(--color-headline)] md:text-4xl">
          Three steps, one visible trace.
        </h2>
      </div>

      <div className="mx-auto mt-12 max-w-4xl px-6 lg:px-8">
        <StickyStack
          cards={STEPS.map(({ icon: Icon, tone, title, body }) => (
            <div
              key={title}
              className={
                tone === "gradient"
                  ? "flex h-full flex-col justify-between rounded-3xl p-10 shadow-[0_30px_80px_rgb(255_82_40_/_0.2)]"
                  : "flex h-full flex-col justify-between rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-10"
              }
              style={
                tone === "gradient"
                  ? { background: "linear-gradient(160deg, var(--color-card-from), var(--color-card-to))" }
                  : undefined
              }
            >
              <Icon
                size={32}
                weight="duotone"
                className={tone === "gradient" ? "text-white" : "text-[var(--color-cta)]"}
              />
              <div className="mt-10">
                <h3
                  className={
                    tone === "gradient"
                      ? "text-2xl font-semibold text-white md:text-3xl"
                      : "text-2xl font-semibold text-[var(--color-headline)] md:text-3xl"
                  }
                >
                  {title}
                </h3>
                <p
                  className={
                    tone === "gradient"
                      ? "mt-4 max-w-md text-base leading-relaxed text-white/85"
                      : "mt-4 max-w-md text-base leading-relaxed text-[var(--color-body)]"
                  }
                >
                  {body}
                </p>
              </div>
            </div>
          ))}
        />
      </div>
    </section>
  );
}
