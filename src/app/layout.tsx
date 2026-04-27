import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Piano Tutor",
  description: "AI-powered piano learning app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <Providers>
          {/* Top navigation */}
          <nav className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950">
            <Link
              href="/"
              className="text-base font-semibold text-zinc-100 hover:text-white transition-colors"
            >
              Piano Tutor
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/play"
                className="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                Play
              </Link>
              <Link
                href="/connect"
                className="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                Connect
              </Link>
            </div>
          </nav>

          {/* Page content */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
