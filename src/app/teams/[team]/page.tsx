import Link from "next/link";
import { teams } from "@/data/teams";
import { matches } from "@/data/schedule";
import { players } from "@/data/players";
import GroupStandingsTable from "@/components/GroupStandingsTable";
import MatchCard from "@/components/MatchCard";
import TeamBadge from "@/components/TeamBadge";
import { getFlagClass } from "@/data/teamFlags";

export function generateStaticParams() {
  return (teams as any[]).map((t: any) => ({ team: t.id }));
}

export default async function TeamDetailPage({ params }: { params: Promise<{ team: string }> }) {
  const { team: teamId } = await params;
  const team = (teams as any[]).find((t: any) => t.id === teamId);
  if (!team) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">找不到此隊伍</h1>
        <Link href="/teams" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">← 返回隊伍列表</Link>
      </div>
    );
  }

  const teamMatches = (matches as any[]).filter(
    (m: any) => m.home === team.id || m.away === team.id
  );

  const teamPlayers = (players as any[]).filter((p: any) => p.team_id === team.id);

  const positionGroups = [
    { key: "GK", label: "守門員" },
    { key: "DF", label: "後衛" },
    { key: "MF", label: "中場" },
    { key: "FW", label: "前鋒" },
  ];

  const flagClass = getFlagClass(team.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/teams" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">← 所有隊伍</Link>

      {/* Team Hero — Flag Banner */}
      <div className="relative rounded-xl overflow-hidden mb-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Large flag as hero background */}
        {flagClass && (
          <div className="absolute inset-0 opacity-[0.07] flex items-center justify-center pointer-events-none">
            <span className={`${flagClass} text-[300px] md:text-[500px] scale-150`} />
          </div>
        )}
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-center gap-6">
            {/* Giant flag badge */}
            <span className={`${flagClass} text-7xl md:text-8xl rounded-sm shrink-0 shadow-2xl`} />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{team.name_zh}</h1>
              <p className="text-lg text-gray-300">{team.name} · {team.nickname}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs bg-white/15 text-white px-3 py-1 rounded-full font-medium backdrop-blur-sm">
                  {team.group}組
                </span>
                <span className="text-xs bg-white/15 text-white px-3 py-1 rounded-full font-medium backdrop-blur-sm">
                  FIFA #{team.fifa_ranking}
                </span>
                <span className="text-xs bg-white/15 text-white px-3 py-1 rounded-full font-medium backdrop-blur-sm">
                  {team.appearances} 次參賽
                </span>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xs text-gray-400">教練</div>
              <div className="font-semibold text-white text-sm">{team.coach.name}</div>
              <div className="text-xs text-gray-400">{team.coach.nationality}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xs text-gray-400">隊長</div>
              <div className="font-semibold text-white text-sm">{team.captain}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xs text-gray-400">最佳成績</div>
              <div className="font-semibold text-white text-sm">{team.best_wc_result}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xs text-gray-400">協會</div>
              <div className="font-semibold text-white text-sm truncate" title={team.association}>{team.association}</div>
            </div>
          </div>

          {team.description && (
            <p className="mt-4 text-sm text-gray-300 leading-relaxed">{team.description}</p>
          )}
        </div>
      </div>

      {/* Group Standings */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">小組積分</h2>
        <GroupStandingsTable groupId={team.group} compact />
      </section>

      {/* Matches */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">比賽記錄</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {teamMatches.map((m: any) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </section>

      {/* Players */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">球員名單</h2>
        <div className="space-y-4">
          {positionGroups.map(({ key, label }) => {
            const posPlayers = teamPlayers.filter((p: any) => p.position === key);
            if (posPlayers.length === 0) return null;
            return (
              <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">{label}</div>
                <div className="divide-y divide-gray-50">
                  {posPlayers.map((p: any) => (
                    <Link
                      key={p.id}
                      href={`/players/${p.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/50 transition-colors"
                    >
                      <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-mono font-bold text-gray-500">
                        {p.jersey_number}
                      </span>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-800">{p.name_zh}</span>
                        <span className="text-xs text-gray-400 ml-2">{p.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{p.age}歲</span>
                      <span className="text-xs text-gray-400">{p.club}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
