import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
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
  openGraph: {
    title: "2026 世界盃百科 | FIFA World Cup 2026",
    description: "48 隊 · 12 組 · 16 座場館 · 橫跨三國 · 巔峰對決",
    images: [{
      url: "https://upload.wikimedia.org/wikipedia/zh/thumb/5/5c/2026_FIFA_World_Cup_emblem_logo.svg/800px-2026_FIFA_World_Cup_emblem_logo.svg.png",
      width: 800,
      height: 800,
      alt: "FIFA World Cup 2026 Official Emblem",
    }],
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "2026 世界盃百科",
    description: "48 隊 · 12 組 · 16 座場館",
    images: ["https://upload.wikimedia.org/wikipedia/zh/thumb/5/5c/2026_FIFA_World_Cup_emblem_logo.svg/800px-2026_FIFA_World_Cup_emblem_logo.svg.png"],
  },
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
        <style>{`
          .wc-body-bg {
            position: relative;
            min-height: 100vh;
            background: linear-gradient(135deg, #0a0a23 0%, #1a1a3e 25%, #2d1b4e 50%, #1a1a3e 75%, #0f1b3d 100%);
          }

          /* WC 2026 brand gradient mesh overlay — FIFA 2026 brand colors */
          .wc-body-bg::before {
            content: '';
            position: fixed;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            background:
              radial-gradient(ellipse 700px 500px at 5% 15%, rgba(130, 134, 205, 0.3) 0%, transparent 70%),
              radial-gradient(ellipse 600px 600px at 92% 25%, rgba(175, 53, 37, 0.25) 0%, transparent 70%),
              radial-gradient(ellipse 500px 400px at 50% 80%, rgba(164, 196, 77, 0.15) 0%, transparent 70%),
              radial-gradient(ellipse 400px 400px at 80% 65%, rgba(38, 69, 139, 0.2) 0%, transparent 70%),
              radial-gradient(ellipse 450px 350px at 15% 70%, rgba(91, 34, 39, 0.12) 0%, transparent 70%),
              radial-gradient(ellipse 300px 300px at 50% 40%, rgba(144, 122, 214, 0.1) 0%, transparent 60%);
          }

          /* Subtle hexagon pattern overlay */
          .wc-pattern-overlay {
            position: fixed;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            opacity: 0.04;
            background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0L93.3 25v50L50 100L6.7 75V25L50 0z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E");
            background-size: 100px 100px;
          }

          /* Diagonal stripe accent bar - top - FIFA 2026 brand colors */
          .wc-accent-bar-top {
            position: fixed;
            top: 56px;
            left: 0;
            right: 0;
            height: 5px;
            z-index: 40;
            background: linear-gradient(90deg,
              #8286cd 0%, #8286cd 16%,
              #af3525 16%, #af3525 32%,
              #26458b 32%, #26458b 48%,
              #a4c44d 48%, #a4c44d 64%,
              #5b2227 64%, #5b2227 80%,
              #907ad6 80%, #907ad6 100%
            );
            opacity: 0.7;
          }

          /* Floating WC 2026 brand circles — FIFA 2026 brand colors */
          .wc-brand-circle-1 {
            position: fixed;
            width: 500px;
            height: 500px;
            border-radius: 50%;
            right: -150px;
            top: 10%;
            z-index: 0;
            pointer-events: none;
            background: radial-gradient(circle, rgba(130, 134, 205, 0.08) 0%, transparent 70%);
          }
          .wc-brand-circle-2 {
            position: fixed;
            width: 400px;
            height: 400px;
            border-radius: 50%;
            left: -100px;
            bottom: 5%;
            z-index: 0;
            pointer-events: none;
            background: radial-gradient(circle, rgba(175, 53, 37, 0.06) 0%, transparent 70%);
          }
          .wc-brand-circle-3 {
            position: fixed;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            left: 40%;
            top: 50%;
            z-index: 0;
            pointer-events: none;
            background: radial-gradient(circle, rgba(38, 69, 139, 0.06) 0%, transparent 70%);
          }

          /* Semi-transparent content card */
          .wc-content-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-radius: 16px;
            box-shadow:
              0 1px 3px rgba(0, 0, 0, 0.06),
              0 4px 24px rgba(0, 0, 0, 0.1),
              0 8px 48px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .wc-footer {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(0, 0, 0, 0.25);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }
        `}</style>

        <div className="wc-body-bg flex flex-col min-h-full">
          <div className="wc-pattern-overlay" />
          <div className="wc-brand-circle-1" />
          <div className="wc-brand-circle-2" />
          <div className="wc-brand-circle-3" />
          <div className="wc-accent-bar-top" />

          <Navbar />
          <main className="flex-1 relative z-10">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="wc-content-card p-6 md:p-8">
                {children}
              </div>
            </div>
          </main>
          <footer className="wc-footer py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
              <p>2026 世界盃百科 &copy; 2026 &middot; 僅供參考用途</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
