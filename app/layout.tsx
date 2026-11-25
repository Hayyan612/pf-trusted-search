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
import "./globals.css";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "TrueUnit by Scout",
  description: "Prototype: a search assistant that shows the real flats behind the ads in Princess Tower, Dubai Marina.",
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
            <Link href="/" className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-full bg-[var(--brand)] text-[13px] font-bold text-white md:size-8">PF</span>
              <span className="text-[15px] font-semibold tracking-tight md:text-base">
                Scout <span className="text-primary">· TrueUnit</span>
              </span>
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
      </body>
    </html>
  );
}
