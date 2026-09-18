import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Known Exploited Vulnerabilities: Where Risk Concentrates",
  description: "An interactive analysis of CISA's Known Exploited Vulnerabilities catalog.",
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
