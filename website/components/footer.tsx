"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoLink } from "./logo";
import { ArrowRight, Check } from "@phosphor-icons/react";

const COLUMNS = [
  {
    heading: "Navigation",
    links: [
      { href: "/product", label: "How it works" },
      { href: "/algorand", label: "Algorand" },
      { href: "/stellar", label: "Stellar" },
      { href: "/travel-planner", label: "Travel Planner" },
      { href: "/pricing", label: "Pricing" },
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
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  }

  return (
    <footer className={`border-t border-[#D8D4CE] bg-[#EDEAE5] py-20 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Col 1 & 2: Brand & Newsletter */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <LogoLink size="md" />
            <p className="max-w-[32ch] text-sm font-light text-[#6B6660] leading-relaxed">
              Built at YCCE Nagpur. Settlement runs on Algorand, Stellar & Sepolia TestNets.
            </p>

            {/* Email Subscribe */}
            <form onSubmit={handleSubscribe} className="mt-2 flex flex-col gap-2 max-w-sm">
              <label htmlFor="footer-email" className="text-xs font-mono text-[#1A1916] uppercase tracking-wider">
                Subscribe for Updates
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="footer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-full border border-[#D8D4CE] bg-[#FAFAF8] px-4 py-2.5 text-xs text-[#1A1916] placeholder:text-[#6B6660] focus:border-[#1A1916] focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#1A1916] px-4 py-2.5 text-xs font-semibold text-[#F5F3F0] hover:bg-[#383530]"
                >
                  {subscribed ? (
                    <>
                      <Check size={14} className="text-[#2E6B4F]" />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <span>Join</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Col 3, 4, 5: Sitemap columns */}
          {COLUMNS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-4">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#C9A84C]">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-light text-[#6B6660] transition-colors hover:text-[#1A1916]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-[#D8D4CE] pt-8 text-xs font-mono text-[#6B6660]">
          <p>© 2026 Veldar. All payments are simulated on TestNet.</p>
          <a href="#" className="hover:text-[#1A1916]">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
