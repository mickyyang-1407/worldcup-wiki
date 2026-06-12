"use client";

import TeamBadge from "./TeamBadge";
import { teams } from "@/data/teams";

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

  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("zh-TW", { month: "short", day: "numeric", weekday: "short" });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4">
      {match.stage === "group" && match.group && (
        <div className="text-xs font-semibold text-blue-600 mb-2">
          {match.group}組
        </div>
      )}
      {match.stage !== "group" && (
        <div className="text-xs font-semibold text-purple-600 mb-2">
          {match.stage === "round-of-16" ? "16強" : match.stage === "quarter-finals" ? "8強" : match.stage === "semi-finals" ? "準決賽" : match.stage === "third-place" ? "季軍戰" : match.stage === "final" ? "決賽" : match.stage}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 text-right">
          <TeamBadge teamId={match.home} size="md" />
        </div>

        <div className="flex flex-col items-center gap-1 shrink-0">
          {match.status === "completed" ? (
            <span className="text-2xl font-bold text-gray-900 font-mono">
              {match.score.home} - {match.score.away}
            </span>
          ) : (
            <span className="text-lg font-semibold text-gray-600">vs</span>
          )}
          <span className="text-xs text-gray-500">{formatDate(match.date)}</span>
          <span className="text-xs text-gray-400">{match.time}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[match.status] || statusStyles.upcoming}`}>
            {statusLabels[match.status] || match.status}
          </span>
        </div>

        <div className="flex-1 text-left">
          <TeamBadge teamId={match.away} size="md" />
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
