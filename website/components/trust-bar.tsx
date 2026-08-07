import { CheckCircle, CreditCard, LockKey, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

const ITEMS = [
  {
    icon: ShieldCheck,
    title: "Algorand TestNet",
    desc: "Low-fee, fast finality settlement layer",
  },
  {
    icon: CheckCircle,
    title: "algosdk Verified",
    desc: "Cryptographically verified on-chain transactions",
  },
  {
    icon: CreditCard,
    title: "x402 Protocol",
    desc: "Native HTTP pay-per-call payments",
  },
  {
    icon: LockKey,
    title: "Server-Side Policy",
    desc: "Strict budget caps enforced before spend",
  },
];

export function TrustBar() {
  return (
    <section className="border-y border-[var(--color-border)] bg-white/[0.015] py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-2 rounded-xl p-3 transition-colors hover:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Icon size={20} weight="duotone" className="text-[var(--color-cta)]" />
                <span className="text-sm font-semibold text-[var(--color-headline)]">{title}</span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--color-muted)]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
