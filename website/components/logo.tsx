"use client";

import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function VeldarLogo({ size = "md", showText = true, className = "" }: LogoProps) {
  const iconContainerSizes = {
    sm: "h-8 w-8 p-1",
    md: "h-10 w-10 p-1.5",
    lg: "h-12 w-12 p-2",
  };

  const textSizes = {
    sm: "text-base tracking-tight",
    md: "text-xl lg:text-2xl tracking-tight",
    lg: "text-2xl lg:text-3xl tracking-tight",
  };

  return (
    <div className={`group inline-flex items-center gap-4 ${className}`}>
      {/* Premium Circular Container with Ambient Red Glow & Glassmorphism */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Soft Red Ambient Glow */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-red-600/40 via-rose-500/30 to-amber-500/20 opacity-70 blur-md transition-all duration-300 group-hover:opacity-100 group-hover:scale-110" />

        {/* Circular Glassmorphic Frame */}
        <div className={`relative flex items-center justify-center rounded-full border border-white/20 bg-white/[0.08] shadow-xl shadow-red-950/30 backdrop-blur-xl transition-all duration-300 group-hover:border-red-500/50 group-hover:bg-white/[0.14] group-hover:scale-[1.03] ${iconContainerSizes[size]}`}>
          {/* Faint radial gradient depth */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/30 via-black/60 to-black/80 pointer-events-none" />

          {/* Original Currency-V Icon Symbol - Unchanged */}
          <svg
            viewBox="0 0 600 600"
            className="relative h-full w-full rounded-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Currency-style V mark */}
            <g fill="none" stroke="#FF3B5C" strokeWidth="38" strokeLinecap="round" strokeLinejoin="miter">
              <path d="M160 140 L300 440 L440 140" />
            </g>
            {/* Double horizontal currency strike bars */}
            <g stroke="#FFFFFF" strokeWidth="28" strokeLinecap="round">
              <line x1="130" y1="220" x2="470" y2="220" />
              <line x1="160" y1="290" x2="440" y2="290" />
            </g>
          </svg>
        </div>
      </div>

      {/* Modern Crisp White Geometric Typography for "Veldar" */}
      {showText && (
        <span
          className={`font-[family-name:var(--font-display)] font-extrabold text-white select-none ${textSizes[size]} bg-gradient-to-r from-white via-stone-50 to-stone-200 bg-clip-text text-transparent drop-shadow-sm transition-opacity duration-200 group-hover:opacity-95`}
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
