import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/bottom-nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "TrueUnit by Scout",
  description: "Prototype: a search assistant that shows the real flats behind the ads in Princess Tower, Dubai Marina.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-neutral-100 antialiased">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-white shadow-sm">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white/95 px-4 py-3 backdrop-blur">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-full bg-[var(--brand)] text-[13px] font-bold text-white">PF</span>
              <span className="text-[15px] font-semibold tracking-tight">
                Scout <span className="text-primary">· TrueUnit</span>
              </span>
            </Link>
            <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Prototype</span>
          </header>
          <main className="flex-1 pb-24">{children}</main>
          <BottomNav />
        </div>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
