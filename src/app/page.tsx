import LiveScoresClient from "@/components/LiveScoresClient";
import LiveCommentaryClient from "@/components/LiveCommentaryClient";
import HomeUpcomingClient from "@/components/HomeUpcomingClient";
import HomeNewsClient from "@/components/HomeNewsClient";
import HomeStandingsClient from "@/components/HomeStandingsClient";
import DonationBanner from "@/components/DonationBanner";
import Link from "next/link";

export default function HomePage() {

  return (
    <div>
      {/* Hero Section */}
      <div className="relative -m-6 md:-m-8 mb-6 md:mb-8 overflow-hidden">
        {/* Banner background using FIFA Navy */}
        <div className="absolute inset-0 z-10" style={{
          background: '#003F72',
        }} />
        <div className="absolute inset-0 opacity-20 z-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
        <div className="relative z-20 px-6 md:px-8 py-10 md:py-14">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-yellow-400 text-sm font-semibold tracking-widest uppercase">FIFA World Cup 2026</span>
                  <span className="w-2 h-2 rounded-full bg-yellow-400/60" />
                  <span className="text-blue-200 text-sm">USA · Canada · Mexico</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                  2026 世界盃百科
                </h1>
                <p className="text-blue-200 mt-2 text-base md:text-lg max-w-xl">
                  48 隊 · 12 組 · 16 座場館 · 橫跨三國 · 巔峰對決
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <img
                  src="/trophy.svg"
                  alt="FIFA 2026"
                  className="h-24 md:h-32 w-auto opacity-90"
                />
                <div className="flex flex-wrap gap-2 md:gap-3">
                  <Link
                    href="/knockout"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-600/25"
                  >
                    🏆 淘汰賽對陣
                  </Link>
                  <Link
                    href="/schedule"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/25"
                  >
                    📅 完整賽程
                  </Link>
                  <Link
                    href="/groups"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-xl font-semibold transition-all shadow-lg shadow-yellow-400/25"
                  >
                    📊 積分表
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-900 from-[#0a0a23]/80 to-transparent z-20" />
      </div>

      <DonationBanner />

      {/* 淘汰賽對陣圖宣傳卡片 */}
      <section className="mb-8">
        <Link href="/knockout" className="block group">
          <div className="rounded-xl p-5 relative overflow-hidden transition-all duration-300 group-hover:scale-[1.01] group-hover:shadow-xl bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 translate-x-12 translate-y-12 scale-150 pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="text-4xl md:text-5xl flex-shrink-0">⚡</div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-white">淘汰賽對陣圖 (Round of 32)</h2>
                <p className="text-sm md:text-base text-white/80 mt-0.5">即時模擬晉級預測樹，32強強強對碰！誰能突圍而出？</p>
              </div>
              <div className="flex-shrink-0 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all text-xl">→</div>
            </div>
          </div>
        </Link>
      </section>

      {/* 不負責任冠軍預測 */}
      <section className="mb-8">
        <Link href="/predictions" className="block group">
          <div className="rounded-xl p-5 relative overflow-hidden transition-all duration-300 group-hover:scale-[1.01] group-hover:shadow-xl bg-[#af3525]">
            <div className="relative z-10 flex items-center gap-4">
              <div className="text-4xl md:text-5xl flex-shrink-0">🏆</div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-white">不負責任猜冠軍</h2>
                <p className="text-sm md:text-base text-white/80 mt-0.5">即時賽況 × 賠率分析 × 數據模型 — 誰會捧起大力神盃？</p>
              </div>
              <div className="flex-shrink-0 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all text-xl">→</div>
            </div>
          </div>
        </Link>
      </section>
      <LiveCommentaryClient />

      {/* Live Scores Section — auto-refreshes every 60s */}
      <section className="mb-8">
        <LiveScoresClient />
      </section>

      <HomeUpcomingClient />

      {/* Group Standings Preview */}
      <section className="mb-8">
        <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between" style={{ background: '#4a02b0' }}>
          <h2 className="text-xl font-bold text-white">小組積分</h2>
          <Link href="/groups" className="text-sm font-semibold text-white/80 hover:text-white transition-colors">
            查看全部 →
          </Link>
        </div>
        <HomeStandingsClient />
      </section>

      {/* Quick Stats Row — FIFA brand colors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "參賽隊伍", value: "48", icon: "🏳️", color: "#6404eb" },
          { label: "比賽場次", value: "104", icon: "⚽", color: "#d40404" },
          { label: "主辦城市", value: "16", icon: "🏟️", color: "#1a3a5c" },
          { label: "主辦國家", value: "3", icon: "🌎", color: "#523c1b" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4 text-white shadow-lg"
            style={{ background: stat.color }}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-white/80 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* News Section */}
      <section className="mb-8">
        <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between" style={{ background: '#3a2a12' }}>
          <h2 className="text-xl font-bold text-white">世界盃新聞</h2>
          {/* 更多新聞連結暫時隱藏（頁面尚未完成） */}
        </div>
        <HomeNewsClient />
      </section>
    </div>
  );
}
