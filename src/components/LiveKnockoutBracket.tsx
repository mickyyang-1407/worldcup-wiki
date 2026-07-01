"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TeamBadge from "./TeamBadge";
import { espnNameToSlug, espnStatusToLocal } from "@/lib/espnTeamMap";

interface MatchupTeam {
  label: string;
  teamId?: string;
  isConfirmed: boolean;
  isWinner: boolean;
  isLoser: boolean;
  score?: number;
  shootoutScore?: number;
}

interface Matchup {
  id: string;
  matchNumber: number;
  timeStr?: string;
  status: string; // "completed" | "live" | "scheduled"
  home: MatchupTeam;
  away: MatchupTeam;
}

interface ParsedMatch {
  homeSlug: string;
  awaySlug: string;
  homeDisplayName: string;
  awayDisplayName: string;
  homeScore?: number;
  awayScore?: number;
  homeShootout?: number;
  awayShootout?: number;
  winner: string | null;
  status: string;
  stage: string;
  date: string;
}

const R32_MATCH_NUMS = [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88];
const R16_NUMS = [89, 90, 91, 92, 93, 94, 95, 96];

interface Pairing {
  home: string;
  away: string;
  homeName: string;
  awayName: string;
}

const R32_PAIRINGS: Record<number, Pairing> = {
  73: { home: "south-africa", away: "canada", homeName: "South Africa", awayName: "Canada" },
  74: { home: "germany", away: "paraguay", homeName: "Germany", awayName: "Paraguay" },
  75: { home: "netherlands", away: "morocco", homeName: "Netherlands", awayName: "Morocco" },
  76: { home: "brazil", away: "japan", homeName: "Brazil", awayName: "Japan" },
  77: { home: "france", away: "sweden", homeName: "France", awayName: "Sweden" },
  78: { home: "ivory-coast", away: "norway", homeName: "Ivory Coast", awayName: "Norway" },
  79: { home: "mexico", away: "ecuador", homeName: "Mexico", awayName: "Ecuador" },
  80: { home: "england", away: "dr-congo", homeName: "England", awayName: "DR Congo" },
  81: { home: "united-states", away: "bosnia-and-herzegovina", homeName: "United States", awayName: "Bosnia" },
  82: { home: "belgium", away: "senegal", homeName: "Belgium", awayName: "Senegal" },
  83: { home: "portugal", away: "croatia", homeName: "Portugal", awayName: "Croatia" },
  84: { home: "spain", away: "austria", homeName: "Spain", awayName: "Austria" },
  85: { home: "switzerland", away: "algeria", homeName: "Switzerland", awayName: "Algeria" },
  86: { home: "argentina", away: "cape-verde", homeName: "Argentina", awayName: "Cape Verde" },
  87: { home: "colombia", away: "ghana", homeName: "Colombia", awayName: "Ghana" },
  88: { home: "australia", away: "egypt", homeName: "Australia", awayName: "Egypt" },
};

const R32_TO_R16: Record<number, { home: number; away: number }> = {
  89: { home: 73, away: 75 },
  90: { home: 74, away: 77 },
  91: { home: 76, away: 78 },
  92: { home: 79, away: 80 },
  93: { home: 83, away: 84 },
  94: { home: 81, away: 82 },
  95: { home: 86, away: 88 },
  96: { home: 85, away: 87 },
};

const R16_TO_QF: Record<number, { home: number; away: number }> = {
  97: { home: 89, away: 90 },
  98: { home: 91, away: 92 },
  99: { home: 93, away: 94 },
  100: { home: 95, away: 96 },
};

const QF_TO_SF: Record<number, { home: number; away: number }> = {
  101: { home: 97, away: 98 },
  102: { home: 99, away: 100 },
};

const SF_TO_FINAL: Record<number, { home: number; away: number }> = {
  104: { home: 101, away: 102 },
};

function formatToTaipeiTime(datetimeUtc: string) {
  try {
    const d = new Date(datetimeUtc);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("zh-TW", {
      timeZone: "Asia/Taipei",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  } catch {
    return "";
  }
}

function getDateRange() {
  const now = new Date();
  const past = new Date(now.getTime() - 21 * 24 * 3600000);
  const future = new Date(now.getTime() + 21 * 24 * 3600000);
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `${fmt(past)}-${fmt(future)}`;
}

// Interactive Match Card component
function MatchCard({ matchup }: { matchup?: Matchup }) {
  if (!matchup) {
    return (
      <div className="w-[190px] h-[72px] bg-slate-900/30 border border-dashed border-slate-800 rounded-xl flex items-center justify-center">
        <span className="text-slate-600 text-xs italic">未排定比賽</span>
      </div>
    );
  }

  const { home, away, status, timeStr, matchNumber } = matchup;
  const isLive = status === "live";
  const isCompleted = status === "completed";

  const renderTeamRow = (team: MatchupTeam) => {
    const isTBD = !team.isConfirmed || !team.teamId;

    return (
      <div
        className={`flex items-center justify-between h-[30px] px-2.5 transition-all duration-300
          ${team.isWinner ? "bg-amber-500/10 text-amber-300 font-semibold" : "text-slate-300"}
          ${team.isLoser ? "opacity-35" : ""}
        `}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isTBD ? (
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[9px] text-slate-500 font-mono">
                ?
              </span>
              <span className="text-[11px] text-slate-500 italic tracking-wide">TBD</span>
            </div>
          ) : (
            <TeamBadge
              teamId={team.teamId!}
              size="sm"
              linkable={false}
              showName={true}
              className={`text-[11px] truncate max-w-[105px] ${
                team.isWinner ? "text-amber-300 font-bold" : "text-slate-200 font-medium"
              }`}
            />
          )}
        </div>

        {/* Score Display */}
        {!isTBD && (isCompleted || isLive) && (
          <div className="flex items-center gap-1 font-mono text-[11px]">
            {team.shootoutScore !== undefined && (
              <span className="text-[9px] text-slate-400 font-normal">
                ({team.shootoutScore})
              </span>
            )}
            <span
              className={`px-1.5 py-0.5 rounded text-center min-w-[18px]
                ${
                  team.isWinner
                    ? "bg-amber-400 text-slate-950 font-black shadow-[0_0_6px_rgba(251,191,36,0.4)]"
                    : "bg-slate-800 text-slate-300"
                }
              `}
            >
              {team.score ?? 0}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`w-[190px] bg-slate-900/90 border rounded-xl overflow-hidden shadow-lg shadow-black/40 transition-all duration-300 group
        ${isLive ? "border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20" : "border-slate-800/80"}
        ${isCompleted ? "hover:border-amber-400/40" : "hover:border-slate-700"}
        hover:scale-[1.02] hover:shadow-xl hover:shadow-black/50
      `}
    >
      {/* Header Info */}
      <div className="bg-slate-950/80 px-2.5 py-1 text-[9px] text-slate-400 flex justify-between items-center border-b border-slate-800/60 font-semibold tracking-wide">
        <span className="text-slate-500 font-bold">M{matchNumber}</span>
        {isLive ? (
          <span className="flex items-center gap-1 text-red-400 font-bold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            LIVE
          </span>
        ) : isCompleted ? (
          <span className="text-slate-500 font-black tracking-widest">FT</span>
        ) : (
          <span className="text-slate-400 font-normal">{timeStr || "TBD"}</span>
        )}
      </div>

      {/* Teams Container */}
      <div className="py-1 flex flex-col divide-y divide-slate-800/40">
        {renderTeamRow(home)}
        {renderTeamRow(away)}
      </div>
    </div>
  );
}

// MatchGroup component for rendering layout & connecting lines
interface MatchGroupProps {
  side: "left" | "right";
  height: number; // 200 | 400 | 800
  matchTop: Matchup;
  matchBottom: Matchup;
  highlightTop?: boolean;
  highlightBottom?: boolean;
  highlightExport?: boolean;
  renderMatch: (m: Matchup) => React.ReactNode;
}

function MatchGroup({
  side,
  height,
  matchTop,
  matchBottom,
  highlightTop = false,
  highlightBottom = false,
  highlightExport = false,
  renderMatch,
}: MatchGroupProps) {
  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      {/* Top Match */}
      <div className="absolute top-[calc(25%-36px)] inset-x-0 flex justify-center z-10">
        {renderMatch(matchTop)}
      </div>

      {/* Bottom Match */}
      <div className="absolute top-[calc(75%-36px)] inset-x-0 flex justify-center z-10">
        {renderMatch(matchBottom)}
      </div>

      {/* Connection Lines (Desktop only) */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        {/* Top Horizontal Line */}
        <div
          className={`absolute top-[25%] h-[2px] w-[20px] 
            ${side === "left" ? "right-[15px]" : "left-[15px]"} 
            ${highlightTop ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "bg-slate-800"}`}
        />

        {/* Bottom Horizontal Line */}
        <div
          className={`absolute top-[75%] h-[2px] w-[20px] 
            ${side === "left" ? "right-[15px]" : "left-[15px]"} 
            ${highlightBottom ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "bg-slate-800"}`}
        />

        {/* Vertical Connector Line */}
        <div
          className={`absolute top-[25%] bottom-[25%] w-[2px] 
            ${side === "left" ? "right-[15px]" : "left-[15px]"}`}
          style={{
            background:
              highlightTop && highlightBottom
                ? "#fbbf24"
                : highlightTop
                ? "linear-gradient(to bottom, #fbbf24, #1e293b)"
                : highlightBottom
                ? "linear-gradient(to top, #fbbf24, #1e293b)"
                : "#1e293b",
            boxShadow:
              highlightTop || highlightBottom
                ? "0 0 6px rgba(251, 191, 36, 0.3)"
                : "none",
          }}
        />

        {/* Export Horizontal Line (crosses column boundary) */}
        <div
          className={`absolute top-[50%] h-[2px] w-[25px] 
            ${side === "left" ? "right-[-10px]" : "left-[-10px]"} 
            ${highlightExport ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "bg-slate-800"}`}
        />
      </div>
    </div>
  );
}

export default function LiveKnockoutBracket() {
  const [loading, setLoading] = useState(true);
  const [matchups, setMatchups] = useState<Record<string, Matchup>>({});
  const [activeView, setActiveView] = useState<"bracket" | "rounds">("bracket");
  const [activeRoundTab, setActiveRoundTab] = useState<string>("r32");

  useEffect(() => {
    const dateRange = getDateRange();
    fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateRange}&limit=100`,
      { cache: "no-store" }
    )
      .then((r) => {
        if (!r.ok) throw new Error("ESPN fetch failed");
        return r.json();
      })
      .then((data) => {
        const events: any[] = data.events || [];

        const parsed: ParsedMatch[] = events.map((event) => {
          const comp = event.competitions?.[0] || {};
          const competitors: any[] = comp.competitors || [];
          const homeComp = competitors.find((c) => c.homeAway === "home");
          const awayComp = competitors.find((c) => c.homeAway === "away");
          const espnStatus = comp.status?.type?.name || "";
          const status = espnStatusToLocal(espnStatus);
          const homeDisplayName: string = homeComp?.team?.displayName || "";
          const awayDisplayName: string = awayComp?.team?.displayName || "";
          const homeSlug = espnNameToSlug(homeDisplayName);
          const awaySlug = espnNameToSlug(awayDisplayName);
          let winner =
            homeComp?.winner === true || homeComp?.winner === "true"
              ? homeSlug
              : awayComp?.winner === true || awayComp?.winner === "true"
              ? awaySlug
              : null;

          if (!winner && status === "completed") {
            const homeScore = homeComp?.score !== undefined ? parseInt(homeComp.score) : 0;
            const awayScore = awayComp?.score !== undefined ? parseInt(awayComp.score) : 0;
            if (homeScore > awayScore) {
              winner = homeSlug;
            } else if (awayScore > homeScore) {
              winner = awaySlug;
            } else {
              const homeShootout = homeComp?.shootoutScore !== undefined ? parseInt(homeComp.shootoutScore) : 0;
              const awayShootout = awayComp?.shootoutScore !== undefined ? parseInt(awayComp.shootoutScore) : 0;
              if (homeShootout > awayShootout) {
                winner = homeSlug;
              } else if (awayShootout > homeShootout) {
                winner = awaySlug;
              }
            }
          }
          const stage = "knockout"; // Ignore date staging for lookup mapping
          return {
            homeSlug,
            awaySlug,
            homeDisplayName,
            awayDisplayName,
            homeScore: homeComp?.score !== undefined ? parseInt(homeComp.score) : undefined,
            awayScore: awayComp?.score !== undefined ? parseInt(awayComp.score) : undefined,
            homeShootout: homeComp?.shootoutScore !== undefined ? parseInt(homeComp.shootoutScore) : undefined,
            awayShootout: awayComp?.shootoutScore !== undefined ? parseInt(awayComp.shootoutScore) : undefined,
            winner,
            status,
            stage,
            date: event.date || "",
          };
        });

        // Global lookup map by slug pairs
        const globalLut: Record<string, ParsedMatch> = {};
        parsed.forEach((m) => {
          globalLut[`${m.homeSlug}|${m.awaySlug}`] = m;
          globalLut[`${m.awaySlug}|${m.homeSlug}`] = m;
        });

        const winners: Record<number, { slug: string; name: string }> = {};
        const inferredMatchups: Record<string, Matchup> = {};

        // Helper: Resolve a matchup using bottom-up mapping
        function resolveMatchup(
          matchNum: number,
          homeTeam: { slug?: string; name: string },
          awayTeam: { slug?: string; name: string }
        ): Matchup {
          const emptyMatch: Matchup = {
            id: `M${matchNum}`,
            matchNumber: matchNum,
            status: "scheduled",
            home: homeTeam.slug
              ? { label: homeTeam.name, teamId: homeTeam.slug, isConfirmed: true, isWinner: false, isLoser: false }
              : { label: homeTeam.name, isConfirmed: false, isWinner: false, isLoser: false },
            away: awayTeam.slug
              ? { label: awayTeam.name, teamId: awayTeam.slug, isConfirmed: true, isWinner: false, isLoser: false }
              : { label: awayTeam.name, isConfirmed: false, isWinner: false, isLoser: false },
          };

          if (!homeTeam.slug || !awayTeam.slug) {
            return emptyMatch;
          }

          const m = globalLut[`${homeTeam.slug}|${awayTeam.slug}`];
          if (!m) {
            return emptyMatch;
          }

          const isCompleted = m.status === "completed";
          let isHomeWinner = false;
          let isAwayWinner = false;
          let isHomeLoser = false;
          let isAwayLoser = false;

          if (isCompleted && m.winner) {
            isHomeWinner = m.winner === homeTeam.slug;
            isAwayWinner = m.winner === awayTeam.slug;
            isHomeLoser = !isHomeWinner;
            isAwayLoser = !isAwayWinner;

            winners[matchNum] = {
              slug: m.winner,
              name: isHomeWinner ? m.homeDisplayName : m.awayDisplayName,
            };
          }

          return {
            id: `M${matchNum}`,
            matchNumber: matchNum,
            timeStr: formatToTaipeiTime(m.date),
            status: m.status,
            home: {
              label: m.homeSlug === homeTeam.slug ? m.homeDisplayName : m.awayDisplayName,
              teamId: homeTeam.slug,
              isConfirmed: true,
              isWinner: isHomeWinner,
              isLoser: isHomeLoser,
              score: m.homeSlug === homeTeam.slug ? m.homeScore : m.awayScore,
              shootoutScore: m.homeSlug === homeTeam.slug ? m.homeShootout : m.awayShootout,
            },
            away: {
              label: m.awaySlug === awayTeam.slug ? m.awayDisplayName : m.homeDisplayName,
              teamId: awayTeam.slug,
              isConfirmed: true,
              isWinner: isAwayWinner,
              isLoser: isAwayLoser,
              score: m.awaySlug === awayTeam.slug ? m.awayScore : m.homeScore,
              shootoutScore: m.awaySlug === awayTeam.slug ? m.awayShootout : m.homeShootout,
            },
          };
        }

        // 1. Resolve R32
        R32_MATCH_NUMS.forEach((num) => {
          const p = R32_PAIRINGS[num];
          inferredMatchups[`M${num}`] = resolveMatchup(
            num,
            { slug: p.home, name: p.homeName },
            { slug: p.away, name: p.awayName }
          );
        });

        // 2. Resolve R16
        R16_NUMS.forEach((num) => {
          const sources = R32_TO_R16[num];
          const homeWinner = winners[sources.home];
          const awayWinner = winners[sources.away];
          inferredMatchups[`M${num}`] = resolveMatchup(
            num,
            homeWinner ? { slug: homeWinner.slug, name: homeWinner.name } : { name: "TBD" },
            awayWinner ? { slug: awayWinner.slug, name: awayWinner.name } : { name: "TBD" }
          );
        });

        // 3. Resolve QF (97-100)
        [97, 98, 99, 100].forEach((num) => {
          const sources = R16_TO_QF[num];
          const homeWinner = winners[sources.home];
          const awayWinner = winners[sources.away];
          inferredMatchups[`M${num}`] = resolveMatchup(
            num,
            homeWinner ? { slug: homeWinner.slug, name: homeWinner.name } : { name: "TBD" },
            awayWinner ? { slug: awayWinner.slug, name: awayWinner.name } : { name: "TBD" }
          );
        });

        // 4. Resolve SF (101-102)
        [101, 102].forEach((num) => {
          const sources = QF_TO_SF[num];
          const homeWinner = winners[sources.home];
          const awayWinner = winners[sources.away];
          inferredMatchups[`M${num}`] = resolveMatchup(
            num,
            homeWinner ? { slug: homeWinner.slug, name: homeWinner.name } : { name: "TBD" },
            awayWinner ? { slug: awayWinner.slug, name: awayWinner.name } : { name: "TBD" }
          );
        });

        // 5. Resolve Final (104)
        const finalNum = 104;
        const finalSources = SF_TO_FINAL[finalNum];
        const finalHomeWinner = winners[finalSources.home];
        const finalAwayWinner = winners[finalSources.away];
        inferredMatchups[`M${finalNum}`] = resolveMatchup(
          finalNum,
          finalHomeWinner ? { slug: finalHomeWinner.slug, name: finalHomeWinner.name } : { name: "TBD" },
          finalAwayWinner ? { slug: finalAwayWinner.slug, name: finalAwayWinner.name } : { name: "TBD" }
        );

        setMatchups(inferredMatchups);
        setLoading(false);
      })
      .catch(() => {
        // Fallback: Populate all as empty matchups
        const fallbackMatchups: Record<string, Matchup> = {};
        [...R32_MATCH_NUMS, ...R16_NUMS, 97, 98, 99, 100, 101, 102, 104].forEach((n) => {
          fallbackMatchups[`M${n}`] = {
            id: `M${n}`,
            matchNumber: n,
            status: "scheduled",
            home: { label: "TBD", isConfirmed: false, isWinner: false, isLoser: false },
            away: { label: "TBD", isConfirmed: false, isWinner: false, isLoser: false },
          };
        });
        setMatchups(fallbackMatchups);
        setLoading(false);
      });
  }, []);

  const renderMatch = (matchup?: Matchup) => {
    return <MatchCard matchup={matchup} />;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 bg-slate-950 rounded-2xl border border-slate-900 shadow-2xl">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
        </div>
        <span className="text-slate-400 text-sm mt-4 tracking-wider animate-pulse">載入世界盃淘汰賽數據中...</span>
      </div>
    );
  }

  // Bracket View (horizontal layout with connecting lines)
  const renderBracketView = () => {
    return (
      <div className="relative w-full overflow-x-auto select-none pb-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950">
        <div className="min-w-[1550px] h-[820px] flex items-stretch bg-slate-950/70 rounded-2xl border border-slate-900/80 p-6 relative overflow-hidden backdrop-blur-sm">
          {/* Overlay aesthetic effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,41,59,0.3),transparent)] pointer-events-none" />

          {/* Col 1: R32 Left */}
          <div className="w-[220px] flex flex-col justify-between h-full relative z-10">
            <div className="text-center py-2 border-b border-slate-800/40 mb-2">
              <span className="text-[10px] font-black text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">32強 (左半區)</span>
            </div>
            <div className="flex-1 flex flex-col justify-between py-1">
              <MatchGroup
                side="left"
                height={170}
                matchTop={matchups["M73"]}
                matchBottom={matchups["M75"]}
                highlightTop={matchups["M73"]?.status === "completed"}
                highlightBottom={matchups["M75"]?.status === "completed"}
                highlightExport={matchups["M73"]?.status === "completed" && matchups["M75"]?.status === "completed"}
                renderMatch={renderMatch}
              />
              <MatchGroup
                side="left"
                height={170}
                matchTop={matchups["M74"]}
                matchBottom={matchups["M77"]}
                highlightTop={matchups["M74"]?.status === "completed"}
                highlightBottom={matchups["M77"]?.status === "completed"}
                highlightExport={matchups["M74"]?.status === "completed" && matchups["M77"]?.status === "completed"}
                renderMatch={renderMatch}
              />
              <MatchGroup
                side="left"
                height={170}
                matchTop={matchups["M76"]}
                matchBottom={matchups["M78"]}
                highlightTop={matchups["M76"]?.status === "completed"}
                highlightBottom={matchups["M78"]?.status === "completed"}
                highlightExport={matchups["M76"]?.status === "completed" && matchups["M78"]?.status === "completed"}
                renderMatch={renderMatch}
              />
              <MatchGroup
                side="left"
                height={170}
                matchTop={matchups["M79"]}
                matchBottom={matchups["M80"]}
                highlightTop={matchups["M79"]?.status === "completed"}
                highlightBottom={matchups["M80"]?.status === "completed"}
                highlightExport={matchups["M79"]?.status === "completed" && matchups["M80"]?.status === "completed"}
                renderMatch={renderMatch}
              />
            </div>
          </div>

          {/* Col 2: R16 Left */}
          <div className="w-[220px] flex flex-col justify-between h-full relative z-10">
            <div className="text-center py-2 border-b border-slate-800/40 mb-2">
              <span className="text-[10px] font-black text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">16強 (左半區)</span>
            </div>
            <div className="flex-1 flex flex-col justify-around py-4">
              <MatchGroup
                side="left"
                height={340}
                matchTop={matchups["M89"]}
                matchBottom={matchups["M90"]}
                highlightTop={matchups["M89"]?.status === "completed"}
                highlightBottom={matchups["M90"]?.status === "completed"}
                highlightExport={matchups["M89"]?.status === "completed" && matchups["M90"]?.status === "completed"}
                renderMatch={renderMatch}
              />
              <MatchGroup
                side="left"
                height={340}
                matchTop={matchups["M91"]}
                matchBottom={matchups["M92"]}
                highlightTop={matchups["M91"]?.status === "completed"}
                highlightBottom={matchups["M92"]?.status === "completed"}
                highlightExport={matchups["M91"]?.status === "completed" && matchups["M92"]?.status === "completed"}
                renderMatch={renderMatch}
              />
            </div>
          </div>

          {/* Col 3: QF Left */}
          <div className="w-[220px] flex flex-col justify-between h-full relative z-10">
            <div className="text-center py-2 border-b border-slate-800/40 mb-2">
              <span className="text-[10px] font-black text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">8強 (左半區)</span>
            </div>
            <div className="flex-1 flex flex-col justify-center py-4">
              <MatchGroup
                side="left"
                height={680}
                matchTop={matchups["M97"]}
                matchBottom={matchups["M98"]}
                highlightTop={matchups["M97"]?.status === "completed"}
                highlightBottom={matchups["M98"]?.status === "completed"}
                highlightExport={matchups["M97"]?.status === "completed" && matchups["M98"]?.status === "completed"}
                renderMatch={renderMatch}
              />
            </div>
          </div>

          {/* Col 4: SF Left */}
          <div className="w-[220px] flex flex-col justify-between h-full relative z-10">
            <div className="text-center py-2 border-b border-slate-800/40 mb-2">
              <span className="text-[10px] font-black text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">準決賽 (左)</span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center relative">
              <MatchCard matchup={matchups["M101"]} />
              
              {/* Connector from SF Left to Final */}
              <div className="absolute inset-0 pointer-events-none hidden md:block">
                <div
                  className={`absolute top-[50%] h-[2px] w-[30px] right-[-15px]
                    ${matchups["M101"]?.status === "completed" ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "bg-slate-800"}`}
                />
              </div>
            </div>
          </div>

          {/* Col 5: Center Final */}
          <div className="w-[230px] flex flex-col justify-between h-full relative z-10 border-x border-slate-900/60 bg-slate-950/20 px-3">
            <div className="text-center py-2 border-b border-slate-800/40 mb-2">
              <span className="text-[10px] font-black text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full uppercase tracking-wider font-extrabold animate-pulse">🏆 決賽 🏆</span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center relative">
              {/* Champion gold icon and glow */}
              <div className="absolute top-[26%] flex flex-col items-center gap-1">
                <span className="text-4xl filter drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-bounce duration-1000">🏆</span>
                <span className="text-[9px] uppercase tracking-widest text-amber-400 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">2026 WORLD CHAMPION</span>
              </div>
              
              <MatchCard matchup={matchups["M104"]} />
            </div>
          </div>

          {/* Col 6: SF Right */}
          <div className="w-[220px] flex flex-col justify-between h-full relative z-10">
            <div className="text-center py-2 border-b border-slate-800/40 mb-2">
              <span className="text-[10px] font-black text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">準決賽 (右)</span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center relative">
              <MatchCard matchup={matchups["M102"]} />
              
              {/* Connector from SF Right to Final */}
              <div className="absolute inset-0 pointer-events-none hidden md:block">
                <div
                  className={`absolute top-[50%] h-[2px] w-[30px] left-[-15px]
                    ${matchups["M102"]?.status === "completed" ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "bg-slate-800"}`}
                />
              </div>
            </div>
          </div>

          {/* Col 7: QF Right */}
          <div className="w-[220px] flex flex-col justify-between h-full relative z-10">
            <div className="text-center py-2 border-b border-slate-800/40 mb-2">
              <span className="text-[10px] font-black text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">8強 (右半區)</span>
            </div>
            <div className="flex-1 flex flex-col justify-center py-4">
              <MatchGroup
                side="right"
                height={680}
                matchTop={matchups["M99"]}
                matchBottom={matchups["M100"]}
                highlightTop={matchups["M99"]?.status === "completed"}
                highlightBottom={matchups["M100"]?.status === "completed"}
                highlightExport={matchups["M99"]?.status === "completed" && matchups["M100"]?.status === "completed"}
                renderMatch={renderMatch}
              />
            </div>
          </div>

          {/* Col 8: R16 Right */}
          <div className="w-[220px] flex flex-col justify-between h-full relative z-10">
            <div className="text-center py-2 border-b border-slate-800/40 mb-2">
              <span className="text-[10px] font-black text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">16強 (右半區)</span>
            </div>
            <div className="flex-1 flex flex-col justify-around py-4">
              <MatchGroup
                side="right"
                height={340}
                matchTop={matchups["M93"]}
                matchBottom={matchups["M94"]}
                highlightTop={matchups["M93"]?.status === "completed"}
                highlightBottom={matchups["M94"]?.status === "completed"}
                highlightExport={matchups["M93"]?.status === "completed" && matchups["M94"]?.status === "completed"}
                renderMatch={renderMatch}
              />
              <MatchGroup
                side="right"
                height={340}
                matchTop={matchups["M95"]}
                matchBottom={matchups["M96"]}
                highlightTop={matchups["M95"]?.status === "completed"}
                highlightBottom={matchups["M96"]?.status === "completed"}
                highlightExport={matchups["M95"]?.status === "completed" && matchups["M96"]?.status === "completed"}
                renderMatch={renderMatch}
              />
            </div>
          </div>

          {/* Col 9: R32 Right */}
          <div className="w-[220px] flex flex-col justify-between h-full relative z-10">
            <div className="text-center py-2 border-b border-slate-800/40 mb-2">
              <span className="text-[10px] font-black text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">32強 (右半區)</span>
            </div>
            <div className="flex-1 flex flex-col justify-between py-1">
              <MatchGroup
                side="right"
                height={170}
                matchTop={matchups["M83"]}
                matchBottom={matchups["M84"]}
                highlightTop={matchups["M83"]?.status === "completed"}
                highlightBottom={matchups["M84"]?.status === "completed"}
                highlightExport={matchups["M83"]?.status === "completed" && matchups["M84"]?.status === "completed"}
                renderMatch={renderMatch}
              />
              <MatchGroup
                side="right"
                height={170}
                matchTop={matchups["M81"]}
                matchBottom={matchups["M82"]}
                highlightTop={matchups["M81"]?.status === "completed"}
                highlightBottom={matchups["M82"]?.status === "completed"}
                highlightExport={matchups["M81"]?.status === "completed" && matchups["M82"]?.status === "completed"}
                renderMatch={renderMatch}
              />
              <MatchGroup
                side="right"
                height={170}
                matchTop={matchups["M86"]}
                matchBottom={matchups["M88"]}
                highlightTop={matchups["M86"]?.status === "completed"}
                highlightBottom={matchups["M88"]?.status === "completed"}
                highlightExport={matchups["M86"]?.status === "completed" && matchups["M88"]?.status === "completed"}
                renderMatch={renderMatch}
              />
              <MatchGroup
                side="right"
                height={170}
                matchTop={matchups["M85"]}
                matchBottom={matchups["M87"]}
                highlightTop={matchups["M85"]?.status === "completed"}
                highlightBottom={matchups["M87"]?.status === "completed"}
                highlightExport={matchups["M85"]?.status === "completed" && matchups["M87"]?.status === "completed"}
                renderMatch={renderMatch}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Rounds View (ideal for mobile layout list)
  const renderRoundsView = () => {
    const roundMatches: Record<string, string[]> = {
      r32: ["M73", "M74", "M75", "M76", "M77", "M78", "M79", "M80", "M81", "M82", "M83", "M84", "M85", "M86", "M87", "M88"],
      r16: ["M89", "M90", "M91", "M92", "M93", "M94", "M95", "M96"],
      qf: ["M97", "M98", "M99", "M100"],
      sf: ["M101", "M102"],
      final: ["M104"],
    };

    const currentMatches = roundMatches[activeRoundTab] || [];

    const tabs = [
      { id: "r32", name: "32強" },
      { id: "r16", name: "16強" },
      { id: "qf", name: "8強" },
      { id: "sf", name: "準決賽" },
      { id: "final", name: "決賽" },
    ];

    return (
      <div className="w-full bg-slate-950 border border-slate-900 rounded-2xl p-4">
        {/* Round Tab Selector */}
        <div className="flex border-b border-slate-800 mb-6 overflow-x-auto gap-2 pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveRoundTab(t.id)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 whitespace-nowrap
                ${
                  activeRoundTab === t.id
                    ? "bg-amber-500 text-slate-950 font-black shadow-lg"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }
              `}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Match cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
          {currentMatches.map((mid) => {
            const matchup = matchups[mid];
            return (
              <div key={mid} className="w-full max-w-[280px] flex justify-center">
                {/* Scale the MatchCard slightly larger in mobile list for better readability */}
                <div className="scale-105 my-2">
                  <MatchCard matchup={matchup} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full text-slate-100">
      {/* View Switcher Controls */}
      <div className="flex justify-between items-center mb-6 bg-slate-950/80 p-2 rounded-xl border border-slate-900/50">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="text-xs text-slate-400 font-medium">即時淘汰賽晉級追蹤</span>
        </div>
        <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveView("bracket")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-all duration-200
              ${
                activeView === "bracket"
                  ? "bg-slate-800 text-amber-400 shadow-sm font-black"
                  : "text-slate-400 hover:text-slate-200"
              }
            `}
          >
            🏆 樹狀圖
          </button>
          <button
            onClick={() => setActiveView("rounds")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-all duration-200
              ${
                activeView === "rounds"
                  ? "bg-slate-800 text-amber-400 shadow-sm font-black"
                  : "text-slate-400 hover:text-slate-200"
              }
            `}
          >
            📋 輪次清單
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {activeView === "bracket" ? renderBracketView() : renderRoundsView()}

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-950/40 border border-slate-900/30 rounded-xl px-4 py-3 text-[10px] text-slate-500 font-medium">
        <span>* 數據來源：ESPN。淘汰賽小組賽結束後，晉級國家隊將即時更新。</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-1.5 bg-amber-400 rounded-sm"></span> 黃金晉級路徑
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-1.5 bg-slate-800 rounded-sm"></span> 待踢 / 未開賽
          </span>
        </div>
      </div>
    </div>
  );
}
