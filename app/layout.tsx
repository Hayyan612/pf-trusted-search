import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/bottom-nav";
import { TopNav } from "@/components/top-nav";
import { UserMenu } from "@/components/user-menu";
import { ShortlistSync } from "@/components/shortlist-sync";
import { BriefSync } from "@/components/brief-sync";
import { AgentSimulator } from "@/components/agent-simulator";
import { Analytics } from "@/components/analytics";
import { Logo } from "@/components/logo";
import "./globals.css";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-display" });

const SITE = "https://trueunit.hayyan.space";
const DESCRIPTION =
  "A personal assistant for renting or buying in Dubai. It checks every ad, sets aside the misleading ones, and asks the agents for you before you call.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "TrueUnit: the real flats, not the ads", template: "%s · TrueUnit" },
  description: DESCRIPTION,
  applicationName: "TrueUnit",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "TrueUnit",
    title: "TrueUnit: the real flats, not the ads",
    description: DESCRIPTION,
    locale: "en_AE",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "TrueUnit: the real flats, not the ads. 242 ads checked in Princess Tower, Dubai Marina." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrueUnit: the real flats, not the ads",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

// Build-time switch: the Vercel mirror sets NEXT_PUBLIC_AUTH_ENABLED=false (no database there).
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED !== "false";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="bg-white antialiased">
        <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4 md:h-16 md:px-8">
            <Link href="/" className="flex items-center gap-2" aria-label="TrueUnit home">
              <Logo />
            </Link>
            <Suspense fallback={<div className="hidden flex-1 md:block" />}>
              <TopNav />
            </Suspense>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground lg:inline">Prototype</span>
              {AUTH_ENABLED && <UserMenu />}
            </div>
          </div>
        </header>
        <main className="min-h-[calc(100dvh-4rem)] pb-24 md:pb-12">{children}</main>
        <BottomNav />
        <Toaster position="top-center" />
        {AUTH_ENABLED && <ShortlistSync />}
        {AUTH_ENABLED && <BriefSync />}
        <AgentSimulator />
        <Analytics />
      </body>
    </html>
  );
}
