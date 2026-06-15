"use client";

import { useState } from "react";
import Link from "next/link";
import PageHero from "./PageHero";
import teamsData from "@/data/teams.json";
import { TEAM_FLAGS } from "@/data/teamFlags";

const GROUP_COLORS: Record<string, string> = {
  A: "#a4c44d", B: "#b1301f", C: "#2d47cb", D: "#907ad6",
  E: "#5b2227", F: "#1c433a", G: "#4b1cc3", H: "#7cd4c2",
  I: "#9d6d7b", J: "#98783d", K: "#c64524", L: "#7c2926",
};

const GROUP_ORDER = ["A","B","C","D","E","F","G","H","I","J","K","L"];

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

  const teams: Team[] = teamsData.teams;

  const filtered = search
    ? teams.filter((t) =>
        t.name_zh.includes(search) ||
        t.name.toLowerCase().includes(search.toLowerCase())
      )
    : teams;

  if (search) {
    return (
      <div>
        <PageHero
          gradient="linear-gradient(135deg, #26458b 0%, #1c433a 100%)"
          title="參賽隊伍"
          subtitle="48 支來自六大洲的頂尖國家隊"
          tag="Teams"
          icon="⚽"
        />
        <input
          type="text"
          placeholder="搜尋隊伍..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((team) => {
            const iso2 = TEAM_FLAGS[team.id];
            return (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="flex flex-col items-center gap-2 bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all"
              >
                {iso2 ? (
                  <span className={`fi fi-${iso2} fis`} style={{ fontSize: "2.5rem", borderRadius: "4px" }} />
                ) : (
                  <span style={{ fontSize: "2.5rem" }}>🏳️</span>
                )}
                <span className="text-sm font-medium text-gray-800 text-center leading-tight">{team.name_zh}</span>
              </Link>
            );
          })}
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

  return (
    <div>
      <PageHero
        gradient="linear-gradient(135deg, #26458b 0%, #1c433a 100%)"
        title="參賽隊伍"
        subtitle="48 支來自六大洲的頂尖國家隊"
        tag="Teams"
        icon="⚽"
      />

      <input
        type="text"
        placeholder="搜尋隊伍..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8"
      />

      <div className="space-y-6">
        {GROUP_ORDER.map((group) => {
          const groupTeams = teams.filter((t) => t.group === group);
          if (groupTeams.length === 0) return null;
          const color = GROUP_COLORS[group] || "#2d47cb";
          return (
            <div
              key={group}
              className="rounded-xl overflow-hidden border-2"
              style={{ borderColor: color }}
            >
              {/* Group header — full-width colored bar */}
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
              >
                <h2 className="text-white font-bold text-lg">{group} 組</h2>
                <span className="text-white/60 text-sm">{groupTeams.length} 隊</span>
              </div>
              {/* Teams grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4">
                {groupTeams.map((team) => {
                  const iso2 = TEAM_FLAGS[team.id];
                  return (
                    <Link
                      key={team.id}
                      href={`/teams/${team.id}`}
                      className="flex flex-col items-center gap-2 bg-gray-50 hover:bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group"
                    >
                      {iso2 ? (
                        <span
                          className={`fi fi-${iso2} fis`}
                          style={{ fontSize: "2.5rem", borderRadius: "4px" }}
                        />
                      ) : (
                        <span style={{ fontSize: "2.5rem" }}>🏳️</span>
                      )}
                      <span className="text-sm font-medium text-gray-800 text-center leading-tight group-hover:text-blue-600 transition-colors">
                        {team.name_zh}
                      </span>
                      <span className="text-xs text-gray-400">#{team.fifa_ranking}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
