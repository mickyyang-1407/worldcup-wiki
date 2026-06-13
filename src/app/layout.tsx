import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "2026 世界盃百科 | FIFA World Cup 2026",
  description: "2026 年 FIFA 世界盃完整資訊 — 小組賽程、隊伍球員、淘汰賽對陣、場館統計，一手掌握。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Fixed background elements */}
        <div className="wc-bg-wrapper flex flex-col min-h-full">
          <div className="wc-trophy-deco" />
          <div className="wc-stadium-deco" />
          <div className="wc-brand-bar" />

          <Navbar />
          <main className="flex-1">
            {/* Wrap content in a semi-transparent card */}
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="wc-content-card p-6 md:p-8">
                {children}
              </div>
            </div>
          </main>
          <footer className="border-t border-white/10 bg-black/20 backdrop-blur-md py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
              <p>2026 世界盃百科 &copy; 2026 &middot; 僅供參考用途</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
