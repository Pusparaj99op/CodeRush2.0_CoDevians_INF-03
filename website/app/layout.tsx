export const metadata = {
  title: "Veldar",
  description: "Veldar orchestrator API — see Doc/specs/02-website.md",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
