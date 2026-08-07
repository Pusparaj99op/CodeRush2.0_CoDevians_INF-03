"use client";

import { CaretDown, List, SignOut, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { LogoLink } from "./logo";
import { WalletDropdown } from "./wallet-dropdown";

const LINKS = [
  { href: "/product", label: "Product" },
  { href: "/travel-planner", label: "Travel Planner" },
  { href: "/algorand", label: "Algorand" },
  { href: "/stellar", label: "Stellar" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

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
      <WalletDropdown />

      <Link
        href="/dashboard"
        className="rounded-full bg-[#1A1916] px-5 py-2 text-xs font-semibold text-[#F5F3F0] transition-transform duration-200 hover:bg-[#383530] active:scale-[0.98]"
      >
        Dashboard
      </Link>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-1.5 rounded-full border border-[#D8D4CE] bg-[#EDEAE5] py-1 pl-1.5 pr-2.5 transition-colors hover:border-[#1A1916]"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#C9A84C] text-xs font-bold text-[#1A1916] shadow-sm">
          {initial}
        </span>
        <CaretDown size={14} className={`text-[#6B6660] transition-transform duration-200 ${open ? "rotate-180 text-[#1A1916]" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[9999] mt-3 w-60 overflow-hidden rounded-2xl border border-[#D8D4CE] bg-[#FAFAF8] p-1.5 shadow-2xl backdrop-blur-xl"
        >
          <div className="border-b border-[#D8D4CE] px-4 py-3">
            <p className="truncate text-xs font-semibold text-[#1A1916]">{label}</p>
            {user.email && user.displayName && (
              <p className="truncate text-[11px] text-[#6B6660]">{user.email}</p>
            )}
          </div>
          <div className="py-1">
            <Link
              href="/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3.5 py-2 text-xs text-[#1A1916] transition-colors hover:bg-[#EDEAE5]"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3.5 py-2 text-xs text-[#1A1916] transition-colors hover:bg-[#EDEAE5]"
            >
              Settings
            </Link>
            <button
              role="menuitem"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-left text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <SignOut size={14} />
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
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut, authError } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-[100] w-full transition-all duration-300 ${scrolled ? "bg-[#F5F3F0]/90 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4"}`}>
      <div className="w-full mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-8 border-b border-[#D8D4CE]/60">
        <LogoLink className="mr-6 lg:mr-10" />

        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "text-xs font-semibold uppercase tracking-wider text-[#1A1916] border-b-2 border-[#C9A84C] pb-0.5"
                  : "text-xs font-medium uppercase tracking-wider text-[#6B6660] transition-colors hover:text-[#1A1916]"
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
            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className="rounded-full px-4 py-2 text-xs font-medium text-[#1A1916] transition-colors hover:text-[#C9A84C]"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[#1A1916] px-5 py-2 text-xs font-semibold text-[#F5F3F0] transition-transform duration-200 hover:bg-[#383530] active:scale-[0.98]"
              >
                Sign up
              </Link>
            </div>
          )}
          {authError && (
            <div className="absolute right-0 top-full z-[9999] mt-2 w-64 rounded-xl border border-red-500/30 bg-[#FAFAF8] p-3 text-xs text-red-600 shadow-lg">
              {authError}
            </div>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center text-[#1A1916] lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-b border-[#D8D4CE] bg-[#F5F3F0] px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-4">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-xs font-semibold uppercase tracking-wider text-[#1A1916]"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-xs font-bold uppercase tracking-wider text-[#C9A84C]"
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    setOpen(false);
                    await signOut();
                    router.push("/");
                  }}
                  className="text-left text-xs font-semibold uppercase tracking-wider text-red-600"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  onClick={() => setOpen(false)}
                  className="text-xs font-semibold uppercase tracking-wider text-[#1A1916]"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="text-xs font-bold uppercase tracking-wider text-[#C9A84C]"
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
