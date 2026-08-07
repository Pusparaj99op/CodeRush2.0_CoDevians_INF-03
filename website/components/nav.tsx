"use client";

import { CaretDown, List, SignOut, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import GlassSurface from "./GlassSurface";

import { LogoLink } from "./logo";
import { MultiWalletBar } from "./multi-wallet-bar";

const LINKS = [
  { href: "/product", label: "Product" },
  { href: "/travel-planner", label: "Travel Planner" },
  { href: "/algorand", label: "Algorand" },
  { href: "/stellar", label: "Stellar" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

/** Account dropdown: the only place other than Settings you can sign out. */
function AccountMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const label = user.displayName ?? user.email ?? "Account";
  const initial = label.charAt(0).toUpperCase();

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    router.push("/");
  }

  return (
    <div ref={ref} className="relative z-[100] flex items-center gap-3">
      <MultiWalletBar />

      <Link
        href="/dashboard"
        className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
      >
        Dashboard
      </Link>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-1 pl-1.5 pr-2.5 transition-colors hover:border-[var(--color-headline)]/40"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white shadow-sm">
          {initial}
        </span>
        <CaretDown size={14} className={`text-[var(--color-muted)] transition-transform duration-200 ${open ? "rotate-180 text-[var(--color-headline)]" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[9999] mt-3 w-60 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[#12100e] p-1.5 shadow-2xl backdrop-blur-xl"
        >
          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <p className="truncate text-sm font-semibold text-[var(--color-headline)]">{label}</p>
            {user.email && user.displayName && (
              <p className="truncate text-xs text-[var(--color-muted)]">{user.email}</p>
            )}
          </div>
          <div className="py-1">
            <Link
              href="/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-body)] transition-colors hover:bg-white/10 hover:text-[var(--color-headline)]"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-body)] transition-colors hover:bg-white/10 hover:text-[var(--color-headline)]"
            >
              Settings
            </Link>
            <button
              role="menuitem"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300"
            >
              <SignOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const { user, signOut, authError } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-[100] w-full">
      <GlassSurface
        width="100%"
        height={64}
        borderRadius={0}
        backgroundOpacity={0.16}
        saturation={1.3}
        blur={14}
        distortionScale={-60}
        className="glass-surface--nav border-b border-[var(--color-border)] relative z-[100]"
      >
      <div className="w-full mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <LogoLink className="mr-6 lg:mr-10" />

        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "text-sm font-medium text-[var(--color-headline)]"
                  : "text-sm text-[var(--color-body)] transition-colors hover:text-[var(--color-headline)]"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="relative z-[100] hidden lg:block">
          {user ? (
            <AccountMenu />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/signin"
                className="rounded-full px-4 py-2.5 text-sm font-medium text-[var(--color-body)] transition-colors hover:text-[var(--color-headline)]"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
              >
                Sign up
              </Link>
            </div>
          )}
          {authError && (
            <div className="absolute right-0 top-full z-[9999] mt-2 w-64 rounded-xl border border-red-500/30 bg-[var(--color-bg-elevated)] p-3 text-xs text-red-300 shadow-lg">
              {authError}
            </div>
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
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-[var(--color-body)]"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold text-[var(--color-accent)]"
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    setOpen(false);
                    await signOut();
                    router.push("/");
                  }}
                  className="text-left text-sm font-semibold text-[var(--color-body)]"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  onClick={() => setOpen(false)}
                  className="text-sm text-[var(--color-body)]"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold text-[var(--color-accent)]"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
