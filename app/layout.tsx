import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trusted Home Search",
  description: "Prototype: trusted home-search assistant for Princess Tower, Dubai Marina",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto min-h-screen w-full max-w-md bg-white px-4 py-6 shadow-sm">
          {children}
        </main>
      </body>
    </html>
  );
}
