"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TeamBadge from "./TeamBadge";
import { getQualificationStatus, type QualificationStatus } from "@/lib/qualificationStatus";
import type { GroupData, StandingEntry } from "@/lib/predictionTypes";
import scheduleDataRaw from "@/data/schedule.json";

type Standing = StandingEntry;
type Group = GroupData;

interface MatchupTeam {
  label: string; // e.g., "1A", "2B", "3_1"
  teamId?: string;
  points?: number; // just for display
  qualificationStatus?: QualificationStatus;
}

interface Matchup {
  id: string;
  home: MatchupTeam;
  away: MatchupTeam;
  timeStr?: string;
}

function formatToTaipeiTime(utcDateStr: string, utcTimeStr: string) {
  try {
    const dateTimeString = `${utcDateStr}T${utcTimeStr}Z`;
    const dateObj = new Date(dateTimeString);
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

function getKnockoutSkeleton(): { left: Matchup[], right: Matchup[] } {
  const scheduleData = scheduleDataRaw as any;
  const matchInfo = (id: string) => {
    const m = scheduleData.matches.find((x: any) => `M${x.number}` === id);
    if (m && m.date && m.time) {
      return formatToTaipeiTime(m.date, m.time);
    }
    return "";
  };

  return {
    left: [
      { id: "M73", home: { label: "2A" }, away: { label: "2B" }, timeStr: matchInfo("M73") },
      { id: "M74", home: { label: "1E" }, away: { label: "3_1" }, timeStr: matchInfo("M74") },
      { id: "M75", home: { label: "1F" }, away: { label: "2C" }, timeStr: matchInfo("M75") },
      { id: "M76", home: { label: "1C" }, away: { label: "2F" }, timeStr: matchInfo("M76") },
      { id: "M77", home: { label: "1I" }, away: { label: "3_2" }, timeStr: matchInfo("M77") },
      { id: "M78", home: { label: "2E" }, away: { label: "2I" }, timeStr: matchInfo("M78") },
      { id: "M79", home: { label: "1A" }, away: { label: "3_3" }, timeStr: matchInfo("M79") },
      { id: "M80", home: { label: "1L" }, away: { label: "3_4" }, timeStr: matchInfo("M80") },
    ],
    right: [
      { id: "M81", home: { label: "1D" }, away: { label: "3_5" }, timeStr: matchInfo("M81") },
      { id: "M82", home: { label: "1G" }, away: { label: "3_6" }, timeStr: matchInfo("M82") },
      { id: "M83", home: { label: "2K" }, away: { label: "2L" }, timeStr: matchInfo("M83") },
      { id: "M84", home: { label: "1H" }, away: { label: "2J" }, timeStr: matchInfo("M84") },
      { id: "M85", home: { label: "1B" }, away: { label: "3_7" }, timeStr: matchInfo("M85") },
      { id: "M86", home: { label: "1J" }, away: { label: "2H" }, timeStr: matchInfo("M86") },
      { id: "M87", home: { label: "1K" }, away: { label: "3_8" }, timeStr: matchInfo("M87") },
      { id: "M88", home: { label: "2D" }, away: { label: "2G" }, timeStr: matchInfo("M88") },
    ]
  };
}

export default function LiveKnockoutBracket() {
  const [loading, setLoading] = useState(true);
  const [bracket, setBracket] = useState(getKnockoutSkeleton());

  const fetchData = () => {
    fetch("/api/espn-standings")
      .then((r) => r.json())
      .then((data) => {
        const groups: Group[] = data.groups || [];
        const slots: Record<string, string> = {};
        const teamGroups: Record<string, string> = {};

        const thirds: Standing[] = [];

        groups.forEach((g) => {
          g.standings.forEach((team) => {
            teamGroups[team.team_id] = g.id;
          });
          if (g.standings.length >= 1) slots[`1${g.id}`] = g.standings[0].team_id;
          if (g.standings.length >= 2) slots[`2${g.id}`] = g.standings[1].team_id;
          if (g.standings.length >= 3) {
            thirds.push(g.standings[2]);
          }
        });

        // Sort thirds: Points, then GD, then GF
        thirds.sort((a, b) => {
          if (b.pts !== a.pts) return b.pts - a.pts;
          if (b.gd !== a.gd) return b.gd - a.gd;
          return b.gf - a.gf;
        });

        // Take top 8 thirds
        thirds.slice(0, 8).forEach((t, i) => {
          slots[`3_${i + 1}`] = t.team_id;
        });

        // Fill skeleton
        const skel = getKnockoutSkeleton();
        const fillTeam = (t: MatchupTeam) => {
          if (slots[t.label]) {
            t.teamId = slots[t.label];
            t.qualificationStatus = getQualificationStatus(t.teamId, teamGroups[t.teamId] || "", groups);
          }
          return t;
        };

        skel.left.forEach(m => {
          m.home = fillTeam(m.home);
          m.away = fillTeam(m.away);
        });
        skel.right.forEach(m => {
          m.home = fillTeam(m.home);
          m.away = fillTeam(m.away);
        });

        setBracket(skel);
      })
      .catch(() => {})
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

  const renderTeam = (team: MatchupTeam) => {
    if (!team.teamId) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 last:border-0 h-[40px]">
          <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></span>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{team.label}</span>
        </div>
      );
    }
    const isQualified = team.qualificationStatus === 'qualified';
    return (
      <Link href={`/teams/${team.teamId}`} className={`flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 h-[40px] hover:opacity-80 transition-opacity ${isQualified ? 'bg-amber-100 dark:bg-amber-900/40 border-l-4 border-l-amber-500 dark:border-l-amber-400' : 'bg-white dark:bg-gray-800 border-l-4 border-l-transparent'}`}>
        <TeamBadge teamId={team.teamId} size="sm" linkable={false} showName={false} />
        <span className={`text-xs font-bold uppercase tracking-tight ${isQualified ? 'text-amber-900 dark:text-amber-300' : 'text-gray-800 dark:text-gray-200'}`}>{team.teamId}</span>
        <span className={`ml-auto text-[10px] font-mono ${isQualified ? 'text-amber-700 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}>{team.label}</span>
      </Link>
    );
  };

  const renderMatch = (match: Matchup) => (
    <div key={match.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden w-full max-w-[200px] mb-4 relative z-10">
      <div className="bg-gray-100 dark:bg-gray-900 px-2 py-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 flex justify-between">
        <span>32強 {match.id}</span>
        {match.timeStr && <span className="font-mono text-[9px] text-gray-400">{match.timeStr}</span>}
      </div>
      {renderTeam(match.home)}
      {renderTeam(match.away)}
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
            <h3 className="text-lg font-black text-blue-800 mb-6 border-b-2 border-blue-200 pb-2 inline-block">左半區 (LEFT BRACKET)</h3>
            <div className="flex flex-col gap-2">
              {bracket.left.map(renderMatch)}
            </div>
          </div>

          {/* Spacer for the Final/Center */}
          <div className="w-32 flex-shrink-0"></div>

          {/* Right Bracket */}
          <div className="flex-1 flex flex-col items-end">
            <h3 className="text-lg font-black text-red-800 mb-6 border-b-2 border-red-200 pb-2 inline-block">右半區 (RIGHT BRACKET)</h3>
            <div className="flex flex-col gap-2 items-end">
              {bracket.right.map(renderMatch)}
            </div>
          </div>

        </div>
      )}
      <p className="text-xs text-gray-400 text-center mt-6">
        * 對戰組合依據即時小組積分預測，真實世界盃 3rd-place 晉級對陣將依照 FIFA 495 種組合矩陣計算，此為視覺化模擬排位。
      </p>
    </div>
  );
}
