import MatchCard from "@/components/MatchCard";
import NewsCard from "@/components/NewsCard";
import LiveScoresClient from "@/components/LiveScoresClient";
import { matches } from "@/data/schedule";
import newsData from "@/data/news.json";
import { groups } from "@/data/groups";
import Link from "next/link";
import TeamBadge from "@/components/TeamBadge";

/* FIFA 2026 brand colors for groups (from official brand image) */
const GROUP_COLORS: Record<string, string> = {
  A: "#a4c44d", B: "#b1301f", C: "#2d47cb", D: "#907ad6",
  E: "#5b2227", F: "#1c433a", G: "#4b1cc3", H: "#7cd4c2",
  I: "#9d6d7b", J: "#98783d", K: "#c64524", L: "#7c2926",
};

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

export default function HomePage() {
  const matchList = [...matches];

  const completed = matchList
    .filter((m: any) => m.status === "completed")
    .slice(0, 4);

  const upcoming = matchList
    .filter((m: any) => m.status === "scheduled")
    .sort((a: any, b: any) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 4);

  const latestNews = [...newsData].sort((a: any, b: any) => b.date.localeCompare(a.date)).slice(0, 6);

  const groupList = groups as any[];

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
              <div className="flex gap-3">
                <Link
                  href="/schedule"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-medium transition-all backdrop-blur-sm border border-white/20"
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
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0a0a23]/80 to-transparent z-20" />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "參賽隊伍", value: "48", icon: "🏳️", color: "from-blue-500 to-blue-600" },
          { label: "比賽場次", value: "104", icon: "⚽", color: "from-green-500 to-green-600" },
          { label: "主辦城市", value: "15", icon: "🏟️", color: "from-purple-500 to-purple-600" },
          { label: "主辦國家", value: "3", icon: "🌎", color: "from-orange-500 to-orange-600" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white shadow-lg`}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-white/80 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Live Scores Section — auto-refreshes every 60s */}
      <section className="mb-8">
        <LiveScoresClient />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 rounded-full inline-block" style={{ backgroundColor: '#a4c44d' }} />
          即將開賽
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {upcoming.length > 0 ? upcoming.map((m: any) => (
            <MatchCard key={m.id} match={m} />
          )) : (
            <div className="col-span-2 text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">📅</p>
              <p>暫無即將開賽的賽事</p>
            </div>
          )}
        </div>
      </section>

      {/* Group Standings Preview */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full inline-block" style={{ backgroundColor: '#26458b' }} />
            小組積分
          </h2>
          <Link href="/groups" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            查看全部 →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {groupList.slice(0, 6).map((group: any) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all overflow-hidden group"
            >
              <div className="px-4 py-2" style={{ background: `linear-gradient(135deg, ${GROUP_COLORS[group.id] || '#2d47cb'} 0%, ${adjustColor(GROUP_COLORS[group.id] || '#2d47cb', -20)} 100%)` }}>
                <h3 className="text-white font-bold text-sm">{group.name}</h3>
              </div>
              <div className="p-3 space-y-1.5">
                {group.standings.slice(0, 2).map((row: any) => (
                  <div key={row.team_id} className="flex items-center justify-between text-sm">
                    <TeamBadge teamId={row.team_id} size="sm" />
                    <span className="font-bold text-gray-800">{row.pts}<span className="font-normal text-gray-400 text-xs ml-0.5">pts</span></span>
                  </div>
                ))}
                <div className="text-xs text-gray-400 text-center pt-1 group-hover:text-green-600 transition-colors">
                  查看完整積分 →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* News Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-500 rounded-full inline-block" />
            世界盃新聞
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {latestNews.map((item: any) => (
            <NewsCard
              key={item.id}
              id={item.id}
              title={item.title}
              source={item.source}
              date={item.date}
              summary={item.summary}
              url={item.url}
              category={item.category}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
