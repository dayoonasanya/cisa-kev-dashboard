import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KEV Command Center | Cyber Defense Intelligence Showcase",
  description: "An independent CISA Known Exploited Vulnerabilities analysis and cybersecurity engineering showcase by Adedayo A. Onasanya.",
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
