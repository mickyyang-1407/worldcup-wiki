"use client";

import { useMemo, useState, useEffect } from "react";
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

export default function StatsClient() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setLastUpdated(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const matches = matchesData.matches as any[];
  const teams: Team[] = teamsData.teams;

  const completed = matches.filter((m) => m.status === "completed");
  const upcoming = matches.filter((m) => m.status === "upcoming");

  const totalGoals = completed.reduce((sum, m) => sum + m.score.home + m.score.away, 0);
  const avgGoals = completed.length > 0 ? (totalGoals / completed.length).toFixed(1) : "0";

  const biggestWin = useMemo(() => {
    let max = 0;
    let match = null as Match | null;
    for (const m of completed) {
      const diff = Math.abs(m.score.home - m.score.away);
      if (diff > max) { max = diff; match = m; }
    }
    return { match, diff: max };
  }, [completed]);

  const topScorers = useMemo(() => {
    const goalMap: Record<string, { name: string; goals: number; team: string }> = {};
    for (const m of completed) {
      if (!m.goals) continue;
      for (const g of m.goals) {
        if (!goalMap[g.player]) goalMap[g.player] = { name: g.player, goals: 0, team: g.team === "home" ? m.home : m.away };
        goalMap[g.player].goals++;
      }
    }
    return Object.values(goalMap).sort((a, b) => b.goals - a.goals).slice(0, 10);
  }, [completed]);

  const groupStats = useMemo(() => {
    const stats: Record<string, { played: number; homeWins: number; draws: number; awayWins: number; goals: number }> = {};
    for (const m of completed) {
      if (m.stage !== "group" || !m.group) continue;
      if (!stats[m.group]) stats[m.group] = { played: 0, homeWins: 0, draws: 0, awayWins: 0, goals: 0 };
      stats[m.group].played++;
      stats[m.group].goals += m.score.home + m.score.away;
      if (m.score.home > m.score.away) stats[m.group].homeWins++;
      else if (m.score.home < m.score.away) stats[m.group].awayWins++;
      else stats[m.group].draws++;
    }
    return stats;
  }, [completed]);

  const homeWins = completed.filter((m) => m.score.home > m.score.away).length;
  const awayWins = completed.filter((m) => m.score.home < m.score.away).length;
  const draws = completed.filter((m) => m.score.home === m.score.away).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">賽事統計</h1>
          <p className="text-gray-500 mt-1">截至目前的各項數據統計</p>
        </div>
        <span className="text-xs text-gray-400">
          {lastUpdated.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })} 更新
        </span>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="text-xs text-gray-500 mb-1">已完成比賽</div>
          <div className="text-3xl font-bold text-gray-900">{completed.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="text-xs text-gray-500 mb-1">總進球數</div>
          <div className="text-3xl font-bold text-green-600">{totalGoals}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="text-xs text-gray-500 mb-1">場均進球</div>
          <div className="text-3xl font-bold text-blue-600">{avgGoals}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="text-xs text-gray-500 mb-1">未賽比賽</div>
          <div className="text-3xl font-bold text-gray-900">{upcoming.length}</div>
        </div>
      </div>

      {/* Win/Draw/Loss */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">比賽結果分布</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-600">主隊勝</span>
                <span className="font-semibold">{homeWins} ({completed.length > 0 ? Math.round(homeWins/completed.length*100) : 0}%)</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${completed.length > 0 ? homeWins/completed.length*100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">平局</span>
                <span className="font-semibold">{draws} ({completed.length > 0 ? Math.round(draws/completed.length*100) : 0}%)</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-400 rounded-full" style={{ width: `${completed.length > 0 ? draws/completed.length*100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-orange-600">客隊勝</span>
                <span className="font-semibold">{awayWins} ({completed.length > 0 ? Math.round(awayWins/completed.length*100) : 0}%)</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${completed.length > 0 ? awayWins/completed.length*100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Biggest Win */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">最大比分差</h2>
          {biggestWin.match ? (
            <div>
              <div className="text-4xl font-bold text-center text-gray-900 mb-2">
                {biggestWin.match.score.home} - {biggestWin.match.score.away}
              </div>
              <p className="text-center text-sm text-gray-500">
                差 {biggestWin.diff} 球
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-center">暫無數據</p>
          )}
        </div>
      </div>

      {/* Top Scorers */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">射手榜</h2>
        </div>
        {topScorers.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {topScorers.map((player, idx) => {
              const team = teams.find((t) => t.id === player.team);
              return (
                <div key={player.name} className="flex items-center gap-3 px-5 py-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    idx === 0 ? "bg-yellow-400" : idx === 1 ? "bg-gray-400" : idx === 2 ? "bg-amber-600" : "bg-gray-200 text-gray-500"
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">{player.name}</span>
                    <div className="inline-block ml-2 align-middle">
                      <TeamBadge teamId={player.team} size="sm" showName={false} linkable={false} />
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{player.goals}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-gray-400">暫無進球數據</div>
        )}
      </div>

      {/* Group Stats */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">各組比賽統計</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-gray-500 font-medium">小組</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">已賽</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">主勝</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">平局</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">客勝</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">總進球</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">場均進球</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupStats).map(([group, stats]) => (
                <tr key={group} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">第 {group} 組</td>
                  <td className="px-4 py-3 text-center text-gray-700">{stats.played}</td>
                  <td className="px-4 py-3 text-center text-blue-600">{stats.homeWins}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{stats.draws}</td>
                  <td className="px-4 py-3 text-center text-orange-600">{stats.awayWins}</td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-800">{stats.goals}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{(stats.goals / stats.played).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
