"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import TeamBadge from "./TeamBadge";
import playersData from "@/data/players.json";
import teamsData from "@/data/teams.json";

const positions = [
  { value: "all", label: "全部位置" },
  { value: "GK", label: "守門員" },
  { value: "DF", label: "後衛" },
  { value: "MF", label: "中場" },
  { value: "FW", label: "前鋒" },
];

interface Player {
  id: string;
  name: string;
  name_zh: string;
  team_id: string;
  position: string;
  age: number;
  club: string;
  national_caps: number;
  national_goals: number;
  jersey_number: number;
}

interface Team {
  id: string;
  name_zh: string;
}

export default function PlayersListClient() {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "age" | "caps">("name");

  const players: Player[] = playersData.players;
  const teams: Team[] = teamsData.teams;

  const filtered = useMemo(() => {
    let result = [...players];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.name_zh.includes(q) || p.name.toLowerCase().includes(q) || p.club.toLowerCase().includes(q)
      );
    }
    if (teamFilter !== "all") result = result.filter((p) => p.team_id === teamFilter);
    if (positionFilter !== "all") result = result.filter((p) => p.position === positionFilter);
    result.sort((a, b) => {
      if (sortBy === "name") return a.name_zh.localeCompare(b.name_zh);
      if (sortBy === "age") return (a.age || 0) - (b.age || 0);
      return (b.national_caps || 0) - (a.national_caps || 0);
    });
    return result;
  }, [search, teamFilter, positionFilter, sortBy, players]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">球員名單</h1>
        <p className="text-gray-500 mt-1">共 {players.length} 名參賽球員</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="搜尋球員姓名、英文名、球會..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm flex-1 min-w-[200px] max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700"
        >
          <option value="all">所有隊伍</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name_zh}</option>
          ))}
        </select>
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700"
        >
          {positions.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700"
        >
          <option value="name">依姓名</option>
          <option value="age">依年齡</option>
          <option value="caps">依出場次數</option>
        </select>
      </div>

      <p className="text-sm text-gray-500 mb-4">共 {filtered.length} 位球員</p>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-gray-500 font-medium">#</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">姓名</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">隊伍</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">位置</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">年齡</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">球會</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">國家隊出場</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">進球</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const team = teams.find((t) => t.id === p.team_id);
                const posLabel = positions.find((po) => po.value === p.position)?.label || p.position;
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-2.5 text-center font-mono text-gray-400">{p.jersey_number}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`/players/${p.id}`} className="font-medium text-gray-800 hover:text-blue-600 transition-colors">
                        {p.name_zh}
                      </Link>
                      <div className="text-xs text-gray-400">{p.name}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <TeamBadge teamId={p.team_id} size="sm" />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.position === "GK" ? "bg-yellow-100 text-yellow-700" :
                        p.position === "DF" ? "bg-blue-100 text-blue-700" :
                        p.position === "MF" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {posLabel}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-gray-700">{p.age}</td>
                    <td className="px-4 py-2.5 text-gray-600 max-w-[150px] truncate">{p.club}</td>
                    <td className="px-4 py-2.5 text-center font-mono text-gray-700">{p.national_caps}</td>
                    <td className="px-4 py-2.5 text-center font-mono text-gray-700">{p.national_goals}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">🔍</p>
          <p>找不到符合條件的球員</p>
        </div>
      )}
    </div>
  );
}
