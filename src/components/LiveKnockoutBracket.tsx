"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TeamBadge from "./TeamBadge";
import scheduleDataRaw from "@/data/schedule.json";
import teamsData from "@/data/teams.json";

const VALID_TEAM_IDS = new Set(teamsData.teams.map((t: any) => t.id.toLowerCase()));

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

interface TeamResolution {
  teamId: string;
  isConfirmed: boolean;
}

const MATCH_SOURCES: Record<number, { homeSource: number; awaySource: number }> = {
  89: { homeSource: 73, awaySource: 75 },
  90: { homeSource: 74, awaySource: 77 },
  91: { homeSource: 76, awaySource: 78 },
  92: { homeSource: 79, awaySource: 80 },
  93: { homeSource: 83, awaySource: 84 },
  94: { homeSource: 81, awaySource: 82 },
  95: { homeSource: 86, awaySource: 88 },
  96: { homeSource: 85, awaySource: 87 },
  97: { homeSource: 89, awaySource: 90 },
  98: { homeSource: 91, awaySource: 92 },
  99: { homeSource: 93, awaySource: 94 },
  100: { homeSource: 95, awaySource: 96 },
  101: { homeSource: 97, awaySource: 98 },
  102: { homeSource: 99, awaySource: 100 },
  104: { homeSource: 101, awaySource: 102 }
};

function formatToTaipeiTime(datetimeUtc: string) {
  try {
    const dateObj = new Date(datetimeUtc);
    if (isNaN(dateObj.getTime())) return "";

    return new Intl.DateTimeFormat("zh-TW", {
      timeZone: "Asia/Taipei",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(dateObj);
  } catch (e) {
    return "";
  }
}

export default function LiveKnockoutBracket() {
  const [loading, setLoading] = useState(true);
  const [matchups, setMatchups] = useState<Record<string, Matchup>>({});
  const [champion, setChampion] = useState<TeamResolution | null>(null);

  const fetchData = () => {
    fetch("/api/espn?type=all&limit=150")
      .then((r) => {
        if (!r.ok) throw new Error("Fetch failed");
        return r.json();
      })
      .then((data) => {
        // 1. Map ESPN matches by team pairing to overlay live results
        const espnMap: Record<string, any> = {};
        if (data.matches) {
          data.matches.forEach((m: any) => {
            if (m.home && m.away) {
              espnMap[`${m.home.toLowerCase()}|${m.away.toLowerCase()}`] = m;
              espnMap[`${m.away.toLowerCase()}|${m.home.toLowerCase()}`] = m;
            }
          });
        }

        const latestMatches = scheduleDataRaw.matches.map((m: any) => {
          const homeId = m.home?.toLowerCase();
          const awayId = m.away?.toLowerCase();
          const live = (homeId && awayId) ? espnMap[`${homeId}|${awayId}`] : null;
          if (!live) return m;
          return { ...m, status: live.status, score: live.score, winner: live.winner };
        });

        // 2. Recursive winner resolver with memoization/caching
        const resolvedWinnerMap: Record<number, TeamResolution> = {};
        const resolveMatchWinner = (matchNum: number): TeamResolution => {
          if (resolvedWinnerMap[matchNum]) return resolvedWinnerMap[matchNum];
          const m = latestMatches.find((x: any) => x.number === matchNum);
          if (!m) return { teamId: "tbd", isConfirmed: false };

          if (m.status === "completed") {
            if (m.winner && m.winner !== "tbd") {
              const res = { teamId: m.winner, isConfirmed: VALID_TEAM_IDS.has(m.winner.toLowerCase()) };
              resolvedWinnerMap[matchNum] = res;
              return res;
            }
            const hs = m.score?.home ?? 0;
            const as = m.score?.away ?? 0;
            const winnerId = hs > as ? m.home : m.away;
            const res = { teamId: winnerId, isConfirmed: VALID_TEAM_IDS.has(winnerId?.toLowerCase()) };
            resolvedWinnerMap[matchNum] = res;
            return res;
          }

          const res = { teamId: "tbd", isConfirmed: false };
          resolvedWinnerMap[matchNum] = res;
          return res;
        };

        // 3. Helper to populate matchup data recursively
        const getMatchupInfo = (matchNum: number): Matchup => {
          const matchDetail = latestMatches.find((x: any) => x.number === matchNum) || {};
          const sources = MATCH_SOURCES[matchNum];

          let homeTeamId = "tbd";
          let awayTeamId = "tbd";
          let homeConfirmed = false;
          let awayConfirmed = false;

          if (sources) {
            const resolvedHome = resolveMatchWinner(sources.homeSource);
            homeTeamId = resolvedHome.teamId;
            homeConfirmed = resolvedHome.isConfirmed;

            const resolvedAway = resolveMatchWinner(sources.awaySource);
            awayTeamId = resolvedAway.teamId;
            awayConfirmed = resolvedAway.isConfirmed;
          } else {
            // For R32 matches (no sources), only display the teams if the match is completed
            if (matchDetail.status === "completed") {
              homeTeamId = matchDetail.home || "tbd";
              awayTeamId = matchDetail.away || "tbd";
              homeConfirmed = homeTeamId !== "tbd" && VALID_TEAM_IDS.has(homeTeamId.toLowerCase());
              awayConfirmed = awayTeamId !== "tbd" && VALID_TEAM_IDS.has(awayTeamId.toLowerCase());
            }
          }

          let homeWinner = false;
          let homeLoser = false;
          let awayWinner = false;
          let awayLoser = false;

          if (matchDetail.status === "completed") {
            const hs = matchDetail.score?.home ?? 0;
            const as = matchDetail.score?.away ?? 0;
            const matchWinner = matchDetail.winner;
            if (matchWinner && matchWinner !== "tbd") {
              if (matchWinner.toLowerCase() === homeTeamId.toLowerCase()) {
                homeWinner = true;
                awayLoser = true;
              } else if (matchWinner.toLowerCase() === awayTeamId.toLowerCase()) {
                awayWinner = true;
                homeLoser = true;
              }
            } else {
              if (hs > as) {
                homeWinner = true;
                awayLoser = true;
              } else if (as > hs) {
                awayWinner = true;
                homeLoser = true;
              }
            }
          }

          return {
            id: `M${matchNum}`,
            matchNumber: matchNum,
            timeStr: matchDetail.datetime_utc ? formatToTaipeiTime(matchDetail.datetime_utc) : "",
            status: matchDetail.status || "scheduled",
            home: {
              teamId: homeTeamId,
              isConfirmed: homeConfirmed,
              isWinner: homeWinner,
              isLoser: homeLoser,
              label: sources ? `M${sources.homeSource}勝者` : ""
            },
            away: {
              teamId: awayTeamId,
              isConfirmed: awayConfirmed,
              isWinner: awayWinner,
              isLoser: awayLoser,
              label: sources ? `M${sources.awaySource}勝者` : ""
            }
          };
        };

        const allMatchNumbers = [
          73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88,
          89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 104
        ];
        const nextMatchups: Record<string, Matchup> = {};
        allMatchNumbers.forEach((num) => {
          nextMatchups[`M${num}`] = getMatchupInfo(num);
        });

        setMatchups(nextMatchups);
        setChampion(resolveMatchWinner(104));
      })
      .catch((err) => console.error("Error fetching live matches in bracket:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const getStageLabel = (matchNum: number) => {
    if (matchNum >= 73 && matchNum <= 88) return "32強";
    if (matchNum >= 89 && matchNum <= 96) return "16強";
    if (matchNum >= 97 && matchNum <= 100) return "8強";
    if (matchNum >= 101 && matchNum <= 102) return "準決賽";
    if (matchNum === 104) return "決賽";
    return "";
  };

  const renderTeam = (team: MatchupTeam, matchStatus: string) => {
    if (!team.teamId || team.teamId === "tbd") {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 last:border-0 h-[40px]">
          <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></span>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{team.label}</span>
        </div>
      );
    }

    const isWinner = team.isWinner;
    const isLoser = team.isLoser;
    const isConfirmed = team.isConfirmed;

    // Apply colors based on game outcomes
    let cardClass = "bg-white dark:bg-gray-800 border-l-4 border-l-transparent text-gray-800 dark:text-gray-200";
    if (isWinner) {
      // Golden background ONLY for winners of this specific match
      cardClass = "bg-amber-100 dark:bg-amber-900/40 border-l-4 border-l-amber-500 dark:border-l-amber-400 text-amber-900 dark:text-amber-300 font-bold";
    } else if (isLoser) {
      // Low prominence (faded) style for losers
      cardClass = "bg-gray-50/50 dark:bg-gray-800/30 opacity-40 border-l-4 border-l-transparent text-gray-400 dark:text-gray-500";
    }

    const content = (
      <>
        <TeamBadge teamId={team.teamId} size="sm" linkable={false} showName={false} />
        <span className="text-xs font-bold uppercase tracking-tight">{team.teamId}</span>
        <span className="ml-auto text-[10px] font-mono opacity-60">{team.label}</span>
      </>
    );

    if (isConfirmed) {
      return (
        <Link
          href={`/teams/${team.teamId}`}
          className={`flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 h-[40px] hover:opacity-80 transition-all ${cardClass}`}
        >
          {content}
        </Link>
      );
    }

    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 h-[40px] ${cardClass}`}
      >
        {content}
      </div>
    );
  };

  const renderMatch = (match: Matchup) => {
    if (!match) return null;
    return (
      <div key={match.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden w-full max-w-[170px] mb-2 relative z-10">
        <div className="bg-gray-100 dark:bg-gray-900 px-2 py-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 flex justify-between">
          <span>{getStageLabel(match.matchNumber)} {match.id}</span>
          {match.timeStr && <span className="font-mono text-[9px] text-gray-400">{match.timeStr}</span>}
        </div>
        {renderTeam(match.home, match.status)}
        {renderTeam(match.away, match.status)}
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto pb-8">
      {loading ? (
        <div className="text-center py-16 text-gray-400">載入動態預測中...</div>
      ) : (
        <div className="min-w-[1600px] h-[920px] flex justify-between items-stretch gap-2 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 relative">
          
          {/* Column 1: Left R32 */}
          <div className="flex-1 flex flex-col justify-between py-2">
            <div className="text-center mb-1">
              <span className="text-[10px] font-black text-pink-800 bg-pink-100 px-2 py-0.5 rounded-full uppercase">32強 (左)</span>
            </div>
            {renderMatch(matchups["M73"])}
            {renderMatch(matchups["M75"])}
            {renderMatch(matchups["M74"])}
            {renderMatch(matchups["M77"])}
            {renderMatch(matchups["M76"])}
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

          {/* Column 3: Left QF */}
          <div className="flex-1 flex flex-col justify-around py-24">
            <div className="text-center mb-2">
              <span className="text-[10px] font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full uppercase">8強 (左)</span>
            </div>
            {renderMatch(matchups["M97"])}
            {renderMatch(matchups["M98"])}
          </div>

          {/* Column 4: Left SF */}
          <div className="flex-1 flex flex-col justify-center py-32">
            <div className="text-center mb-2">
              <span className="text-[10px] font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full uppercase">準決賽 (左)</span>
            </div>
            {renderMatch(matchups["M101"])}
          </div>

          {/* Column 5: Center Final & Champion Banner */}
          <div className="w-[200px] flex-shrink-0 flex flex-col justify-center items-center py-10 border-x border-gray-200/50 px-2">
            <div className="text-center mb-4">
              <span className="text-xs font-black text-purple-800 bg-purple-100 px-3 py-1 rounded-full uppercase tracking-wider">決賽</span>
            </div>
            {renderMatch(matchups["M104"])}

            {/* Champion Banner */}
            {champion && champion.teamId && champion.teamId !== "tbd" && (
              <div className="mt-6 flex flex-col items-center p-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl shadow-lg border border-yellow-300 text-center animate-pulse w-full">
                <span className="text-2xl">🏆</span>
                <span className="text-[10px] uppercase font-extrabold text-amber-950 tracking-widest mt-1">
                  {champion.isConfirmed ? "世界冠軍" : "預測冠軍"}
                </span>
                <div className="flex items-center justify-center gap-2 mt-2 bg-white/20 px-2 py-1 rounded-lg w-full">
                  <TeamBadge teamId={champion.teamId} size="sm" linkable={true} showName={true} className="text-amber-950 font-bold" />
                </div>
              </div>
            )}
          </div>

          {/* Column 6: Right SF */}
          <div className="flex-1 flex flex-col justify-center py-32">
            <div className="text-center mb-2">
              <span className="text-[10px] font-black text-red-800 bg-red-100 px-2 py-0.5 rounded-full uppercase">準決賽 (右)</span>
            </div>
            {renderMatch(matchups["M102"])}
          </div>

          {/* Column 7: Right QF */}
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
      )}
      <p className="text-xs text-gray-400 text-center mt-6">
        * 對戰組合依據即時小組積分與32強賽況預測。真實世界盃對陣將隨賽果更新，此為視覺化模擬排位。
      </p>
    </div>
  );
}
