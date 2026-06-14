"use client";

import TeamBadge from "./TeamBadge";
import { teams } from "@/data/teams";
import Link from "next/link";
import { formatMatchTime } from "@/lib/timezone";

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

export default function MatchCard({ match }: MatchCardProps) {
  const homeTeam = teams.find((t: any) => t.id === match.home);
  const awayTeam = teams.find((t: any) => t.id === match.away);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4">
      {match.stage === "group" && match.group && (
        <div className="text-xs font-semibold mb-2 flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GROUP_COLORS[match.group] || "#2d47cb" }}></span>
          <span style={{ color: GROUP_COLORS[match.group] || "#2d47cb" }}>{match.group}組</span>
        </div>
      )}
      {match.stage !== "group" && (
        <div className="text-xs font-semibold text-purple-600 mb-2">
          {match.stage === "round-of-16" ? "16強" : match.stage === "quarter-finals" ? "8強" : match.stage === "semi-finals" ? "準決賽" : match.stage === "third-place" ? "季軍戰" : match.stage === "final" ? "決賽" : match.stage}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 text-right">
          <TeamBadge teamId={match.home} size="xl" showName={false} linkable={false} />
        </div>

        <div className="flex flex-col items-center gap-1 shrink-0">
          {match.status === "completed" ? (
            <span className="text-2xl font-bold text-gray-900 font-mono">
              {match.score.home} - {match.score.away}
            </span>
          ) : (
            <span className="text-lg font-semibold text-gray-600">vs</span>
          )}
          <span className="text-xs text-gray-500">{formatMatchTime(match.date, match.time)}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[match.status] || statusStyles.upcoming}`}>
            {statusLabels[match.status] || match.status}
          </span>
        </div>

        <div className="flex-1 text-left">
          <TeamBadge teamId={match.away} size="xl" showName={false} linkable={false} />
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

      <div className="mt-2 pt-2 border-t border-gray-50">
        <Link
          href={`/media/${match.id}`}
          className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
        >
          <span>📺</span>
          <span>精華</span>
        </Link>
      </div>
    </div>
  );
}
