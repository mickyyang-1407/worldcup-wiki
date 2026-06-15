"use client";

import { teams } from "@/data/teams";
import { getFlagClass } from "@/data/teamFlags";

/* FIFA 2026 brand group colors */
const GROUP_COLORS: Record<string, string> = {
  A: "#a4c44d", B: "#b1301f", C: "#2d47cb", D: "#907ad6",
  E: "#5b2227", F: "#1c433a", G: "#4b1cc3", H: "#7cd4c2",
  I: "#9d6d7b", J: "#98783d", K: "#c64524", L: "#7c2926",
};

interface Goal {
  player: string;
  minute: number;
  team: "home" | "away";
}

interface Match {
  id: string;
  number: number;
  stage: string;
  group?: string;
  date: string;
  time: string;
  timezone?: string;
  home: string;
  away: string;
  score: { home: number; away: number };
  status: string;
  venue: string;
  city: string;
  referee?: string;
  goals?: Goal[];
}

interface MatchCardProps {
  match: Match;
}

const statusStyles: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  live: "bg-red-100 text-red-700 animate-pulse",
  upcoming: "bg-gray-100 text-gray-600",
};

const statusLabels: Record<string, string> = {
  completed: "已結束",
  live: "進行中",
  upcoming: "未開始",
};

function formatDate(dateStr: string): string {
  // Data format: "2026-06-11" — plain date only, no time component
  // Time is stored in a separate "time" field (e.g. "1:00p.m. UTC−6")
  // Show only MM/DD, no hour/minute
  let date: Date;
  if (dateStr.includes("T") || dateStr.includes("Z")) {
    date = new Date(dateStr);
  } else {
    date = new Date(dateStr + "T00:00:00Z");
  }
  if (isNaN(date.getTime())) return "";
  return date.toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function MatchCard({ match }: MatchCardProps) {
  const homeTeam = teams.find((t: any) => t.id === match.home);
  const awayTeam = teams.find((t: any) => t.id === match.away);
  const homeFlag = homeTeam ? getFlagClass(match.home) : null;
  const awayFlag = awayTeam ? getFlagClass(match.away) : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 relative overflow-hidden">
      {/* Left color bar for group matches */}
      {match.stage === "group" && match.group && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[6px]"
          style={{ backgroundColor: GROUP_COLORS[match.group] || "#2d47cb" }}
        />
      )}
      {match.stage === "group" && match.group && (
        <div className="text-base font-black mb-3 pl-1" style={{ color: GROUP_COLORS[match.group] || "#2d47cb" }}>
          {match.group}組
        </div>
      )}
      {match.stage !== "group" && (
        <div className="text-sm font-bold text-purple-600 mb-3 pl-1">
          {match.stage === "round-of-16" ? "16強" : match.stage === "quarter-finals" ? "8強" : match.stage === "semi-finals" ? "準決賽" : match.stage === "third-place" ? "季軍戰" : match.stage === "final" ? "決賽" : match.stage}
        </div>
      )}

      <div className="grid grid-cols-3 items-center">
        {/* Left column: 中文隊名 + 英文隊名 + 國旗（國旗靠中間） */}
        <div className="flex items-center justify-end gap-3">
          <div className="flex flex-col items-end">
            {homeTeam && <span className="text-sm font-semibold text-gray-800 leading-tight">{homeTeam.name_zh}</span>}
            {homeTeam && <span className="text-xs text-gray-400 leading-tight">{homeTeam.name}</span>}
          </div>
          {homeFlag ? (
            <span className={`${homeFlag} text-3xl rounded-sm shrink-0`} title={homeTeam?.name} />
          ) : (
            <span className="inline-flex items-center justify-center rounded-full text-3xl shrink-0">🏳️</span>
          )}
        </div>

        {/* Middle column: 比分置中 */}
        <div className="flex flex-col items-center gap-1">
          {match.status === "completed" ? (
            <span className="text-2xl font-bold text-gray-900 font-mono">
              {match.score.home} - {match.score.away}
            </span>
          ) : (
            <span className="text-lg font-semibold text-gray-600">vs</span>
          )}
          <span className="text-xs text-gray-500">{formatDate(match.date)}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[match.status] || statusStyles.upcoming}`}>
            {statusLabels[match.status] || match.status}
          </span>
        </div>

        {/* Right column: 國旗（靠中間）+ 中文隊名 + 英文隊名 */}
        <div className="flex items-center gap-3">
          {awayFlag ? (
            <span className={`${awayFlag} text-3xl rounded-sm shrink-0`} title={awayTeam?.name} />
          ) : (
            <span className="inline-flex items-center justify-center rounded-full text-3xl shrink-0">🏳️</span>
          )}
          <div className="flex flex-col">
            {awayTeam && <span className="text-sm font-semibold text-gray-800 leading-tight">{awayTeam.name_zh}</span>}
            {awayTeam && <span className="text-xs text-gray-400 leading-tight">{awayTeam.name}</span>}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1 text-xs text-gray-400">
        <span>&#128205;</span>
        <span>{match.city}</span>
        {match.referee && (
          <>
            <span className="mx-1">·</span>
            <span>&#128695; {match.referee}</span>
          </>
        )}
      </div>

      {match.goals && match.goals.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {match.goals.map((g: Goal, i: number) => (
            <span
              key={i}
              className={`text-xs px-1.5 py-0.5 rounded ${
                g.team === "home"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-orange-50 text-orange-700"
              }`}
            >
              {g.player} {g.minute}'
            </span>
          ))}
        </div>
      )}

    </div>
  );
}
