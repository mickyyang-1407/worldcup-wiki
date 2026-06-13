"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import TeamBadge from "./TeamBadge";
import teamsData from "@/data/teams.json";

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

export default function TeamsListClient() {
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");

  const teams: Team[] = teamsData.teams;

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      const matchesSearch = !search ||
        t.name_zh.includes(search) ||
        t.name.toLowerCase().includes(search.toLowerCase());
      const matchesGroup = groupFilter === "all" || t.group === groupFilter;
      return matchesSearch && matchesGroup;
    });
  }, [search, groupFilter, teams]);

  const groups = [...new Set(teams.map((t) => t.group))].sort();

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
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700"
        >
          <option value="all">所有小組</option>
          {groups.map((g) => <option key={g} value={g}>第 {g} 組</option>)}
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((team) => (
          <Link
            key={team.id}
            href={`/teams/${team.id}`}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <TeamBadge teamId={team.id} size="lg" />
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                {team.group}組
              </span>
            </div>
            <div className="space-y-1.5 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>FIFA 排名</span>
                <span className="font-semibold text-gray-700">#{team.fifa_ranking}</span>
              </div>
              <div className="flex justify-between">
                <span>教練</span>
                <span className="text-gray-700">{team.coach.name}</span>
              </div>
              <div className="flex justify-between">
                <span>隊長</span>
                <span className="text-gray-700">{team.captain}</span>
              </div>
              <div className="flex justify-between">
                <span>最佳成績</span>
                <span className="text-gray-700">{team.best_wc_result}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">🔍</p>
          <p>找不到符合條件的隊伍</p>
        </div>
      )}
    </div>
  );
}
