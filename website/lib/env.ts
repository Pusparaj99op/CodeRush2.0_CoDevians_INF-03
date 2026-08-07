// Reading env vars with defaults.
//
// `process.env.X ?? fallback` is a trap: an env var that is *present but
// empty* — which is exactly what an unfilled line in a .env file produces,
// and what Vercel stores for a variable you cleared — is `""`, not
// undefined, so `??` keeps the empty string and silently discards the
// default. That produced a real mismatch between the website's configured
// payee address and the laptop-server's, which only surfaced as a failed
// payment verification at the last step of a workflow.

export function envOr(name: string, fallback: string): string {
  const value = process.env[name];
  return value !== undefined && value.trim() !== "" ? value.trim() : fallback;
}

export function envNumberOr(name: string, fallback: number): number {
  const parsed = Number(envOr(name, String(fallback)));
  return Number.isFinite(parsed) ? parsed : fallback;
}
