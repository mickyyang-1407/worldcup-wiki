"use client";

import { useEffect, useState, useCallback } from "react";
import TeamBadge from "./TeamBadge";
import Link from "next/link";

const GROUP_COLORS: Record<string, string> = {
  A: "#a4c44d", B: "#b1301f", C: "#2d47cb", D: "#907ad6",
  E: "#5b2227", F: "#1c433a", G: "#4b1cc3", H: "#7cd4c2",
  I: "#9d6d7b", J: "#98783d", K: "#c64524", L: "#7c2926",
};

function darken(hex: string, amt = 20): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const b = Math.max(0, (n & 0xff) - amt);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

interface StandingEntry {
  team_id: string;
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

interface GroupData {
  id: string;
  name: string;
  standings: StandingEntry[];
}

interface Props {
  groupId?: string;
  compact?: boolean;
  isLink?: boolean;
}

export default function LiveGroupStandings({ groupId, compact = false, isLink = true }: Props) {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStandings = useCallback(async () => {
    try {
      const res = await fetch("/api/espn-standings", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.groups?.length) {
        setGroups(data.groups);
        setLastUpdated(new Date());
      }
    } catch {
      // keep existing data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStandings();
    const timer = setInterval(fetchStandings, 5 * 60 * 1000); // refresh every 5 min
    const onVisible = () => { if (document.visibilityState === "visible") fetchStandings(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [fetchStandings]);

  const displayGroups = groupId ? groups.filter((g) => g.id === groupId) : groups;

  if (loading) {
    return (
      <div className={`grid gap-6 ${compact ? "" : "md:grid-cols-2"}`}>
        {Array.from({ length: groupId ? 1 : 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {lastUpdated && (
        <div className="text-xs text-gray-400 text-right mb-3">
          ESPN 即時資料 · {lastUpdated.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })} 更新
        </div>
      )}
      <div className={`grid gap-6 ${compact ? "" : "md:grid-cols-2"}`}>
        {displayGroups.map((group) => {
          const color = GROUP_COLORS[group.id] || "#2d47cb";
          const darkColor = darken(color);
          
          const CardContent = (
            <>
              <div className="px-4 py-3 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${color} 0%, ${darkColor} 100%)` }}>
                <h3 className="text-white font-bold text-lg">{group.name}</h3>
                {isLink && <span className="text-white/70 text-xs">查看詳情 →</span>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-50">
                      <th className="px-3 py-1.5 text-left font-medium">隊伍</th>
                      <th className="px-2 py-1.5 text-center font-medium">賽</th>
                      <th className="px-2 py-1.5 text-center font-medium">勝</th>
                      <th className="px-2 py-1.5 text-center font-medium">平</th>
                      <th className="px-2 py-1.5 text-center font-medium">負</th>
                      <th className="px-2 py-1.5 text-center font-medium">進</th>
                      <th className="px-2 py-1.5 text-center font-medium">失</th>
                      <th className="px-2 py-1.5 text-center font-medium">淨</th>
                      <th className="px-2 py-1.5 text-center font-bold" style={{ color }}>積分</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.standings.map((row, idx) => (
                      <tr
                        key={row.team_id}
                        className={`border-b border-gray-50 last:border-0 ${idx < 2 ? "bg-green-50/40" : ""}`}
                      >
                        <td className="px-3 py-2">
                          <TeamBadge teamId={row.team_id} size="sm" showName={true} linkable={!isLink} />
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600">{row.played}</td>
                        <td className="px-2 py-2 text-center text-gray-600">{row.won}</td>
                        <td className="px-2 py-2 text-center text-gray-600">{row.drawn}</td>
                        <td className="px-2 py-2 text-center text-gray-600">{row.lost}</td>
                        <td className="px-2 py-2 text-center text-gray-600">{row.gf}</td>
                        <td className="px-2 py-2 text-center text-gray-600">{row.ga}</td>
                        <td className="px-2 py-2 text-center text-gray-600">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                        <td className="px-2 py-2 text-center font-bold" style={{ color }}>{row.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          );

          if (isLink) {
            return (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {CardContent}
              </Link>
            );
          }

          return (
            <div key={group.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {CardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
