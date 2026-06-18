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
  team: "home" | "away" | null;
  x: number | null;
  y: number | null;
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

// ── Pitch SVG ────────────────────────────────────────────────────────────────
// viewBox 0 0 105 68  (FIFA standard metres)
function PitchSVG({ plays }: { plays: Play[] }) {
  const latestWithCoord = plays.find((p) => p.x != null && p.y != null);
  const keyEvents = plays.filter(
    (p) =>
      p.x != null &&
      p.y != null &&
      (p.scoringPlay ||
        p.type === "Yellow Card" ||
        p.type === "Red Card" ||
        p.type?.toLowerCase().includes("shot") ||
        p.type?.toLowerCase().includes("save"))
  );

  return (
    <svg
      viewBox="0 0 105 68"
      className="w-full h-auto"
      style={{ maxHeight: 340 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grass */}
      <rect width="105" height="68" fill="#1a6b2a" rx="2" />
      {/* Alternating stripes */}
      {[0,1,2,3,4,5,6].map((i) => (
        <rect key={i} x={i * 15} width="15" height="68"
          fill={i % 2 === 0 ? "#1a6b2a" : "#1d7530"} />
      ))}

      {/* ── White lines ── */}
      <g fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="0.5">
        {/* Boundary */}
        <rect x="0.5" y="0.5" width="104" height="67" />
        {/* Halfway line */}
        <line x1="52.5" y1="0.5" x2="52.5" y2="67.5" />
        {/* Centre circle */}
        <circle cx="52.5" cy="34" r="9.15" />
        {/* Centre spot */}
        <circle cx="52.5" cy="34" r="0.4" fill="rgba(255,255,255,0.75)" stroke="none" />

        {/* Left penalty area */}
        <rect x="0.5" y="13.84" width="16.5" height="40.32" />
        {/* Left 6-yard box */}
        <rect x="0.5" y="24.84" width="5.5" height="18.32" />
        {/* Left penalty arc */}
        <path d="M 16.5 27.5 A 9.15 9.15 0 0 1 16.5 40.5" />
        {/* Left penalty spot */}
        <circle cx="11" cy="34" r="0.4" fill="rgba(255,255,255,0.75)" stroke="none" />

        {/* Right penalty area */}
        <rect x="88" y="13.84" width="16.5" height="40.32" />
        {/* Right 6-yard box */}
        <rect x="99" y="24.84" width="5.5" height="18.32" />
        {/* Right penalty arc */}
        <path d="M 88.5 27.5 A 9.15 9.15 0 0 0 88.5 40.5" />
        {/* Right penalty spot */}
        <circle cx="94" cy="34" r="0.4" fill="rgba(255,255,255,0.75)" stroke="none" />

        {/* Corner arcs */}
        <path d="M 0.5 3.5 A 3 3 0 0 1 3.5 0.5" />
        <path d="M 101.5 0.5 A 3 3 0 0 1 104.5 3.5" />
        <path d="M 104.5 64.5 A 3 3 0 0 1 101.5 67.5" />
        <path d="M 3.5 67.5 A 3 3 0 0 1 0.5 64.5" />
      </g>

      {/* Goals */}
      <rect x="-1.5" y="30.34" width="2" height="7.32"
        fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />
      <rect x="104.5" y="30.34" width="2" height="7.32"
        fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" />

      {/* Team labels */}
      <text x="26" y="64" textAnchor="middle" fontSize="3.5"
        fill="rgba(255,255,255,0.55)" fontFamily="sans-serif">HOME →</text>
      <text x="79" y="64" textAnchor="middle" fontSize="3.5"
        fill="rgba(255,255,255,0.55)" fontFamily="sans-serif">← AWAY</text>

      {/* Key event markers */}
      {keyEvents.slice(0, 20).map((p, i) => {
        if (p.x == null || p.y == null) return null;
        const isGoal = p.scoringPlay;
        const isYellow = p.type === "Yellow Card";
        const isRed = p.type === "Red Card";
        const isShot = p.type?.toLowerCase().includes("shot");
        const isSave = p.type?.toLowerCase().includes("save");
        const color = isGoal ? "#facc15"
          : isYellow ? "#fbbf24"
          : isRed ? "#ef4444"
          : isShot ? "rgba(255,255,255,0.7)"
          : isSave ? "#60a5fa"
          : "rgba(255,255,255,0.4)";
        const r = isGoal ? 2.2 : 1.4;
        return (
          <circle key={p.id + i} cx={p.x} cy={p.y} r={r}
            fill={color} opacity={0.85}
            stroke={isGoal ? "#fff" : "none"} strokeWidth="0.4" />
        );
      })}

      {/* Latest event — pulsing ring */}
      {latestWithCoord && latestWithCoord.x != null && latestWithCoord.y != null && (
        <g>
          <circle cx={latestWithCoord.x} cy={latestWithCoord.y} r="4"
            fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6">
            <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={latestWithCoord.x} cy={latestWithCoord.y} r="2"
            fill="white" opacity="0.9" />
        </g>
      )}

      {/* Legend */}
      <g fontSize="2.8" fontFamily="sans-serif" fill="rgba(255,255,255,0.6)">
        <circle cx="2" cy="3" r="1.1" fill="#facc15" />
        <text x="4" y="3.8">Goal</text>
        <circle cx="14" cy="3" r="1.1" fill="rgba(255,255,255,0.7)" />
        <text x="16" y="3.8">Shot</text>
        <circle cx="26" cy="3" r="1.1" fill="#60a5fa" />
        <text x="28" y="3.8">Save</text>
        <circle cx="38" cy="3" r="1.1" fill="white" opacity="0.9" />
        <text x="40" y="3.8">Last event</text>
      </g>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
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

  if (!data || !data.live || !data.match) return null;

  const { match, plays = [] } = data;
  const timeSince = lastUpdated
    ? Math.floor((Date.now() - lastUpdated.getTime()) / 1000)
    : 0;
  const halfLabel = match.period === 1 ? "上半場" : match.period === 2 ? "下半場" : `加時 ${match.period - 2}`;

  return (
    <section className="mb-8">
      {/* Header */}
      <div
        className="rounded-xl px-4 py-3 mb-3 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #e63900 0%, #b32200 100%)" }}
      >
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
          <h2 className="text-xl font-bold text-white">現在 LIVE 中</h2>
        </div>
        <span className="text-xs text-white/70">
          {timeSince < 120 ? `${timeSince}秒前更新` : `${Math.floor(timeSince / 60)}分前更新`}
        </span>
      </div>

      <div className="bg-[#0d1117] rounded-xl overflow-hidden border border-white/10 shadow-xl">
        {/* Scoreboard */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
          <p className="flex-1 text-right text-white font-bold text-lg">{match.homeTeam}</p>
          <div className="flex flex-col items-center gap-0.5 min-w-[110px]">
            <div className="text-3xl font-black text-white tabular-nums">
              {match.homeScore} <span className="text-white/40">–</span> {match.awayScore}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                {match.clock ? `${match.clock}′ · ${halfLabel}` : match.statusText}
              </span>
            </div>
            {match.venue && (
              <p className="text-[10px] text-white/35 text-center mt-0.5">{match.venue}</p>
            )}
          </div>
          <p className="flex-1 text-left text-white font-bold text-lg">{match.awayTeam}</p>
        </div>

        {/* Two-column: Pitch + Commentary */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr]">
          {/* Left — Pitch */}
          <div className="p-3 border-b md:border-b-0 md:border-r border-white/10 flex items-center justify-center bg-black/20">
            <PitchSVG plays={plays} />
          </div>

          {/* Right — Text feed */}
          <div className="max-h-[340px] overflow-y-auto">
            {plays.length === 0 ? (
              <div className="px-6 py-10 text-center text-white/40 text-sm">實況載入中…</div>
            ) : (
              <ul className="divide-y divide-white/5">
                {plays.map((play) => (
                  <li
                    key={play.id}
                    className={`px-4 py-2.5 flex gap-3 items-start ${
                      play.scoringPlay
                        ? "bg-yellow-500/10"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <span className="text-xs font-mono text-white/35 w-9 shrink-0 pt-0.5 text-right">
                      {play.clock ? `${play.clock}′` : "—"}
                    </span>
                    <span
                      className={`text-sm leading-snug ${
                        play.scoringPlay ? "text-yellow-300 font-semibold" : "text-white/75"
                      }`}
                    >
                      {play.scoringPlay && <span className="mr-1">⚽</span>}
                      {play.type === "Yellow Card" && <span className="mr-1">🟡</span>}
                      {play.type === "Red Card" && <span className="mr-1">🔴</span>}
                      {play.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
