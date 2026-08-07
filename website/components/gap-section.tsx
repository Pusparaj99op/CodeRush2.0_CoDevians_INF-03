import { CreditCard, GitBranch, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./reveal";

const GAPS = [
  {
    icon: CreditCard,
    title: "No native pay-per-call HTTP payments",
    body: "Algorand has no standard x402 facilitator. Veldar built one, so any Algorand contract can serve pay-per-call requests.",
  },
  {
    icon: GitBranch,
    title: "No orchestration layer for agents",
    body: "Fast contracts alone don't make a workflow trustworthy. Veldar's orchestrator adds budgets, conditions, and approval gates on top.",
  },
  {
    icon: UsersThree,
    title: "No consumer-facing agent UX",
    body: "algosdk and AlgoKit are built for developers. Veldar is the plain-language layer a non-technical user can actually trust.",
  },
];

export function GapSection() {
  return (
    <section id="algorand" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="flex flex-col items-start gap-6 border-b border-[var(--color-border)] pb-10 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-xl font-[family-name:var(--font-display)] text-3xl font-medium leading-tight text-[var(--color-headline)] md:text-4xl">
            Built for what Algorand doesn&apos;t have yet.
          </h2>
          <img
            src="https://cdn.simpleicons.org/algorand/F5F3F0"
            alt="Algorand"
            className="h-8 w-auto shrink-0 opacity-90"
          />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {GAPS.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-7">
                <Icon size={26} weight="duotone" className="text-[var(--color-cta)]" />
                <h3 className="text-base font-semibold text-[var(--color-headline)]">{title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-body)]">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
