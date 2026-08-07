"use client";

import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function VeldarLogo({ size = "md", showText = true, className = "" }: LogoProps) {
  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-11 w-11",
  };

  const textSizes = {
    sm: "text-base tracking-tight",
    md: "text-xl tracking-tight",
    lg: "text-2xl tracking-tight",
  };

  return (
    <div className={`group flex items-center gap-2.5 ${className}`}>
      {/* Styled Currency-V Icon Symbol */}
      <div className={`relative shrink-0 ${iconSizes[size]} transition-transform duration-300 group-hover:scale-105`}>
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 opacity-40 blur-sm transition-opacity duration-300 group-hover:opacity-80" />
        <svg
          viewBox="0 0 600 600"
          className="relative h-full w-full rounded-xl bg-[#0a0908] p-1 border border-red-500/30 shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Currency-style V mark */}
          <g fill="none" stroke="#FF3B5C" strokeWidth="36" strokeLinecap="round" strokeLinejoin="miter">
            <path d="M160 140 L300 440 L440 140" />
          </g>
          {/* Double horizontal currency strike bars */}
          <g stroke="#FFFFFF" strokeWidth="26" strokeLinecap="round">
            <line x1="130" y1="220" x2="470" y2="220" />
            <line x1="160" y1="290" x2="440" y2="290" />
          </g>
        </svg>
      </div>

      {/* Wordmark */}
      {showText && (
        <span
          className={`font-[family-name:var(--font-display)] font-extrabold text-[var(--color-headline)] ${textSizes[size]} bg-gradient-to-r from-white via-stone-100 to-rose-200 bg-clip-text text-transparent`}
        >
          Veldar
        </span>
      )}
    </div>
  );
}

export function LogoLink({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`}>
      <VeldarLogo size={size} />
    </Link>
  );
}
