// Canonical site URL, in one place.
//
// The site is served from two live origins:
//   https://www.codevians.online   (canonical — the custom domain)
//   https://veldar-gray.vercel.app (the Vercel deployment)
//
// Metadata, sitemap, robots, and OG tags all point at the canonical one so
// the two origins don't compete in search results. Preview deployments get
// their own URL from VERCEL_URL rather than claiming to be production.

const CANONICAL = "https://www.codevians.online";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : CANONICAL)
).replace(/\/$/, "");

export const SITE_NAME = "Veldar";

export const SITE_DESCRIPTION =
  "Veldar plans multi-step tasks, shops a marketplace of paid services, and pays for each one in small Algorand micropayments as work is verified. You see every offer, approval, and receipt.";

/** Routes worth indexing. Dashboard and per-workflow traces are private. */
export const PUBLIC_ROUTES = [
  "/",
  "/product",
  "/algorand",
  "/pricing",
  "/docs",
  "/about",
  "/contact",
  "/signin",
  "/signup",
  "/legal/privacy",
  "/legal/terms",
] as const;
