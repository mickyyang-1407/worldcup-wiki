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
}

interface Matchup {
  id: string;
  matchNumber: number;
  timeStr?: string;
  status: string;
  home: MatchupTeam;
  away: MatchupTeam;
}

interface ParsedMatch {
  homeSlug: string;
  awaySlug: string;
  homeDisplayName: string;
  awayDisplayName: string;
  winner: string | null;
  status: string;
  stage: string;
  date: string;
}

const R32_MATCH_NUMS = [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88];
const R16_NUMS = [89, 90, 91, 92, 93, 94, 95, 96];
const LATER_NUMS = [97, 98, 99, 100, 101, 102, 104];

const R32_PAIRINGS: Record<number, { home: string; away: string }> = {
  73: { home: "south-africa", away: "canada" },
  74: { home: "germany", away: "paraguay" },
  75: { home: "netherlands", away: "morocco" },
  76: { home: "brazil", away: "japan" },
  77: { home: "france", away: "sweden" },
  78: { home: "ivory-coast", away: "norway" },
  79: { home: "mexico", away: "ecuador" },
  80: { home: "england", away: "dr-congo" },
  81: { home: "united-states", away: "bosnia-and-herzegovina" },
  82: { home: "belgium", away: "senegal" },
  83: { home: "portugal", away: "croatia" },
  84: { home: "spain", away: "austria" },
  85: { home: "switzerland", away: "algeria" },
  86: { home: "argentina", away: "cape-verde" },
  87: { home: "colombia", away: "ghana" },
  88: { home: "australia", away: "egypt" },
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

function getStageFromDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  if (month === 6 && day >= 28) return "round-of-32";
  if (month === 7) {
    if (day <= 2) return "round-of-32";
    if (day <= 7) return "round-of-16";
    if (day <= 12) return "quarter-finals";
    if (day <= 16) return "semi-finals";
    if (day <= 18) return "third-place";
    if (day === 19) return "final";
  }
  return "group";
}

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

function createEmptyMatchup(matchNum: number): Matchup {
  return {
    id: `M${matchNum}`,
    matchNumber: matchNum,
    status: "scheduled",
    home: { label: "TBD", isConfirmed: false, isWinner: false, isLoser: false },
    away: { label: "TBD", isConfirmed: false, isWinner: false, isLoser: false },
  };
}

export default function LiveKnockoutBracket() {
  const [loading, setLoading] = useState(true);
  const [matchups, setMatchups] = useState<Record<string, Matchup>>({});

  useEffect(() => {
    fetch(
      "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260628-20260707&limit=100",
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
          const winner =
            homeComp?.winner === true
              ? homeSlug
              : awayComp?.winner === true
              ? awaySlug
              : null;
          const stage = getStageFromDate(event.date || "");
          return {
            homeSlug,
            awaySlug,
            homeDisplayName,
            awayDisplayName,
            winner,
            status,
            stage,
            date: event.date || "",
          };
        });

        // Build lookup by team pair
        const makeLookup = (matches: ParsedMatch[]) => {
          const lut: Record<string, ParsedMatch> = {};
          matches.forEach((m) => {
            lut[`${m.homeSlug}|${m.awaySlug}`] = m;
            lut[`${m.awaySlug}|${m.homeSlug}`] = m;
          });
          return lut;
        };

        const r32Lut = makeLookup(parsed.filter((m) => m.stage === "round-of-32"));
        const r16Lut = makeLookup(parsed.filter((m) => m.stage === "round-of-16"));

        // R32 winners: matchNum → { slug, name }
        const r32Winners: Record<number, { slug: string; name: string }> = {};

        const r32Matchups: Record<number, Matchup> = {};
        for (const matchNum of R32_MATCH_NUMS) {
          const pairing = R32_PAIRINGS[matchNum];
          if (!pairing) {
            r32Matchups[matchNum] = createEmptyMatchup(matchNum);
            continue;
          }

          const m = r32Lut[`${pairing.home}|${pairing.away}`];
          if (m && m.status === "completed" && m.winner) {
            const isHomeWinner = m.winner === m.homeSlug;
            r32Winners[matchNum] = {
              slug: m.winner,
              name: isHomeWinner ? m.homeDisplayName : m.awayDisplayName,
            };
            r32Matchups[matchNum] = {
              id: `M${matchNum}`,
              matchNumber: matchNum,
              timeStr: formatToTaipeiTime(m.date),
              status: "completed",
              home: {
                label: m.homeDisplayName,
                teamId: m.homeSlug,
                isConfirmed: true,
                isWinner: isHomeWinner,
                isLoser: !isHomeWinner,
              },
              away: {
                label: m.awayDisplayName,
                teamId: m.awaySlug,
                isConfirmed: true,
                isWinner: !isHomeWinner,
                isLoser: isHomeWinner,
              },
            };
          } else {
            // Not completed → empty, never guess
            r32Matchups[matchNum] = createEmptyMatchup(matchNum);
          }
        }

        // R16: only show if the actual R16 match is completed in ESPN data
        const r16Matchups: Record<number, Matchup> = {};
        for (const r16Num of R16_NUMS) {
          const sources = R32_TO_R16[r16Num];
          if (!sources) {
            r16Matchups[r16Num] = createEmptyMatchup(r16Num);
            continue;
          }

          const homeWinner = r32Winners[sources.home];
          const awayWinner = r32Winners[sources.away];

          if (!homeWinner || !awayWinner) {
            // R32 not done → R16 participants unknown
            r16Matchups[r16Num] = createEmptyMatchup(r16Num);
            continue;
          }

          // Look for a completed R16 match with exactly these two teams
          const m = r16Lut[`${homeWinner.slug}|${awayWinner.slug}`];
          if (m && m.status === "completed" && m.winner) {
            const isHomeWinner = m.winner === homeWinner.slug;
            r16Matchups[r16Num] = {
              id: `M${r16Num}`,
              matchNumber: r16Num,
              timeStr: formatToTaipeiTime(m.date),
              status: "completed",
              home: {
                label: homeWinner.name,
                teamId: homeWinner.slug,
                isConfirmed: true,
                isWinner: isHomeWinner,
                isLoser: !isHomeWinner,
              },
              away: {
                label: awayWinner.name,
                teamId: awayWinner.slug,
                isConfirmed: true,
                isWinner: !isHomeWinner,
                isLoser: isHomeWinner,
              },
            };
          } else {
            // R16 match not yet played → empty
            r16Matchups[r16Num] = createEmptyMatchup(r16Num);
          }
        }

        // QF / SF / Final: always empty
        const laterMatchups: Record<number, Matchup> = {};
        for (const num of LATER_NUMS) {
          laterMatchups[num] = createEmptyMatchup(num);
        }

        const allMatchups: Record<string, Matchup> = {};
        for (const [k, v] of Object.entries(r32Matchups)) allMatchups[`M${k}`] = v;
        for (const [k, v] of Object.entries(r16Matchups)) allMatchups[`M${k}`] = v;
        for (const [k, v] of Object.entries(laterMatchups)) allMatchups[`M${k}`] = v;

        setMatchups(allMatchups);
        setLoading(false);
      })
      .catch(() => {
        const allMatchups: Record<string, Matchup> = {};
        [...R32_MATCH_NUMS, ...R16_NUMS, ...LATER_NUMS].forEach((n) => {
          allMatchups[`M${n}`] = createEmptyMatchup(n);
        });
        setMatchups(allMatchups);
        setLoading(false);
      });
  }, []);

  const renderTeam = (team: MatchupTeam) => {
    if (!team.teamId || !team.isConfirmed) {
      return (
        <div className="h-6 flex items-center justify-center text-gray-300 text-[10px] italic font-medium">
          TBD
        </div>
      );
    }

    return (
      <Link
        href={`/team/${team.teamId}`}
        className={`flex items-center gap-1.5 h-6 px-2 rounded transition-all
          ${team.isWinner ? "bg-blue-500 text-white font-bold shadow-md" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}
          ${team.isLoser ? "opacity-50" : ""}
        `}
      >
        <TeamBadge teamId={team.teamId} size="sm" linkable={false} showName={false} />
        <span className="text-[10px] uppercase tracking-wide truncate max-w-[70px]">
          {team.label}
        </span>
      </Link>
    );
  };

  const renderMatch = (matchup?: Matchup) => {
    if (!matchup) return null;
    return (
      <div key={matchup.id} className="mb-3 last:mb-0">
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-50">{renderTeam(matchup.home)}</div>
          <div>{renderTeam(matchup.away)}</div>
        </div>
        {matchup.timeStr && matchup.status === "completed" && (
          <div className="text-[8px] text-gray-400 text-center mt-1">{matchup.timeStr}</div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-row items-stretch gap-2 overflow-x-auto pb-4 px-2">
        {/* Column 1: Left R32 */}
        <div className="flex-1 flex flex-col justify-between py-2">
          <div className="text-center mb-1">
            <span className="text-[10px] font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full uppercase">32強 (左)</span>
          </div>
          {renderMatch(matchups["M73"])}
          {renderMatch(matchups["M74"])}
          {renderMatch(matchups["M75"])}
          {renderMatch(matchups["M76"])}
          {renderMatch(matchups["M77"])}
          {renderMatch(matchups["M78"])}
          {renderMatch(matchups["M79"])}
          {renderMatch(matchups["M80"])}
        </div>

        {/* Column 2: Left R16 */}
        <div className="flex-1 flex flex-col justify-around py-8">
          <div className="text-center mb-2">
            <span className="text-[10px] font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full uppercase">16強 (左)</span>
          </div>
          {renderMatch(matchups["M89"])}
          {renderMatch(matchups["M90"])}
          {renderMatch(matchups["M91"])}
          {renderMatch(matchups["M92"])}
        </div>

        {/* Column 3: Left QF - Empty */}
        <div className="flex-1 flex flex-col justify-around py-24">
          <div className="text-center mb-2">
            <span className="text-[10px] font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full uppercase">8強 (左)</span>
          </div>
          {renderMatch(matchups["M97"])}
          {renderMatch(matchups["M98"])}
        </div>

        {/* Column 4: Left SF - Empty */}
        <div className="flex-1 flex flex-col justify-center py-32">
          <div className="text-center mb-2">
            <span className="text-[10px] font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full uppercase">準決賽 (左)</span>
          </div>
          {renderMatch(matchups["M101"])}
        </div>

        {/* Column 5: Center Final - Empty */}
        <div className="w-[200px] flex-shrink-0 flex flex-col justify-center items-center py-10 border-x border-gray-200/50 px-2">
          <div className="text-center mb-4">
            <span className="text-xs font-black text-purple-800 bg-purple-100 px-3 py-1 rounded-full uppercase tracking-wider">決賽</span>
          </div>
          {renderMatch(matchups["M104"])}
        </div>

        {/* Column 6: Right SF - Empty */}
        <div className="flex-1 flex flex-col justify-center py-32">
          <div className="text-center mb-2">
            <span className="text-[10px] font-black text-red-800 bg-red-100 px-2 py-0.5 rounded-full uppercase">準決賽 (右)</span>
          </div>
          {renderMatch(matchups["M102"])}
        </div>

        {/* Column 7: Right QF - Empty */}
        <div className="flex-1 flex flex-col justify-around py-24">
          <div className="text-center mb-2">
            <span className="text-[10px] font-black text-red-800 bg-red-100 px-2 py-0.5 rounded-full uppercase">8強 (右)</span>
          </div>
          {renderMatch(matchups["M99"])}
          {renderMatch(matchups["M100"])}
        </div>

        {/* Column 8: Right R16 */}
        <div className="flex-1 flex flex-col justify-around py-8">
          <div className="text-center mb-2">
            <span className="text-[10px] font-black text-red-800 bg-red-100 px-2 py-0.5 rounded-full uppercase">16強 (右)</span>
          </div>
          {renderMatch(matchups["M93"])}
          {renderMatch(matchups["M94"])}
          {renderMatch(matchups["M95"])}
          {renderMatch(matchups["M96"])}
        </div>

        {/* Column 9: Right R32 */}
        <div className="flex-1 flex flex-col justify-between py-2">
          <div className="text-center mb-1">
            <span className="text-[10px] font-black text-pink-800 bg-pink-100 px-2 py-0.5 rounded-full uppercase">32強 (右)</span>
          </div>
          {renderMatch(matchups["M83"])}
          {renderMatch(matchups["M84"])}
          {renderMatch(matchups["M81"])}
          {renderMatch(matchups["M82"])}
          {renderMatch(matchups["M86"])}
          {renderMatch(matchups["M88"])}
          {renderMatch(matchups["M85"])}
          {renderMatch(matchups["M87"])}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">
        * 資料來源：ESPN。只顯示已結束比賽的賽果；未進行的比賽一律留空。
      </p>
    </div>
  );
}
