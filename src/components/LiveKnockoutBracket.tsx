"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TeamBadge from "./TeamBadge";
import scheduleDataRaw from "@/data/schedule.json";

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
  const [bracket, setBracket] = useState<{ left: Matchup[]; right: Matchup[] }>({ left: [], right: [] });

  const fetchData = () => {
    fetch("/api/espn?type=all&limit=150")
      .then((r) => r.json())
      .then((data) => {
        // 1. Map ESPN matches by team pairing to overlay live results
        const espnMap: Record<string, any> = {};
        if (data.matches) {
          data.matches.forEach((m: any) => {
            espnMap[`${m.home}|${m.away}`] = m;
            espnMap[`${m.away}|${m.home}`] = m;
          });
        }

        const latestMatches = scheduleDataRaw.matches.map((m: any) => {
          const live = espnMap[`${m.home}|${m.away}`];
          if (!live) return m;
          return { ...m, status: live.status, score: live.score };
        });

        // 2. Helper to get winner info of a 32-round match
        const getWinnerInfo = (matchNumber: number) => {
          const m = latestMatches.find((x: any) => x.number === matchNumber);
          if (!m) return { teamId: "tbd", isConfirmed: false };

          if (m.status === "completed") {
            const homeScore = m.score?.home ?? 0;
            const awayScore = m.score?.away ?? 0;
            if (homeScore > awayScore) return { teamId: m.home, isConfirmed: true };
            if (awayScore > homeScore) return { teamId: m.away, isConfirmed: true };
          }
          // Default to home team as fallback predictor
          return { teamId: m.home || "tbd", isConfirmed: false };
        };

        // 3. Define the 16-round matchups and map them from 32-round source match winners
        const nextBracket = {
          left: [
            { id: "M89", matchNumber: 89, homeSource: 73, awaySource: 75 },
            { id: "M90", matchNumber: 90, homeSource: 74, awaySource: 77 },
            { id: "M91", matchNumber: 91, homeSource: 76, awaySource: 78 },
            { id: "M92", matchNumber: 92, homeSource: 79, awaySource: 80 },
          ],
          right: [
            { id: "M93", matchNumber: 93, homeSource: 83, awaySource: 84 },
            { id: "M94", matchNumber: 94, homeSource: 81, awaySource: 82 },
            { id: "M95", matchNumber: 95, homeSource: 86, awaySource: 88 },
            { id: "M96", matchNumber: 96, homeSource: 85, awaySource: 87 },
          ]
        };

        const fillMatchInfo = (m: any): Matchup => {
          const matchDetail = latestMatches.find((x: any) => x.number === m.matchNumber) || {};
          const homeInfo = getWinnerInfo(m.homeSource);
          const awayInfo = getWinnerInfo(m.awaySource);

          let homeWinner = false;
          let homeLoser = false;
          let awayWinner = false;
          let awayLoser = false;

          if (matchDetail.status === "completed") {
            const hs = matchDetail.score?.home ?? 0;
            const as = matchDetail.score?.away ?? 0;
            if (hs > as) {
              homeWinner = true;
              awayLoser = true;
            } else if (as > hs) {
              awayWinner = true;
              homeLoser = true;
            }
          }

          return {
            id: m.id,
            matchNumber: m.matchNumber,
            timeStr: matchDetail.datetime_utc ? formatToTaipeiTime(matchDetail.datetime_utc) : "",
            status: matchDetail.status || "scheduled",
            home: {
              teamId: homeInfo.teamId,
              isConfirmed: homeInfo.isConfirmed,
              isWinner: homeWinner,
              isLoser: homeLoser,
              label: `M${m.homeSource}勝者`
            },
            away: {
              teamId: awayInfo.teamId,
              isConfirmed: awayInfo.isConfirmed,
              isWinner: awayWinner,
              isLoser: awayLoser,
              label: `M${m.awaySource}勝者`
            }
          };
        };

        setBracket({
          left: nextBracket.left.map(fillMatchInfo),
          right: nextBracket.right.map(fillMatchInfo)
        });
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

  const renderTeam = (team: MatchupTeam, matchStatus: string) => {
    if (!team.teamId || team.teamId === "tbd") {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 last:border-0 h-[40px]">
          <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></span>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{team.label}</span>
        </div>
      );
    }

    const isCompleted = matchStatus === "completed";
    const isWinner = team.isWinner;
    const isLoser = team.isLoser;
    const isConfirmed = team.isConfirmed;

    // Apply colors based on game outcomes
    let cardClass = "bg-white dark:bg-gray-800 border-l-4 border-l-transparent text-gray-800 dark:text-gray-200";
    if (isWinner || (!isCompleted && isConfirmed)) {
      // Golden background for winners or confirmed qualifiers
      cardClass = "bg-amber-100 dark:bg-amber-900/40 border-l-4 border-l-amber-500 dark:border-l-amber-400 text-amber-900 dark:text-amber-300";
    } else if (isLoser) {
      // Low prominence (faded) style for losers
      cardClass = "bg-gray-50/50 dark:bg-gray-800/30 opacity-40 border-l-4 border-l-transparent text-gray-400 dark:text-gray-500";
    }

    return (
      <Link
        href={`/teams/${team.teamId}`}
        className={`flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 h-[40px] hover:opacity-80 transition-all ${cardClass}`}
      >
        <TeamBadge teamId={team.teamId} size="sm" linkable={false} showName={false} />
        <span className="text-xs font-bold uppercase tracking-tight">{team.teamId}</span>
        <span className="ml-auto text-[10px] font-mono opacity-60">{team.label}</span>
      </Link>
    );
  };

  const renderMatch = (match: Matchup) => (
    <div key={match.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden w-full max-w-[200px] mb-4 relative z-10">
      <div className="bg-gray-100 dark:bg-gray-900 px-2 py-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 flex justify-between">
        <span>16強 {match.id}</span>
        {match.timeStr && <span className="font-mono text-[9px] text-gray-400">{match.timeStr}</span>}
      </div>
      {renderTeam(match.home, match.status)}
      {renderTeam(match.away, match.status)}
    </div>
  );

  return (
    <div className="w-full overflow-x-auto pb-8">
      {loading ? (
        <div className="text-center py-16 text-gray-400">載入動態預測中...</div>
      ) : (
        <div className="min-w-[800px] flex justify-between items-start gap-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative">
          {/* Central Title */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <div className="text-2xl font-black text-gray-300 tracking-widest mb-1">FINAL</div>
            <div className="w-px h-32 bg-gray-300 mx-auto"></div>
          </div>

          {/* Left Bracket */}
          <div className="flex-1">
            <h3 className="text-lg font-black text-blue-800 mb-6 border-b-2 border-blue-200 pb-2 inline-block">
              左半區 (LEFT BRACKET)
            </h3>
            <div className="flex flex-col gap-2">
              {bracket.left.map(renderMatch)}
            </div>
          </div>

          {/* Spacer for the Final/Center */}
          <div className="w-32 flex-shrink-0"></div>

          {/* Right Bracket */}
          <div className="flex-1 flex flex-col items-end">
            <h3 className="text-lg font-black text-red-800 mb-6 border-b-2 border-red-200 pb-2 inline-block">
              右半區 (RIGHT BRACKET)
            </h3>
            <div className="flex flex-col gap-2 items-end">
              {bracket.right.map(renderMatch)}
            </div>
          </div>
        </div>
      )}
      <p className="text-xs text-gray-400 text-center mt-6">
        * 對戰組合依據即時小組積分與32強賽況預測。真實世界盃對陣將隨賽果更新，此為視覺化模擬排位。
      </p>
    </div>
  );
}
