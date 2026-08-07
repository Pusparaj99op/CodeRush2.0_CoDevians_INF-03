import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Veldar — an agent that spends carefully",
  description:
    "Veldar plans multi-step tasks, shops a marketplace of paid services, and pays for each one in small Algorand micropayments as work is verified. You see every offer, approval, and receipt.",
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
