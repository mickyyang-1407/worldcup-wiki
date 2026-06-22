"use client";

import { useState, useEffect, useCallback } from "react";
import TeamBadge from "./TeamBadge";
import PageHero from "./PageHero";

interface EspnScorer {
  name: string;
  goals: number;
  team: string;
  teamSlug: string;
}

interface EspnStats {
  totalGoals: number;
  completedMatches: number;
  avgGoalsPerMatch: string;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
  topScorers: EspnScorer[];
}

interface GroupStanding {
  team_id: string;
  team_name: string;
  played: number;
  gf: number;
}

interface Group {
  id: string;
  name: string;
  standings: GroupStanding[];
}

export default function StatsClient() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [espnStats, setEspnStats] = useState<EspnStats | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [scorersRes, standingsRes] = await Promise.all([
        fetch("/api/espn-scorers", { cache: "no-store" }),
        fetch("/api/espn-standings", { cache: "no-store" }),
      ]);
      if (scorersRes.ok) {
        const data = await scorersRes.json();
        if (data.topScorers) setEspnStats(data);
      }
      if (standingsRes.ok) {
        const data = await standingsRes.json();
        if (data.groups) setGroups(data.groups);
      }
    } catch {}
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const timer = setInterval(fetchAll, 30000);
    return () => clearInterval(timer);
  }, [fetchAll]);

  // Group stats computed from standings
  const groupStats = groups.map((g) => {
    const totalGames = Math.round(g.standings.reduce((s, t) => s + t.played, 0) / 2);
    const totalGoals = g.standings.reduce((s, t) => s + t.gf, 0);
    return {
      id: g.id,
      name: g.name,
      played: totalGames,
      goals: totalGoals,
      avg: totalGames > 0 ? (totalGoals / totalGames).toFixed(1) : "—",
    };
  });

  const v = (n: number | undefined) => (loading ? "…" : n ?? "—");

  return (
    <div>
      <PageHero
        gradient="linear-gradient(135deg, #af3525 0%, #8286cd 100%)"
        title="賽事統計"
        subtitle="截至目前的各項數據統計"
        tag="Stats"
        icon="📊"
      />
      <div className="flex justify-end mb-4 -mt-2">
        <span className="text-xs text-gray-400">
          {lastUpdated.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })} 更新
        </span>
        {espnStats && <span className="text-xs text-green-500 ml-3">ESPN 即時資料</span>}
      </div>

      {/* Overview cards — 3 columns × 2 rows */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="text-xs text-gray-500 mb-1">已完成比賽</div>
          <div className="text-3xl font-bold text-gray-900">{v(espnStats?.completedMatches)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="text-xs text-gray-500 mb-1">總進球數</div>
          <div className="text-3xl font-bold text-green-600">{v(espnStats?.totalGoals)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="text-xs text-gray-500 mb-1">場均進球</div>
          <div className="text-3xl font-bold text-blue-600">{loading ? "…" : (espnStats?.avgGoalsPerMatch ?? "—")}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-4 h-4 rounded-sm bg-yellow-400 inline-block shrink-0" />
            <span className="text-xs text-gray-500">黃牌</span>
          </div>
          <div className="text-3xl font-bold text-yellow-500">{v(espnStats?.yellowCards)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-4 h-4 rounded-sm bg-red-600 inline-block shrink-0" />
            <span className="text-xs text-gray-500">紅牌</span>
          </div>
          <div className="text-3xl font-bold text-red-600">{v(espnStats?.redCards)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="text-xs text-gray-500 mb-1">烏龍球</div>
          <div className="text-3xl font-bold text-orange-500">{v(espnStats?.ownGoals)}</div>
        </div>
      </div>

      {/* Top Scorers */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">射手榜</h2>
          {espnStats && <span className="text-xs text-green-500">ESPN 即時</span>}
        </div>
        {loading ? (
          <div className="px-5 py-8 text-center text-gray-400">載入中...</div>
        ) : espnStats?.topScorers && espnStats.topScorers.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {espnStats.topScorers.map((player, idx) => (
              <div key={player.name} className="flex items-center gap-3 px-5 py-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  idx === 0 ? "bg-yellow-400" : idx === 1 ? "bg-gray-400" : idx === 2 ? "bg-amber-600" : "bg-gray-200 text-gray-500"
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <span className="font-medium text-gray-800">{player.name}</span>
                  {player.teamSlug ? (
                    <div className="inline-block ml-2 align-middle">
                      <TeamBadge teamId={player.teamSlug} size="sm" showName={false} linkable={false} />
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 ml-2">{player.team}</span>
                  )}
                </div>
                <span className="text-lg font-bold text-gray-900">{player.goals}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-gray-400">暫無進球數據</div>
        )}
      </div>

      {/* Group Stats from ESPN standings */}
      {groupStats.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">各組比賽統計</h2>
            {groups.length > 0 && <span className="text-xs text-green-500">ESPN 即時</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">小組</th>
                  <th className="px-4 py-3 text-center text-gray-500 font-medium">已賽場次</th>
                  <th className="px-4 py-3 text-center text-gray-500 font-medium">總進球</th>
                  <th className="px-4 py-3 text-center text-gray-500 font-medium">場均進球</th>
                </tr>
              </thead>
              <tbody>
                {groupStats.map((g) => (
                  <tr key={g.id} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{g.name}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{g.played}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-800">{g.goals}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{g.avg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
