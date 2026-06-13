"use client";

import { useState, useMemo } from "react";
import HighlightCard from "./HighlightCard";
import matchesData from "@/data/schedule.json";
import highlightsData from "@/data/highlights.json";

const stageLabels: Record<string, string> = {
  group: "小組賽",
  "round-of-16": "16強",
  "quarter-finals": "8強",
  "semi-finals": "準決賽",
  "third-place": "季軍戰",
  final: "決賽",
};

const stageOrder = [
  "group",
  "round-of-16",
  "quarter-finals",
  "semi-finals",
  "third-place",
  "final",
];

interface Match {
  id: string;
  stage: string;
  group: string;
  home: string;
  away: string;
  date: string;
  status: string;
  score: { home: number; away: number };
}

export default function HighlightsListClient() {
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [searchText, setSearchText] = useState("");

  const matches = matchesData.matches as any[];
  const highlightedMatchIds = new Set<string>(
    (highlightsData as any[])
      .filter((h: any) => h.videos?.youtube || h.videos?.bilibili)
      .map((h: any) => h.matchId)
  );

  const highlightedMatches = matches.filter(
    (m) => highlightedMatchIds.has(m.id) || m.status === "completed"
  );

  const filteredByStage = useMemo(() => {
    if (selectedStage === "all") return highlightedMatches;
    return highlightedMatches.filter((m) => m.stage === selectedStage);
  }, [selectedStage, highlightedMatches]);

  const filteredMatches = useMemo(() => {
    if (!searchText.trim()) return filteredByStage;
    const q = searchText.toLowerCase();
    return filteredByStage.filter(
      (m) =>
        m.home.toLowerCase().includes(q) ||
        m.away.toLowerCase().includes(q)
    );
  }, [searchText, filteredByStage]);

  const groupedByStage = useMemo(() => {
    const groups: Record<string, Match[]> = {};
    for (const m of filteredMatches) {
      if (!groups[m.stage]) groups[m.stage] = [];
      groups[m.stage].push(m);
    }
    return groups;
  }, [filteredMatches]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">📺 所有精華影片</h1>
        <p className="text-sm text-gray-500">
          瀏覽所有世界盃比賽的精華影片，支援 YouTube 與 Bilibili 觀看
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setSelectedStage("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedStage === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全部
          </button>
          {stageOrder.map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedStage === stage
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {stageLabels[stage]}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:ml-auto">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="搜尋隊伍..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-56"
          />
        </div>
      </div>

      {/* Match count */}
      <p className="text-sm text-gray-500 mb-6">
        共 {filteredMatches.length} 場比賽
        {selectedStage !== "all" && ` · ${stageLabels[selectedStage]}`}
      </p>

      {/* Match list grouped by stage */}
      {stageOrder.map((stage) => {
        const stageMatches = groupedByStage[stage];
        if (!stageMatches || stageMatches.length === 0) return null;

        return (
          <div key={stage} className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {stageLabels[stage]}
              <span className="text-sm font-normal text-gray-400">
                ({stageMatches.length} 場)
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stageMatches.map((match) => (
                <HighlightCard
                  key={match.id}
                  matchId={match.id}
                  homeTeam={match.home}
                  awayTeam={match.away}
                  date={match.date}
                  stage={match.stage}
                  group={match.group}
                  score={match.score}
                  status={match.status}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {filteredMatches.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🎬</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">暫無精華影片</h3>
          <p className="text-sm text-gray-500">
            比賽進行中，精華影片將在賽後陸續上架
          </p>
        </div>
      )}
    </div>
  );
}
