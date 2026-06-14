"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import TeamBadge from "./TeamBadge";
import Link from "next/link";

interface LiveMatch {
  id: string;
  number: number;
  stage: string;
  group?: string;
  date: string;
  time: string;
  home: string;
  away: string;
  score: { home: number | null; away: number | null };
  status: string;
  venue: string;
  city: string;
  liveMinute?: number;
}

interface LiveScoresResponse {
  source: string;
  matches: LiveMatch[];
}

const GROUP_COLORS: Record<string, string> = {
  A: "#a4c44d", B: "#b1301f", C: "#2d47cb", D: "#907ad6",
  E: "#5b2227", F: "#1c433a", G: "#4b1cc3", H: "#7cd4c2",
  I: "#9d6d7b", J: "#98783d", K: "#c64524", L: "#7c2926",
};

export default function LiveScoresClient() {
  const [data, setData] = useState<LiveScoresResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/live-scores?type=results&limit=4");
      if (!res.ok) throw new Error("Failed to fetch");
      const json: LiveScoresResponse = await res.json();
      setData(json);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 60 seconds
    intervalRef.current = setInterval(fetchData, 60000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-16 bg-gray-100 rounded" />
          <div className="h-16 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  const matches = data?.matches || [];

  if (matches.length === 0) {
    return null; // No results yet
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span
            className="w-1 h-6 rounded-full inline-block"
            style={{ backgroundColor: "#af3525" }}
          />
          最新賽果
        </h2>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs text-gray-400">
            {data?.source === "football-data.org" ? "即時" : "更新"}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {matches.map((match) => {
          const groupColor = match.group
            ? GROUP_COLORS[match.group] || "#8286cd"
            : "#8286cd";

          return (
            <Link
              key={match.id}
              href={`/schedule#${match.id}`}
              className="block bg-gray-50 hover:bg-gray-100 rounded-xl p-3 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                {/* Home team */}
                <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    <TeamBadge teamId={match.home} showName size="sm" linkable={false} />
                  </span>
                </div>

                {/* Score */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-lg font-bold min-w-[2ch] text-right ${
                      match.status === "live" ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {match.score.home !== null ? match.score.home : "-"}
                  </span>
                  <span className="text-gray-400 text-sm font-medium">:</span>
                  <span
                    className={`text-lg font-bold min-w-[2ch] ${
                      match.status === "live" ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {match.score.away !== null ? match.score.away : "-"}
                  </span>
                </div>

                {/* Away team */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    <TeamBadge teamId={match.away} showName size="sm" linkable={false} />
                  </span>
                </div>

                {/* Group badge */}
                {match.group && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 text-white"
                    style={{ backgroundColor: groupColor }}
                  >
                    {match.group}組
                  </span>
                )}
              </div>
              <div className="text-[10px] text-gray-400 mt-1 text-center">
                {match.status === "live"
                  ? `進行中 ${match.liveMinute || ""}`
                  : `${match.date}`}
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href="/schedule"
        className="mt-3 block text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
      >
        查看完整賽程 →
      </Link>
    </div>
  );
}
