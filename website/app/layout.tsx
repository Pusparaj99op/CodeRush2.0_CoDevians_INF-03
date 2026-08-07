import type { Metadata } from "next";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { Providers } from "./providers";

const poppins = { variable: "--font-poppins" };
const inter = { variable: "--font-inter" };

const TITLE = "Veldar — an agent that spends carefully";

export const metadata: Metadata = {
  // Required for OG/Twitter images and canonical URLs to resolve to
  // absolute URLs. The site is live on two origins; everything points at
  // the canonical one (see lib/site.ts).
  metadataBase: new URL(SITE_URL),
  // No title template: existing pages already carry their own "— Veldar"
  // suffix, and a template would double it.
  title: TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`} data-theme="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
