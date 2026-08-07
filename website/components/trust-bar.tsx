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
    <section className="border-y border-white/10 bg-white/[0.015] py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 md:divide-x md:divide-white/10">
          {ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-1.5 p-3 transition-colors hover:bg-white/[0.02] rounded-xl md:px-6">
              <div className="flex items-center gap-2.5">
                <Icon size={20} weight="duotone" className="text-[#ff5228] shrink-0" />
                <span className="text-sm font-semibold text-[var(--color-headline)]">{title}</span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--color-muted)] pl-7">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
