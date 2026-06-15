"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import TeamBadge from "./TeamBadge";
import teamsData from "@/data/teams.json";
import { getFlagClass } from "@/data/teamFlags";

interface Team {
  id: string;
  name: string;
  name_zh: string;
  group: string;
  fifa_ranking: number;
  coach: { name: string };
  captain: string;
  best_wc_result: string;
}

const GROUP_COLORS: Record<string, string> = {
  A: "#a4c44d", B: "#b1301f", C: "#2d47cb", D: "#907ad6",
  E: "#5b2227", F: "#1c433a", G: "#4b1cc3", H: "#7cd4c2",
  I: "#9d6d7b", J: "#98783d", K: "#c64524", L: "#7c2926",
};

export default function TeamsListClient() {
  const [search, setSearch] = useState("");

  const teams: Team[] = teamsData.teams;

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return t.name_zh.includes(q) || t.name.toLowerCase().includes(q);
    });
  }, [search, teams]);

  const groupedByGroup = useMemo(() => {
    const groups: Record<string, Team[]> = {};
    for (const t of filtered) {
      if (!groups[t.group]) groups[t.group] = [];
      groups[t.group].push(t);
    }
    return groups;
  }, [filtered]);

  const groupKeys = Object.keys(groupedByGroup).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">參賽隊伍</h1>
        <p className="text-gray-500 mt-1">48 支來自六大洲的頂尖國家隊</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="搜尋隊伍..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm flex-1 min-w-[200px] max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {groupKeys.map((groupKey) => {
        const color = GROUP_COLORS[groupKey] || "#2d47cb";
        return (
          <div key={groupKey} className="mb-8">
            {/* Group header */}
            <div
              className="inline-block px-4 py-1.5 rounded-lg text-base font-black mb-4"
              style={{ backgroundColor: color + "20", color }}
            >
              第 {groupKey} 組
            </div>

            {/* Group box */}
            <div
              className="rounded-xl p-5"
              style={{
                backgroundColor: color + "0d",
                borderColor: color + "30",
                borderWidth: 1,
              }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {groupedByGroup[groupKey].map((team) => {
                  const flagClass = getFlagClass(team.id);
                  return (
                    <Link
                      key={team.id}
                      href={`/teams/${team.id}`}
                      className="flex flex-col items-center gap-2 p-4 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white hover:shadow-md transition-all group"
                    >
                      {flagClass ? (
                        <span
                          className={`${flagClass} text-5xl rounded-sm`}
                          title={team.name}
                        />
                      ) : (
                        <span className="text-5xl">🏳️</span>
                      )}
                      <span className="text-sm font-bold text-gray-800 text-center leading-tight">
                        {team.name_zh}
                      </span>
                      <span className="text-xs text-gray-400">
                        FIFA #{team.fifa_ranking}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">🔍</p>
          <p>找不到符合條件的隊伍</p>
        </div>
      )}
    </div>
  );
}
