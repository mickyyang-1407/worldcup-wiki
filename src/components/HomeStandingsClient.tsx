"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TeamBadge from "./TeamBadge";

const GROUP_COLORS: Record<string, string> = {
  A: "#a4c44d", B: "#b1301f", C: "#2d47cb", D: "#907ad6",
  E: "#5b2227", F: "#1c433a", G: "#4b1cc3", H: "#7cd4c2",
  I: "#9d6d7b", J: "#98783d", K: "#c64524", L: "#7c2926",
};

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export default function HomeStandingsClient() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    fetch("/api/espn-standings")
      .then((r) => r.json())
      .then((d) => setGroups(d.groups || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 30000);
    const onVisible = () => { if (document.visibilityState === "visible") fetchData(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
      {groups.slice(0, 6).map((group: any) => {
        const color = GROUP_COLORS[group.id] || "#2d47cb";
        return (
          <Link
            key={group.id}
            href={`/groups/${group.id}`}
            className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all overflow-hidden group"
          >
            <div className="px-4 py-2" style={{ background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)` }}>
              <h3 className="text-white font-bold text-sm">{group.name}</h3>
            </div>
            <div className="p-3 space-y-1.5">
              {group.standings.slice(0, 2).map((row: any) => (
                <div key={row.team_id} className="flex items-center justify-between text-sm">
                  <TeamBadge teamId={row.team_id} size="sm" />
                  <span className="font-bold text-gray-800">
                    {row.pts}<span className="font-normal text-gray-400 text-xs ml-0.5">pts</span>
                  </span>
                </div>
              ))}
              <div className="text-xs text-gray-400 text-center pt-1 group-hover:text-green-600 transition-colors">
                查看完整積分 →
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
