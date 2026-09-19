import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KEV Command Center | Adedayo A. Onasanya",
  description: "An interactive CISA Known Exploited Vulnerabilities analysis and prioritization portal.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
