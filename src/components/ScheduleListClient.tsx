"use client";

import { useState, useMemo, useEffect } from "react";
import MatchCard from "./MatchCard";
import PageHero from "./PageHero";
import matchesData from "@/data/schedule.json";
import groupsData from "@/data/groups.json";
import { toTaipeiTime, formatDate } from "@/lib/timezone";

const stages = [
  { value: "all", label: "全部" },
  { value: "group", label: "小組賽" },
  { value: "round-of-32", label: "32強" },
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
  number: number;
  stage: string;
  status: string;
  group: string;
  date: string;
  time: string;
  home: string;
  away: string;
  score: { home: number; away: number };
  venue: string;
  city: string;
}

interface Group {
  id: string;
  name: string;
}

function getTodayStr(): string {
  const now = new Date();
  // Taipei time
  const taipei = new Date(now.getTime() + 8 * 3600000);
  return taipei.toISOString().slice(0, 10);
}

export default function ScheduleListClient() {
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [matches, setMatches] = useState<any[]>(matchesData.matches as any[]);
  const groups: Group[] = groupsData.groups;

  const fetchData = () => {
    fetch("/api/espn?type=all&limit=150")
      .then((r) => r.json())
      .then((data) => {
        if (!data.matches?.length) return;
        const espnMap: Record<string, any> = {};
        for (const m of data.matches) {
          const key = `${m.home}|${m.away}`;
          espnMap[key] = m;
        }
        setMatches((prev) =>
          prev.map((m) => {
            const live = espnMap[`${m.home}|${m.away}`];
            if (!live) return m;
            return { ...m, status: live.status, score: live.score };
          })
        );
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchData();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
  const todayStr = getTodayStr();

  const filtered = useMemo(() => {
    let result = [...matches];
    if (stageFilter !== "all") result = result.filter((m) => m.stage === stageFilter);
    if (statusFilter !== "all") result = result.filter((m) => m.status === statusFilter);
    if (groupFilter !== "all") result = result.filter((m) => m.group === groupFilter);
    if (showTodayOnly) result = result.filter((m) => m.date === todayStr);
    result.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return result;
  }, [stageFilter, statusFilter, groupFilter, sortOrder, showTodayOnly, matches, todayStr]);

  // Group by date when showing all stages
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Match[]> = {};
    for (const m of filtered) {
      if (!groups[m.date]) groups[m.date] = [];
      groups[m.date].push(m);
    }
    return groups;
  }, [filtered]);

  const stageLabels: Record<string, string> = {
    group: "小組賽",
    "round-of-32": "32強",
    "round-of-16": "16強",
    "quarter-finals": "8強",
    "semi-finals": "準決賽",
    "third-place": "季軍戰",
    final: "決賽",
  };

  const stageColors: Record<string, string> = {
    group: "#8286cd",
    "round-of-32": "#c25975",
    "round-of-16": "#af3525",
    "quarter-finals": "#26458b",
    "semi-finals": "#a4c44d",
    "third-place": "#5b2227",
    final: "#907ad6",
  };

  return (
    <div>
      <PageHero
        gradient="#26458b"
        title="賽程"
        subtitle="2026 世界盃全部 104 場比賽 · 時間已轉換為台北時間 (UTC+8)"
        tag="Schedule"
        icon="📅"
      />

      {/* Stage filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex flex-wrap gap-1">
          {stages.map((s) => (
            <button
              key={s.value}
              onClick={() => { setStageFilter(s.value); setShowTodayOnly(false); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                stageFilter === s.value
                  ? "text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={stageFilter === s.value ? { background: '#6404eb' } : undefined}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status + Group + Today + Sort filters */}
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
          onClick={() => setShowTodayOnly(!showTodayOnly)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            showTodayOnly
              ? "bg-orange-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          📅 今天
        </button>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          {sortOrder === "asc" ? "↑ 最早優先" : "↓ 最晚優先"}
        </button>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">共 {filtered.length} 場比賽</p>

      {/* Matches grouped by date */}
      {stageFilter === "all" && !showTodayOnly ? (
        Object.keys(groupedByDate)
          .sort((a, b) => sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a))
          .map((date) => {
            const dayMatches = groupedByDate[date];
            const isToday = date === todayStr;
            return (
              <div key={date} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`text-sm font-bold ${isToday ? "text-orange-600" : "text-gray-700"}`}>
                    {(() => {
                      // Try to parse date in Taipei timezone context
                      const d = new Date(date + "T00:00:00");
                      return d.toLocaleDateString("zh-TW", {
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                      });
                    })()}
                  </div>
                  {isToday && (
                    <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                      今天
                    </span>
                  )}
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">{dayMatches.length} 場</span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayMatches.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </div>
            );
          })
      ) : (
        <>
          {/* Stage section view when filtering by stage */}
          {stageFilter !== "all" && (
            <div className="mb-4 flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: stageColors[stageFilter] || "#6404eb" }}
              />
              <span className="text-sm font-bold" style={{ color: stageColors[stageFilter] || "#6404eb" }}>
                {stageLabels[stageFilter] || stageFilter}
              </span>
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">⚽</p>
          <p>沒有符合條件的比賽</p>
        </div>
      )}
    </div>
  );
}
