import type { Metadata } from "next";
import { Exo_2 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo2",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.lsdevhub.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Lost Saga Database",
    template: "%s — Lost Saga Database",
  },
  description:
    "All-in-one Lost Saga database and toolset. Search heroes, gears, items, medals, pets, and assets — built by the community, for the community.",
  openGraph: {
    type: "website",
    siteName: "Lost Saga Database",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${exo2.variable} ${exo2.className} flex min-h-screen flex-col antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
