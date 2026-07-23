import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getDb } from "@/lib/db/client";
import { DEFAULT_SITE_SETTINGS, getSiteSettings } from "@/lib/settings/repository";
import { getSiteOrigin } from "@/lib/seo/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = process.env.DATABASE_URL ? await getSiteSettings(getDb()) : DEFAULT_SITE_SETTINGS;
  return {
    metadataBase: new URL(getSiteOrigin()),
    title: {
      default: settings.siteName,
      template: `%s · ${settings.siteName}`,
    },
    description: settings.siteDescription,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full" suppressHydrationWarning>{children}</body>
    </html>
  );
}
