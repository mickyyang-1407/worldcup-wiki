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
        {/* Inline styles for WC theme (not stripped by Tailwind v4) */}
        <style>{`
          /* Dark gradient background */
          .wc-body-bg {
            position: relative;
            min-height: 100vh;
            background: linear-gradient(135deg, #0a0a23 0%, #1a1a3e 30%, #2d1b4e 60%, #1a1a3e 100%);
          }

          /* Abstract color shapes overlay */
          .wc-body-bg::before {
            content: '';
            position: fixed;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            background:
              radial-gradient(ellipse 600px 400px at 5% 20%, rgba(108, 43, 217, 0.25) 0%, transparent 70%),
              radial-gradient(ellipse 500px 500px at 95% 30%, rgba(220, 38, 38, 0.2) 0%, transparent 70%),
              radial-gradient(ellipse 400px 300px at 50% 85%, rgba(34, 197, 94, 0.12) 0%, transparent 70%),
              radial-gradient(ellipse 300px 300px at 80% 70%, rgba(59, 130, 246, 0.15) 0%, transparent 70%),
              radial-gradient(ellipse 350px 350px at 20% 75%, rgba(234, 179, 8, 0.1) 0%, transparent 70%);
          }

          /* Trophy decoration - right side */
          .wc-trophy-deco {
            position: fixed;
            right: -60px;
            top: 50%;
            transform: translateY(-50%);
            width: 400px;
            height: 500px;
            z-index: 0;
            pointer-events: none;
            opacity: 0.06;
            background: url('/images/worldcup-logo-official.jpg') no-repeat center/contain;
            filter: brightness(2) contrast(0.5);
          }

          /* Stadium decoration - left side */
          .wc-stadium-deco {
            position: fixed;
            left: -80px;
            top: 60%;
            transform: translateY(-50%);
            width: 350px;
            height: 300px;
            z-index: 0;
            pointer-events: none;
            opacity: 0.04;
            background: url('/images/worldcup-stadium.jpg') no-repeat center/contain;
            filter: brightness(2) contrast(0.5);
          }

          /* FIFA brand color bar */
          .wc-brand-bar {
            position: fixed;
            top: 56px;
            left: 0;
            right: 0;
            height: 4px;
            z-index: 40;
            background: linear-gradient(90deg,
              #6c2bd9 0%, #6c2bd9 20%,
              #dc2626 20%, #dc2626 40%,
              #2563eb 40%, #2563eb 60%,
              #22c55e 60%, #22c55e 80%,
              #eab308 80%, #eab308 100%
            );
            opacity: 0.6;
          }

          /* Semi-transparent content card */
          .wc-content-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-radius: 16px;
            box-shadow:
              0 1px 3px rgba(0, 0, 0, 0.06),
              0 4px 24px rgba(0, 0, 0, 0.1);
          }

          /* Footer on dark bg */
          .wc-footer {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }
        `}</style>

        <div className="wc-body-bg flex flex-col min-h-full">
          <div className="wc-trophy-deco" />
          <div className="wc-stadium-deco" />
          <div className="wc-brand-bar" />

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
