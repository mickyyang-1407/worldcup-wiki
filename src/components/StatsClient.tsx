"use client";

import { useState, useEffect, useMemo } from "react";
import TeamBadge from "./TeamBadge";
import matchesData from "@/data/schedule.json";
import teamsData from "@/data/teams.json";

interface Match {
  id: string;
  status: string;
  stage: string;
  group: string;
  home: string;
  away: string;
  score: { home: number; away: number };
  goals?: { player: string; team: "home" | "away" }[];
}

interface Team {
  id: string;
  name_zh: string;
}

const medalColors: Record<number, { bg: string; text: string; label: string }> = {
  0: { bg: "bg-gradient-to-r from-yellow-300 to-yellow-500", text: "text-yellow-900", label: "🥇" },
  1: { bg: "bg-gradient-to-r from-gray-300 to-gray-400", text: "text-gray-700", label: "🥈" },
  2: { bg: "bg-gradient-to-r from-amber-500 to-amber-600", text: "text-amber-100", label: "🥉" },
};

export default function StatsClient() {
  const [now, setNow] = useState(Date.now());

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const matches = matchesData.matches as any[];
  const teams: Team[] = teamsData.teams;

  const completed = useMemo(
    () => matches.filter((m) => m.status === "completed"),
    [matches]
  );
  const upcoming = useMemo(
    () => matches.filter((m) => m.status === "scheduled"),
    [matches]
  );

  const totalGoals = useMemo(
    () => completed.reduce((sum: number, m: any) => sum + m.score.home + m.score.away, 0),
    [completed]
  );
  const avgGoals = useMemo(
    () => (completed.length > 0 ? (totalGoals / completed.length).toFixed(1) : "0"),
    [completed, totalGoals]
  );

  const topScorers = useMemo(() => {
    const goalMap: Record<string, { name: string; goals: number; team: string }> = {};
    for (const m of completed) {
      if (!m.goals) continue;
      for (const g of m.goals) {
        const key = g.player;
        if (!goalMap[key]) {
          goalMap[key] = { name: g.player, goals: 0, team: g.team === "home" ? m.home : m.away };
        }
        goalMap[key].goals++;
      }
    }
    return Object.values(goalMap).sort((a, b) => b.goals - a.goals).slice(0, 10);
  }, [completed]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">賽事統計</h1>
        <p className="text-gray-500 mt-1">即時統計 · 每 60 秒自動更新</p>
      </div>

      {/* Big number cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/10 shadow-lg p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <div className="text-4xl sm:text-5xl font-black text-white mb-1">{totalGoals}</div>
            <div className="text-sm text-blue-300/80 font-medium">總進球數</div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/10 shadow-lg p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <div className="text-4xl sm:text-5xl font-black text-white mb-1">{completed.length}</div>
            <div className="text-sm text-green-300/80 font-medium">已賽場次</div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/10 shadow-lg p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <div className="text-4xl sm:text-5xl font-black text-white mb-1">{avgGoals}</div>
            <div className="text-sm text-purple-300/80 font-medium">場均進球</div>
          </div>
        </div>
      </div>

      {/* Top Scorers */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/10 shadow-lg mb-10">
        <div className="px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">射手榜</h2>
        </div>
        {topScorers.length > 0 ? (
          <div className="divide-y divide-white/5">
            {topScorers.map((player, idx) => {
              const team = teams.find((t) => t.id === player.team);
              const medal = medalColors[idx];
              return (
                <div
                  key={player.name}
                  className={`flex items-center gap-4 px-6 py-3.5 transition-colors ${
                    idx < 3 ? "hover:bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 text-center shrink-0">
                    {idx < 3 ? (
                      <span className="text-lg">{medal.label}</span>
                    ) : (
                      <span className="text-sm font-bold text-gray-500">#{idx + 1}</span>
                    )}
                  </div>

                  {/* Player info */}
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-white">{player.name}</span>
                    <div className="inline-block ml-2 align-middle">
                      <TeamBadge teamId={player.team} size="sm" showName={false} linkable={false} />
                    </div>
                  </div>

                  {/* Goals */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-black text-white">{player.goals}</span>
                    <span className="text-xs text-gray-400">球</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <p className="text-3xl mb-2">⚽</p>
            <p>暫無進球數據</p>
          </div>
        )}
      </div>

      {/* Additional stats grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Win/Draw/Loss */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/10 shadow-lg p-6">
          <h2 className="text-base font-bold text-white mb-5">比賽結果分布</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-blue-400">主隊勝</span>
                <span className="font-semibold text-white">
                  {completed.filter((m: any) => m.score.home > m.score.away).length}
                  <span className="text-gray-400 font-normal ml-1">
                    ({completed.length > 0 ? Math.round(completed.filter((m: any) => m.score.home > m.score.away).length / completed.length * 100) : 0}%)
                  </span>
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${completed.length > 0 ? completed.filter((m: any) => m.score.home > m.score.away).length / completed.length * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-400">平局</span>
                <span className="font-semibold text-white">
                  {completed.filter((m: any) => m.score.home === m.score.away).length}
                  <span className="text-gray-400 font-normal ml-1">
                    ({completed.length > 0 ? Math.round(completed.filter((m: any) => m.score.home === m.score.away).length / completed.length * 100) : 0}%)
                  </span>
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-500 rounded-full transition-all"
                  style={{ width: `${completed.length > 0 ? completed.filter((m: any) => m.score.home === m.score.away).length / completed.length * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-orange-400">客隊勝</span>
                <span className="font-semibold text-white">
                  {completed.filter((m: any) => m.score.home < m.score.away).length}
                  <span className="text-gray-400 font-normal ml-1">
                    ({completed.length > 0 ? Math.round(completed.filter((m: any) => m.score.home < m.score.away).length / completed.length * 100) : 0}%)
                  </span>
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${completed.length > 0 ? completed.filter((m: any) => m.score.home < m.score.away).length / completed.length * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Biggest Win */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/10 shadow-lg p-6">
          <h2 className="text-base font-bold text-white mb-5">最大比分差</h2>
          {(() => {
            let max = 0;
            let match: any = null;
            for (const m of completed) {
              const diff = Math.abs(m.score.home - m.score.away);
              if (diff > max) { max = diff; match = m; }
            }
            if (match) {
              const homeTeam = teams.find((t) => t.id === match.home);
              const awayTeam = teams.find((t) => t.id === match.away);
              return (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <div className="text-center">
                      <TeamBadge teamId={match.home} size="lg" showName={false} linkable={false} />
                      <div className="text-xs text-gray-400 mt-1">{homeTeam?.name_zh || match.home}</div>
                    </div>
                    <div className="text-3xl font-black text-white">
                      {match.score.home} - {match.score.away}
                    </div>
                    <div className="text-center">
                      <TeamBadge teamId={match.away} size="lg" showName={false} linkable={false} />
                      <div className="text-xs text-gray-400 mt-1">{awayTeam?.name_zh || match.away}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    相差 <span className="font-bold text-white">{max}</span> 球
                  </p>
                </div>
              );
            }
            return <p className="text-gray-500 text-center py-4">暫無數據</p>;
          })()}
        </div>
      </div>
    </div>
  );
}
