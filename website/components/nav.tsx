"use client";

import { List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import GlassSurface from "./GlassSurface";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#algorand", label: "Algorand" },
  { href: "#pricing", label: "Pricing" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const { user, signInWithGoogle, configured } = useAuth();

  return (
    <header className="sticky top-0 z-50">
      <GlassSurface
        width="100%"
        height={64}
        borderRadius={0}
        backgroundOpacity={0.16}
        saturation={1.3}
        blur={14}
        distortionScale={-60}
        className="glass-surface--nav border-b border-[var(--color-border)]"
      >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-headline)]">
          Veldar
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--color-body)] transition-colors hover:text-[var(--color-headline)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
            >
              Dashboard
            </Link>
          ) : (
            <button
              onClick={signInWithGoogle}
              disabled={!configured}
              className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-accent-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sign in
            </button>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center text-[var(--color-headline)] lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </div>
      </GlassSurface>

      {open && (
        <div className="border-b border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-4">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-[var(--color-body)]"
              >
                {link.label}
              </a>
            ))}
            {user ? (
              <Link href="/dashboard" className="text-sm font-semibold text-[var(--color-accent)]">
                Dashboard
              </Link>
            ) : (
              <button
                onClick={signInWithGoogle}
                disabled={!configured}
                className="text-left text-sm font-semibold text-[var(--color-accent)] disabled:opacity-50"
              >
                Sign in
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
