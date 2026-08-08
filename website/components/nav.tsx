"use client";

import { CaretDown, Compass, Gear, List, SignOut, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import GlassSurface from "./GlassSurface";

import { LogoLink } from "./logo";
import { WalletDropdown } from "./wallet-dropdown";
import SpecularButton from "./SpecularButton";

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

  const label = user.displayName || user.email?.split("@")[0] || "Account";
  const initial = (label[0] || "A").toUpperCase();

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    router.push("/");
  }

  return (
    <div ref={ref} className="relative z-[99999] flex items-center gap-3 font-poppins">
      <WalletDropdown />

      <SpecularButton
        onClick={() => router.push("/dashboard")}
        size="sm"
        radius={9999}
        tint="#ff5228"
        tintOpacity={0.15}
        lineColor="#ff7a59"
        baseColor="#ff5228"
        autoAnimate={true}
      >
        Dashboard
      </SpecularButton>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-1 pl-1.5 pr-2.5 transition-colors hover:border-[var(--color-headline)]/40"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[#ff4a1f] to-[#ff6b2e] text-xs font-bold text-white border border-white/20 shadow-[0_0_10px_rgba(255,82,40,0.4)]">
          {initial}
        </span>
        <CaretDown size={14} className={`text-[var(--color-muted)] transition-transform duration-200 ${open ? "rotate-180 text-[var(--color-headline)]" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[99999] mt-3 w-64 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[#12100e] p-2 shadow-2xl backdrop-blur-2xl"
        >
          <div className="border-b border-[var(--color-border)] px-3.5 py-3">
            <p className="truncate text-xs font-bold text-[var(--color-headline)]">{label}</p>
            {user.email && (
              <p className="truncate font-mono text-[10px] text-[var(--color-muted)] mt-0.5">{user.email}</p>
            )}
          </div>
          <div className="py-1.5 flex flex-col gap-1">
            <Link
              href="/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--color-headline)] transition-colors hover:bg-white/10"
            >
              <Compass size={15} className="text-[#ff5228]" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/dashboard/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--color-body)] transition-colors hover:bg-white/10 hover:text-[var(--color-headline)]"
            >
              <Gear size={15} className="text-slate-400" />
              <span>Settings</span>
            </Link>
            <button
              role="menuitem"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300"
            >
              <SignOut size={15} />
              <span>Sign out</span>
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
    <header className="sticky top-4 z-[99990] w-[calc(100%-2rem)] max-w-7xl mx-auto px-2 sm:px-4">
      <GlassSurface
        width="100%"
        height={68}
        borderRadius={9999}
        backgroundOpacity={0.3}
        saturation={1.4}
        blur={16}
        distortionScale={0}
        displace={0}
        className="glass-surface--nav border border-white/15 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5),_0_0_15px_rgba(255,255,255,0.05)] relative z-[100]"
      >
      <div className="w-full mx-auto flex h-full items-center justify-between px-6 lg:px-8">
        <LogoLink className="mr-6 lg:mr-10" />

        <nav className="hidden items-center gap-2 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-[var(--color-headline)] shadow-inner transition-all"
                  : "rounded-full px-4 py-2 text-sm text-[var(--color-body)] transition-all hover:bg-white/5 hover:text-[var(--color-headline)]"
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
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--color-body)] transition-colors hover:text-[var(--color-headline)]"
              >
                Sign in
              </Link>
              <SpecularButton
                onClick={() => router.push("/signup")}
                size="sm"
                radius={9999}
                tint="#ff5228"
                tintOpacity={0.18}
                blur={0}
                textColor="#ffffff"
                lineColor="#ff9e7a"
                baseColor="#ff5228"
                intensity={1.2}
                shineSize={12}
                shineFade={45}
                thickness={1.5}
                speed={0.35}
                followMouse
                proximity={250}
                autoAnimate={false}
              >
                Sign up
              </SpecularButton>
            </div>
          )}
          {authError && (
            <div className="absolute right-0 top-full z-[9999] mt-2 w-64 rounded-2xl border border-red-500/30 bg-[var(--color-bg-elevated)] p-3 text-xs text-red-300 shadow-lg">
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
        <div className="mt-3 overflow-hidden rounded-3xl border border-white/15 bg-[#12100e]/95 p-6 backdrop-blur-2xl shadow-2xl lg:hidden">
          <nav className="flex flex-col gap-4">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-[var(--color-body)] hover:text-[var(--color-headline)]"
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
                <SpecularButton
                  onClick={() => { setOpen(false); router.push("/signup"); }}
                  size="sm"
                  radius={9999}
                  tint="#ff5228"
                  tintOpacity={0.18}
                  blur={0}
                  textColor="#ffffff"
                  lineColor="#ff9e7a"
                  baseColor="#ff5228"
                  intensity={1.2}
                  shineSize={12}
                  shineFade={45}
                  thickness={1.5}
                  speed={0.35}
                  followMouse
                  proximity={250}
                  autoAnimate={false}
                >
                  Sign up
                </SpecularButton>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
