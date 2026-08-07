import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Reveal } from "@/components/reveal";
import { API_ENDPOINTS, WORKFLOW_LIFECYCLE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Docs — Veldar",
  description: "The workflow lifecycle and API surface behind Veldar's orchestrator.",
};

export default function DocsPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="pt-16 pb-16 lg:pb-20">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.05] tracking-tight text-[var(--color-headline)] md:text-5xl">
              How it actually works.
            </h1>
            <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-[var(--color-body)]">
              A reference for anyone evaluating the build: the lifecycle every workflow follows,
              and the API surface that implements it.
            </p>
          </div>
        </section>

        <section className="pb-24 lg:pb-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <h2 className="text-2xl font-semibold text-[var(--color-headline)]">Workflow lifecycle</h2>
            <ol className="mt-8 flex flex-col gap-6">
              {WORKFLOW_LIFECYCLE.map((step, i) => (
                <Reveal key={step.title} delay={i * 0.04}>
                  <li className="flex gap-5 border-l-2 border-[var(--color-border)] pl-6">
                    <div>
                      <h3 className="text-base font-semibold text-[var(--color-headline)]">{step.title}</h3>
                      <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-[var(--color-body)]">
                        {step.body}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="pb-24 lg:pb-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <h2 className="text-2xl font-semibold text-[var(--color-headline)]">API surface</h2>
            <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-[var(--color-body)]">
              Everything the dashboard and app call, implemented under <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[13px]">website/app/api</code>.
            </p>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--color-border)]">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                    <th className="px-5 py-3 font-medium text-[var(--color-muted)]">Method</th>
                    <th className="px-5 py-3 font-medium text-[var(--color-muted)]">Path</th>
                    <th className="px-5 py-3 font-medium text-[var(--color-muted)]">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {API_ENDPOINTS.map((ep) => (
                    <tr key={ep.method + ep.path} className="border-b border-[var(--color-border)] last:border-b-0">
                      <td className="px-5 py-3 font-mono text-xs text-[var(--color-cta)]">{ep.method}</td>
                      <td className="px-5 py-3 font-mono text-xs text-[var(--color-headline)]">{ep.path}</td>
                      <td className="px-5 py-3 text-[var(--color-body)]">{ep.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
