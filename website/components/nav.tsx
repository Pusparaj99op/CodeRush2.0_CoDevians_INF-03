"use client";

import { CaretDown, List, SignOut, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import GlassSurface from "./GlassSurface";

const LINKS = [
  { href: "/product", label: "Product" },
  { href: "/algorand", label: "Algorand" },
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
    <div ref={ref} className="relative flex items-center gap-3">
      <Link
        href="/dashboard"
        className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
      >
        Dashboard
      </Link>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] py-1 pl-1 pr-2 transition-colors hover:border-[var(--color-headline)]/30"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-bg-elevated)] text-xs font-semibold text-[var(--color-headline)]">
          {initial}
        </span>
        <CaretDown size={12} className="text-[var(--color-muted)]" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-xl"
        >
          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <p className="truncate text-sm font-medium text-[var(--color-headline)]">{label}</p>
            {user.email && user.displayName && (
              <p className="truncate text-xs text-[var(--color-muted)]">{user.email}</p>
            )}
          </div>
          <Link
            href="/dashboard/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-[var(--color-body)] transition-colors hover:bg-white/5 hover:text-[var(--color-headline)]"
          >
            Settings
          </Link>
          <button
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--color-body)] transition-colors hover:bg-white/5 hover:text-[var(--color-headline)]"
          >
            <SignOut size={15} />
            Sign out
          </button>
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

        <div className="relative hidden lg:block">
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
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-red-500/30 bg-[var(--color-bg-elevated)] p-3 text-xs text-red-300 shadow-lg">
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
