import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import Link from "next/link";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "EventTree | Campus Events",
  description: "One stop shop for all your university events. Discover societies, explore events, and stay connected.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} ${beVietnam.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-on-background">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="w-full mt-auto border-t border-outline-variant/30">
            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="space-y-2">
                <span className="text-lg font-bold text-on-surface tracking-tight" style={{ fontFamily: 'var(--font-headline)' }}>
                  Event Tree.
                </span>
                <p className="text-on-surface-variant text-sm">Built for Dalhousie Students.</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Navigate</span>
                <Link href="/" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Home</Link>
                <Link href="/events" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Events</Link>
                <Link href="/community" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Community</Link>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">More</span>
                <Link href="/community" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Community</Link>
                <Link href="/community/collab-fridays" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Collab Fridays</Link>
                <Link href="/login" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Login</Link>
              </div>
            </div>
            <div className="border-t border-outline-variant/20 py-4 text-center text-xs text-on-surface-variant">
              © 2026 EventTree · Dalhousie University
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
