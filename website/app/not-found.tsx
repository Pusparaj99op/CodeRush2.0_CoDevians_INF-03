import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center px-6">
      <div className="max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-10 text-center">
        <p className="font-[family-name:var(--font-display)] text-5xl font-medium text-[var(--color-headline)]">
          404
        </p>
        <p className="mt-3 text-sm text-[var(--color-body)]">
          This page doesn&apos;t exist, or the workflow it pointed to was never created.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-cta)] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--color-cta-hover)] active:scale-[0.98]"
        >
          <ArrowLeft size={16} weight="bold" />
          Back home
        </Link>
      </div>
    </main>
  );
}
