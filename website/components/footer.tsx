export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <p className="font-[family-name:var(--font-display)] text-base font-medium text-[var(--color-headline)]">
            Veldar
          </p>
          <p className="mt-1 text-sm text-[var(--color-footer-dim)]">
            Built at YCCE Nagpur. Settlement runs on Algorand TestNet.
          </p>
        </div>
        <p className="text-sm text-[var(--color-footer-dim)]">
          &copy; 2026 Veldar. All payments are simulated on TestNet.
        </p>
      </div>
    </footer>
  );
}
