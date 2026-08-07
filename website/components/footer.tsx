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
      { href: "/contact", label: "Contact" },
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
    <footer className={`border-t border-[var(--color-border)] py-16 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <LogoLink size="md" />
            <p className="mt-2 max-w-[24ch] text-sm text-[var(--color-footer-dim)]">
              Built at YCCE Nagpur. Settlement runs on Algorand TestNet.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-muted)]">
                {col.heading}
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-footer-dim)] transition-colors hover:text-[var(--color-headline)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-footer-dim)]">
          &copy; 2026 Veldar. All payments are simulated on TestNet.
        </p>
      </div>
    </footer>
  );
}
