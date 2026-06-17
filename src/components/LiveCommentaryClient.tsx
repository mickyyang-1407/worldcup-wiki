"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface Play {
  id: string;
  clock: string;
  text: string;
  scoringPlay: boolean;
  type: string;
  period: number;
  homeScore: number | null;
  awayScore: number | null;
}

interface MatchInfo {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  clock: string;
  period: number;
  statusText: string;
  venue: string;
}

interface CommentaryData {
  live: boolean;
  match?: MatchInfo;
  plays?: Play[];
}

export default function LiveCommentaryClient() {
  const [data, setData] = useState<CommentaryData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/live-commentary");
      if (!res.ok) return;
      const json: CommentaryData = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 30000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchData();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchData]);

  // Not live or still loading → render nothing
  if (!data || !data.live || !data.match) return null;

  const { match, plays = [] } = data;
  const timeSince = lastUpdated
    ? Math.floor((Date.now() - lastUpdated.getTime()) / 1000)
    : 0;

  return (
    <section className="mb-8">
      {/* Header */}
      <div
        className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #e63900 0%, #b32200 100%)" }}
      >
        <div className="flex items-center gap-3">
          {/* Pulsing LIVE badge */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
          <h2 className="text-xl font-bold text-white">現在 LIVE 中</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/70">
            {timeSince < 120 ? `${timeSince}秒前更新` : `${Math.floor(timeSince / 60)}分前更新`}
          </span>
        </div>
      </div>

      <div className="bg-[#0d1117] rounded-xl overflow-hidden border border-white/10 shadow-xl">
        {/* Scoreboard */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-right">
              <p className="text-white font-bold text-lg leading-tight">{match.homeTeam}</p>
            </div>
            <div className="flex flex-col items-center gap-1 min-w-[100px]">
              <div className="text-3xl font-black text-white tabular-nums">
                {match.homeScore} <span className="text-white/40">–</span> {match.awayScore}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                  {match.clock ? `${match.clock}` : match.statusText}
                  {match.period === 2 && match.clock ? " (下半場)" : match.period === 1 && match.clock ? " (上半場)" : ""}
                </span>
              </div>
              {match.venue && (
                <p className="text-xs text-white/40 text-center">{match.venue}</p>
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-bold text-lg leading-tight">{match.awayTeam}</p>
            </div>
          </div>
        </div>

        {/* Play-by-play feed */}
        <div className="max-h-[360px] overflow-y-auto">
          {plays.length === 0 ? (
            <div className="px-6 py-8 text-center text-white/40 text-sm">實況載入中…</div>
          ) : (
            <ul className="divide-y divide-white/5">
              {plays.map((play) => (
                <li
                  key={play.id}
                  className={`px-5 py-3 flex gap-4 items-start transition-colors ${
                    play.scoringPlay
                      ? "bg-yellow-500/10 hover:bg-yellow-500/15"
                      : "hover:bg-white/5"
                  }`}
                >
                  <span className="text-xs font-mono text-white/40 w-10 shrink-0 pt-0.5 text-right">
                    {play.clock ? `${play.clock}'` : "—"}
                  </span>
                  <span
                    className={`text-sm leading-snug ${
                      play.scoringPlay ? "text-yellow-300 font-semibold" : "text-white/80"
                    }`}
                  >
                    {play.scoringPlay && <span className="mr-1">⚽</span>}
                    {play.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
