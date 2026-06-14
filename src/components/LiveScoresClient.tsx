"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import MatchCard from "./MatchCard";
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
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span
            className="w-1 h-6 rounded-full inline-block"
            style={{ backgroundColor: "#d40404" }}
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

      <div className="grid md:grid-cols-2 gap-4">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match as any} />
        ))}
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/schedule"
          className="text-sm font-medium inline-block py-2"
          style={{ color: '#d40404' }}
        >
          查看完整賽程 →
        </Link>
      </div>
    </section>
  );
}
