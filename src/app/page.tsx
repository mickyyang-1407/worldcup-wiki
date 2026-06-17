import LiveScoresClient from "@/components/LiveScoresClient";
import LiveCommentaryClient from "@/components/LiveCommentaryClient";
import HomeUpcomingClient from "@/components/HomeUpcomingClient";
import HomeNewsClient from "@/components/HomeNewsClient";
import HomeStandingsClient from "@/components/HomeStandingsClient";
import Link from "next/link";

export default function HomePage() {

  return (
    <div>
      {/* Hero Section */}
      <div className="relative -m-6 md:-m-8 mb-6 md:mb-8 overflow-hidden">
        {/* Banner gradient based on extracted palette: #6404eb, #d40404, #b7e710, #a8da13, #523c1b */}
        <div className="absolute inset-0 z-10" style={{
          background: 'linear-gradient(135deg, rgba(100,4,235,0.92) 0%, rgba(212,4,4,0.75) 35%, rgba(82,60,27,0.5) 60%, rgba(183,231,16,0.2) 100%)',
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
                  src="https://upload.wikimedia.org/wikipedia/zh/5/5c/2026_FIFA_World_Cup_emblem_logo.svg"
                  alt="FIFA 2026"
                  className="h-24 md:h-32 w-auto opacity-90"
                />
                <div className="flex gap-3">
                  <Link
                    href="/schedule"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/25"
                  >
                    📅 完整賽程
                  </Link>
                  <Link
                    href="/groups"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-xl font-semibold transition-all shadow-lg shadow-yellow-400/25"
                  >
                    🏆 積分表
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0a0a23]/80 to-transparent z-20" />
      </div>

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
            style={{ background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)` }}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-white/80 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Live Commentary — only renders when a match is in progress */}
      <LiveCommentaryClient />

      {/* Live Scores Section — auto-refreshes every 60s */}
      <section className="mb-8">
        <LiveScoresClient />
      </section>

      <HomeUpcomingClient />

      {/* Group Standings Preview */}
      <section className="mb-8">
        <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #6404eb 0%, #4a02b0 100%)' }}>
          <h2 className="text-xl font-bold text-white">小組積分</h2>
          <Link href="/groups" className="text-sm font-semibold text-white/80 hover:text-white transition-colors">
            查看全部 →
          </Link>
        </div>
        <HomeStandingsClient />
      </section>

      {/* News Section */}
      <section className="mb-8">
        <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #523c1b 0%, #3a2a12 100%)' }}>
          <h2 className="text-xl font-bold text-white">世界盃新聞</h2>
          {/* 更多新聞連結暫時隱藏（頁面尚未完成） */}
        </div>
        <HomeNewsClient />
      </section>
    </div>
  );
}
