import Link from "next/link";
import { LogoLink } from "./logo";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { href: "/product", label: "Platform" },
      { href: "/algorand", label: "Algorand" },
      { href: "/pricing", label: "Pricing" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/docs", label: "Docs" },
      { href: "mailto:vikramadityakambani@gmail.com", label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/terms", label: "Terms" },
    ],
  },
];

export function Footer({ className = "" }: { className?: string }) {
  return (
    <footer className={`border-t border-white/10 bg-black/40 py-16 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-2">
            <LogoLink size="md" />
            <p className="mt-3 max-w-[28ch] text-xs leading-relaxed text-[var(--color-footer-dim)]">
              Built at YCCE Nagpur. Settlement runs on Algorand TestNet with x402 micropayment proofs.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                {col.heading}
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-[var(--color-footer-dim)] transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-[var(--color-footer-dim)]">
          <p>&copy; 2026 Veldar Inc. All payments are simulated on Algorand TestNet.</p>
          <span className="font-mono text-[11px] text-[#ff5228]">x402 Facilitator Active</span>
        </div>
      </div>
    </footer>
  );
}
