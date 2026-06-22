"use client";

import { useState, useEffect } from "react";
import TeamBadge from "./TeamBadge";
import MatchCard from "./MatchCard";

const GROUP_COLORS: Record<string, string> = {
  A: "linear-gradient(135deg,#a4c44d,#8fb33e)", B: "linear-gradient(135deg,#b1301f,#8f2618)",
  C: "linear-gradient(135deg,#2d47cb,#2339a8)", D: "linear-gradient(135deg,#907ad6,#7560be)",
  E: "linear-gradient(135deg,#5b2227,#3d1619)", F: "linear-gradient(135deg,#1c433a,#122d27)",
  G: "linear-gradient(135deg,#4b1cc3,#3a15a0)", H: "linear-gradient(135deg,#7cd4c2,#5cbfaa)",
  I: "linear-gradient(135deg,#9d6d7b,#805763)", J: "linear-gradient(135deg,#98783d,#7a6030)",
  K: "linear-gradient(135deg,#c64524,#a5381d)", L: "linear-gradient(135deg,#7c2926,#5e1e1c)",
};

interface LiveTeamDataProps {
  teamId: string;
  groupId: string;
}

export default function LiveTeamData({ teamId, groupId }: LiveTeamDataProps) {
  const [standings, setStandings] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    Promise.all([
      fetch("/api/espn-standings").then((r) => r.json()),
      fetch("/api/espn?type=all&limit=150").then((r) => r.json()),
    ])
      .then(([standingsData, matchData]) => {
        const group = standingsData.groups?.find((g: any) => g.id === groupId);
        if (group) setStandings(group.standings);
        const teamMatches = (matchData.matches || [])
          .filter((m: any) => m.home === teamId || m.away === teamId)
          .slice(0, 8);
        setMatches(teamMatches);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 30000);
    const onVisible = () => { if (document.visibilityState === "visible") fetchData(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [teamId, groupId]);

  return (
    <>
      {/* Live Group Standings */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">小組積分（即時）</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3" style={{ background: GROUP_COLORS[groupId] || GROUP_COLORS.A }}>
            <h3 className="text-white font-bold">{groupId} 組積分表</h3>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-400 text-sm">載入中…</div>
          ) : standings.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">暫無資料</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-3 py-2 text-left text-gray-500 font-medium w-8">#</th>
                    <th className="px-3 py-2 text-left text-gray-500 font-medium">隊伍</th>
                    <th className="px-3 py-2 text-center text-gray-500 font-medium">賽</th>
                    <th className="px-3 py-2 text-center text-gray-500 font-medium">勝</th>
                    <th className="px-3 py-2 text-center text-gray-500 font-medium">和</th>
                    <th className="px-3 py-2 text-center text-gray-500 font-medium">敗</th>
                    <th className="px-3 py-2 text-center text-gray-500 font-medium">進</th>
                    <th className="px-3 py-2 text-center text-gray-500 font-medium">失</th>
                    <th className="px-3 py-2 text-center text-gray-500 font-medium">差</th>
                    <th className="px-3 py-2 text-center text-gray-500 font-bold">分</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row: any, i: number) => {
                    const isCurrentTeam = row.team_id === teamId;
                    const isQualified = i < 2;
                    return (
                      <tr
                        key={row.team_id}
                        className={`border-b border-gray-50 transition-colors ${
                          isCurrentTeam ? "bg-blue-50" : isQualified ? "bg-green-50/30" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-3 py-2.5 text-center">
                          {isQualified ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                              {i + 1}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">{i + 1}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <TeamBadge teamId={row.team_id} size="sm" />
                            {isCurrentTeam && <span className="text-xs text-blue-600 font-medium">▶</span>}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center text-gray-700">{row.played}</td>
                        <td className="px-3 py-2.5 text-center text-gray-700">{row.won}</td>
                        <td className="px-3 py-2.5 text-center text-gray-700">{row.drawn}</td>
                        <td className="px-3 py-2.5 text-center text-gray-700">{row.lost}</td>
                        <td className="px-3 py-2.5 text-center text-gray-700">{row.gf}</td>
                        <td className="px-3 py-2.5 text-center text-gray-700">{row.ga}</td>
                        <td className="px-3 py-2.5 text-center font-mono text-gray-700">{row.gd >= 0 ? `+${row.gd}` : row.gd}</td>
                        <td className="px-3 py-2.5 text-center font-bold text-lg text-gray-900">{row.pts}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Live Match Results */}
      {!loading && matches.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">比賽記錄（即時）</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {matches.map((m: any) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
