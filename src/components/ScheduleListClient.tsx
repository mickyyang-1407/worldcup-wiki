"use client";

import { useState, useMemo } from "react";
import MatchCard from "./MatchCard";

const stages = [
  { value: "all", label: "全部" },
  { value: "group", label: "小組賽" },
  { value: "round-of-16", label: "16強" },
  { value: "quarter-finals", label: "8強" },
  { value: "semi-finals", label: "準決賽" },
  { value: "third-place", label: "季軍戰" },
  { value: "final", label: "決賽" },
];

const statusFilters = [
  { value: "all", label: "全部" },
  { value: "completed", label: "已結束" },
  { value: "live", label: "進行中" },
  { value: "upcoming", label: "未開始" },
];

interface Match {
  id: string;
  stage: string;
  status: string;
  group: string;
  date: string;
  time: string;
}

interface Group {
  id: string;
  name: string;
}

export default function ScheduleListClient({ matches, groups }: { matches: Match[]; groups: Group[] }) {
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let result = [...matches];
    if (stageFilter !== "all") result = result.filter((m) => m.stage === stageFilter);
    if (statusFilter !== "all") result = result.filter((m) => m.status === statusFilter);
    if (groupFilter !== "all") result = result.filter((m) => m.group === groupFilter);
    result.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return result;
  }, [stageFilter, statusFilter, groupFilter, sortOrder, matches]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">賽程</h1>
        <p className="text-gray-500 mt-1">2026 世界盃全部 104 場比賽</p>
      </div>

      {/* Stage filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex flex-wrap gap-1">
          {stages.map((s) => (
            <button
              key={s.value}
              onClick={() => setStageFilter(s.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                stageFilter === s.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="flex gap-1">
          {statusFilters.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s.value
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 bg-white text-gray-700"
        >
          <option value="all">所有小組</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          {sortOrder === "asc" ? "↑ 最早優先" : "↓ 最晚優先"}
        </button>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">共 {filtered.length} 場比賽</p>

      {/* Matches grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">⚽</p>
          <p>沒有符合條件的比賽</p>
        </div>
      )}
    </div>
  );
}
