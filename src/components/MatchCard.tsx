"use client";

import Link from "next/link";
import { teams } from "@/data/teams";
import { getFlagClass } from "@/data/teamFlags";

/* FIFA 2026 brand group colors */
const GROUP_COLORS: Record<string, string> = {
  A: "#a4c44d", B: "#b1301f", C: "#2d47cb", D: "#907ad6",
  E: "#5b2227", F: "#1c433a", G: "#4b1cc3", H: "#7cd4c2",
  I: "#9d6d7b", J: "#98783d", K: "#c64524", L: "#7c2926",
};

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
  scheduled: "bg-gray-100 text-gray-600",
};

const statusLabels: Record<string, string> = {
  completed: "已結束",
  live: "進行中",
  upcoming: "未開始",
  scheduled: "未開始",
};

// Parse match time to Asia/Taipei display string (M/D HH:mm 台北時間)
function formatTaipeiDateTime(d: Date): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(d);
    const map = new Map(parts.map((p) => [p.type, p.value]));
    return `${map.get("month")}/${map.get("day")} ${map.get("hour")}:${map.get("minute")} 台北時間`;
  } catch {
    return "";
  }
}

function getMatchDateTime(datetimeUtc: string, dateStr: string): string {
  let parsedDate: Date | null = null;

  if (datetimeUtc) {
    // 1. Check if ISO string (contains 'T' and is valid date)
    if (datetimeUtc.includes("T")) {
      const d = new Date(datetimeUtc);
      if (!isNaN(d.getTime())) {
        parsedDate = d;
      }
    }

    // 2. Check if offset string like "5:00p.m. UTC-4" or "1:00p.m. UTC−6"
    if (!parsedDate) {
      const offsetMatch = datetimeUtc.match(/^(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)\s*UTC\s*([+−-]\d{1,2})/i);
      if (offsetMatch) {
        let hr = parseInt(offsetMatch[1], 10);
        const min = parseInt(offsetMatch[2], 10);
        const ampm = offsetMatch[3].toLowerCase();
        const offsetStr = offsetMatch[4].replace("−", "-");
        const offsetHours = parseInt(offsetStr, 10);

        if (ampm === "p.m." && hr < 12) {
          hr += 12;
        } else if (ampm === "a.m." && hr === 12) {
          hr = 0;
        }

        if (dateStr) {
          const dateParts = dateStr.split("-").map((num) => parseInt(num, 10));
          if (dateParts.length === 3) {
            const [year, monthVal, dayVal] = dateParts;
            const utcTimeMs = Date.UTC(year, monthVal - 1, dayVal, hr - offsetHours, min);
            const d = new Date(utcTimeMs);
            if (!isNaN(d.getTime())) {
              parsedDate = d;
            }
          }
        }
      }
    }

    // 3. Check if simple time string like "20:30"
    if (!parsedDate) {
      const timeMatch = datetimeUtc.match(/^(\d{1,2}):(\d{2})/);
      if (timeMatch && dateStr) {
        let hrStr = timeMatch[1];
        if (hrStr.length === 1) hrStr = "0" + hrStr;
        const minStr = timeMatch[2];
        const isoStr = `${dateStr}T${hrStr}:${minStr}:00.000Z`;
        const d = new Date(isoStr);
        if (!isNaN(d.getTime())) {
          parsedDate = d;
        }
      }
    }
  }

  // If we successfully parsed a date, format it to M/D HH:mm 台北時間
  if (parsedDate) {
    const formatted = formatTaipeiDateTime(parsedDate);
    if (formatted) return formatted;
  }

  // 4. Fallback: displaying only the date (M/D 台北時間)
  if (dateStr) {
    const match = dateStr.match(/^\d{4}-(\d{2})-(\d{2})$/);
    if (match) {
      const m = parseInt(match[1], 10);
      const d = parseInt(match[2], 10);
      return `${m}/${d} 台北時間`;
    }
  }
  return dateStr ? `${dateStr} 台北時間` : "";
}

const TEAM_COLORS: Record<string, { border: string; bg: string }> = {
  canada: { border: "#ff0000", bg: "#fff5f5" },
  "south-africa": { border: "#007a4d", bg: "#f4faf6" },
  germany: { border: "#111111", bg: "#f7f7f7" },
  paraguay: { border: "#d52b1e", bg: "#fff5f5" },
  netherlands: { border: "#ff4f00", bg: "#fffaf5" },
  morocco: { border: "#c1272d", bg: "#fff5f5" },
  brazil: { border: "#fedf00", bg: "#fffff0" },
  japan: { border: "#002e73", bg: "#f0f5fa" },
  france: { border: "#002395", bg: "#f0f2fa" },
  sweden: { border: "#006aa7", bg: "#f0f6fa" },
  "ivory-coast": { border: "#ff8c00", bg: "#fffbf5" },
  norway: { border: "#ef2b2d", bg: "#fff5f5" },
  mexico: { border: "#006847", bg: "#f4faf6" },
  ecuador: { border: "#ffdd00", bg: "#fffff0" },
  england: { border: "#000080", bg: "#f5f5ff" },
  "dr-congo": { border: "#007fff", bg: "#f5faff" },
  "united-states": { border: "#002868", bg: "#f0f4fa" },
  "bosnia-and-herzegovina": { border: "#00209f", bg: "#f0f2fa" },
  belgium: { border: "#e30613", bg: "#fff5f5" },
  senegal: { border: "#00853f", bg: "#f4faf6" },
  portugal: { border: "#ff0000", bg: "#fff5f5" },
  croatia: { border: "#ff0000", bg: "#fff5f5" },
  spain: { border: "#c60b1e", bg: "#fff5f5" },
  austria: { border: "#ed2939", bg: "#fff5f5" },
  switzerland: { border: "#d52b1e", bg: "#fff5f5" },
  algeria: { border: "#006233", bg: "#f4faf6" },
  argentina: { border: "#74acdf", bg: "#f5faff" },
  "cape-verde": { border: "#002a66", bg: "#f0f4fa" },
  colombia: { border: "#fcd116", bg: "#fffff5" },
  ghana: { border: "#d52b1e", bg: "#fff5f5" },
  australia: { border: "#00008b", bg: "#f5f5ff" },
  egypt: { border: "#c1272d", bg: "#fff5f5" },
};

export default function MatchCard({ match }: MatchCardProps) {
  const homeTeam = teams.find((t: any) => t.id === match.home) || 
    (match.home?.toLowerCase() === "tbd" 
      ? { id: "tbd", name: "TBD", name_zh: "未定" } 
      : (match.home 
          ? { id: match.home, name: match.home.toUpperCase(), name_zh: match.home.toUpperCase() } 
          : null
        )
    );
  const awayTeam = teams.find((t: any) => t.id === match.away) || 
    (match.away?.toLowerCase() === "tbd" 
      ? { id: "tbd", name: "TBD", name_zh: "未定" } 
      : (match.away 
          ? { id: match.away, name: match.away.toUpperCase(), name_zh: match.away.toUpperCase() } 
          : null
        )
    );
  const homeFlag = homeTeam && homeTeam.id !== "tbd" ? getFlagClass(match.home) : null;
  const awayFlag = awayTeam && awayTeam.id !== "tbd" ? getFlagClass(match.away) : null;

  const detailSlug = `${match.home}--${match.away}--${match.date}`;
  
  const winnerColor = (match.stage !== "group" && match.status === "completed") 
    ? (() => {
        const espnWinner = (match as any).winner;
        if (espnWinner && espnWinner !== "tbd") {
          return TEAM_COLORS[espnWinner] || null;
        }
        const homeScore = match.score?.home ?? 0;
        const awayScore = match.score?.away ?? 0;
        const winnerSlug = homeScore > awayScore ? match.home : homeScore < awayScore ? match.away : "";
        return TEAM_COLORS[winnerSlug] || null;
      })()
    : null;

  return (
    <Link href={`/matches/${detailSlug}`} className="block">
    <div 
      className="rounded-xl border shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-4 relative overflow-hidden cursor-pointer"
      style={winnerColor ? {
        borderColor: winnerColor.border,
        backgroundColor: winnerColor.bg,
        borderWidth: '2px'
      } : {
        borderColor: '#f3f4f6',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Left color bar for group matches */}
      {match.stage === "group" && match.group && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[14px]"
          style={{ backgroundColor: GROUP_COLORS[match.group] || "#2d47cb" }}
        />
      )}
      {match.stage === "group" && match.group && (
        <div className="text-base font-black mb-3 pl-1" style={{ color: GROUP_COLORS[match.group] || "#2d47cb" }}>
          {match.group}組
        </div>
      )}
      {match.stage !== "group" && (
        <div className="text-sm font-bold text-purple-600 mb-3 pl-1">
          {match.stage === "round-of-32" ? "32強" : match.stage === "round-of-16" ? "16強" : match.stage === "quarter-finals" ? "8強" : match.stage === "semi-finals" ? "準決賽" : match.stage === "third-place" ? "季軍戰" : match.stage === "final" ? "決賽" : match.stage}
        </div>
      )}

      <div className="grid grid-cols-3 items-center">
        {/* Left column: 中文隊名 + 英文隊名 + 國旗（國旗靠中間） */}
        <div className="flex items-center justify-end gap-3">
          <div className="flex flex-col items-end">
            {homeTeam && <span className="text-sm font-semibold text-gray-800 leading-tight">{homeTeam.name_zh}</span>}
            {homeTeam && <span className="text-xs text-gray-400 leading-tight">{homeTeam.name}</span>}
          </div>
          {homeFlag ? (
            <span className={`${homeFlag} text-3xl rounded-sm shrink-0`} title={homeTeam?.name} />
          ) : (
            <span className="inline-flex items-center justify-center rounded-full text-3xl shrink-0">🏳️</span>
          )}
        </div>

        {/* Middle column: 比分置中 */}
        <div className="flex flex-col items-center gap-1">
          {match.status === "completed" ? (
            <span className="text-2xl font-bold text-gray-900 font-mono">
              {match.score.home} - {match.score.away}
            </span>
          ) : (
            <span className="text-lg font-semibold text-gray-600">vs</span>
          )}
          <span className="text-xs text-gray-500">{getMatchDateTime((match as any).datetime_utc || match.time, match.date)}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[match.status] || statusStyles.upcoming}`}>
            {statusLabels[match.status] || match.status}
          </span>
        </div>

        {/* Right column: 國旗（靠中間）+ 中文隊名 + 英文隊名 */}
        <div className="flex items-center gap-3">
          {awayFlag ? (
            <span className={`${awayFlag} text-3xl rounded-sm shrink-0`} title={awayTeam?.name} />
          ) : (
            <span className="inline-flex items-center justify-center rounded-full text-3xl shrink-0">🏳️</span>
          )}
          <div className="flex flex-col">
            {awayTeam && <span className="text-sm font-semibold text-gray-800 leading-tight">{awayTeam.name_zh}</span>}
            {awayTeam && <span className="text-xs text-gray-400 leading-tight">{awayTeam.name}</span>}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between gap-1 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <span>&#128205;</span>
          <span>{match.city}</span>
          {match.referee && (
            <>
              <span className="mx-1">·</span>
              <span>&#128695; {match.referee}</span>
            </>
          )}
        </div>
        <span className="text-blue-400 text-[10px] shrink-0">詳情 →</span>
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
    </Link>
  );
}
