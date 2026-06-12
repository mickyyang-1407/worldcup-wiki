"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { countries } from "@/data/countries";

const countryFlags: Record<string, string> = {
  mexico: "🇲🇽", "south-korea": "🇰🇷", "czech-republic": "🇨🇿", "south-africa": "🇿🇦",
  canada: "🇨🇦", brazil: "🇧🇷", "united-states": "🇺🇸", germany: "🇩🇪",
  netherlands: "🇳🇱", japan: "🇯🇵", france: "🇫🇷", argentina: "🇦🇷",
  portugal: "🇵🇹", england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", spain: "🇪🇸", belgium: "🇧🇪",
  morocco: "🇲🇦", haiti: "🇭🇹", scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", paraguay: "🇵🇾",
  australia: "🇦🇺", turkey: "🇹🇷", curacao: "🇨🇼", "ivory-coast": "🇨🇮",
  ecuador: "🇪🇨", sweden: "🇸🇪", tunisia: "🇹🇳", egypt: "🇪🇬",
  iran: "🇮🇷", "new-zealand": "🇳🇿", "cape-verde": "🇨🇻", "saudi-arabia": "🇸🇦",
  uruguay: "🇺🇾", senegal: "🇸🇳", iraq: "🇮🇶", norway: "🇳🇴",
  algeria: "🇩🇿", austria: "🇦🇹", jordan: "🇯🇴", "dr-congo": "🇨🇩",
  uzbekistan: "🇺🇿", colombia: "🇨🇴", croatia: "🇭🇷", ghana: "🇬🇭",
  panama: "🇵🇦", "bosnia-and-herzegovina": "🇧🇦", qatar: "🇶🇦", switzerland: "🇨🇭",
};

const continents = [
  { value: "all", label: "所有洲" },
  { value: "Asia", label: "亞洲" },
  { value: "Africa", label: "非洲" },
  { value: "Europe", label: "歐洲" },
  { value: "North America", label: "北美洲" },
  { value: "South America", label: "南美洲" },
  { value: "Oceania", label: "大洋洲" },
];

export default function CountriesPage() {
  const [search, setSearch] = useState("");
  const [continentFilter, setContinentFilter] = useState("all");

  const filtered = useMemo(() => {
    return (countries as any[]).filter((c: any) => {
      const matchesSearch = !search || 
        c.name_zh.includes(search) || 
        c.name.toLowerCase().includes(search.toLowerCase());
      const matchesContinent = continentFilter === "all" || c.continent === continentFilter;
      return matchesSearch && matchesContinent;
    });
  }, [search, continentFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">參賽國家</h1>
        <p className="text-gray-500 mt-1">48 支隊伍來自 48 個國家/地區</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="搜尋國家..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm flex-1 min-w-[200px] max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex flex-wrap gap-1">
          {continents.map((c) => (
            <button
              key={c.value}
              onClick={() => setContinentFilter(c.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                continentFilter === c.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((country: any) => (
          <Link
            key={country.id}
            href={`/teams/${country.teams[0]}`}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-lg">{countryFlags[country.id] || ""} {country.name_zh}</h3>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                {continentFilter !== "all" ? country.continent : 
                  continents.find((c) => c.value === country.continent)?.label || country.continent}
              </span>
            </div>
            <div className="space-y-1.5 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>世界盃參賽</span>
                <span className="font-semibold text-gray-700">{country.wc_appearances} 次</span>
              </div>
              <div className="flex justify-between">
                <span>最佳成績</span>
                <span className="font-semibold text-gray-700">{country.best_result}</span>
              </div>
              <div className="flex justify-between">
                <span>參賽隊伍</span>
                <span className="font-semibold text-gray-700">{country.total_teams} 隊</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
