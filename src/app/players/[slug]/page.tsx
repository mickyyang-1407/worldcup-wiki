"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import playersData from "@/data/players.json";
import teamsData from "@/data/teams.json";
import matchesData from "@/data/schedule.json";
import TeamBadge from "@/components/TeamBadge";
import MatchCard from "@/components/MatchCard";

const positionLabels: Record<string, string> = {
  GK: "守門員",
  DF: "後衛",
  MF: "中場",
  FW: "前鋒",
};

const positionColors: Record<string, string> = {
  GK: "#ca8a04",
  DF: "#2563eb",
  MF: "#16a34a",
  FW: "#dc2626",
};

const positionBgColors: Record<string, string> = {
  GK: "#fef3c7",
  DF: "#dbeafe",
  MF: "#dcfce7",
  FW: "#fee2e2",
};

function safeDecodeSlug(slug: string): string {
  try { return decodeURIComponent(slug); } catch { return slug; }
}

export default function PlayerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [slug, setSlug] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [worldCupGoals, setWorldCupGoals] = useState<number | null>(null);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    const allPlayers = (playersData as any).players as any[];
    const decoded = safeDecodeSlug(slug);
    const player = allPlayers.find((p: any) => p.id === slug) || allPlayers.find((p: any) => p.id === decoded);
    if (!player?.name) return;
    
    // Fetch World Cup goals from ESPN scorers API
    fetch("/api/espn-scorers")
      .then((r) => r.json())
      .then((data) => {
        if (data.topScorers) {
          const scorer = data.topScorers.find((s: any) => 
            s.name.toLowerCase() === player.name.toLowerCase() || 
            player.name.toLowerCase().includes(s.name.toLowerCase()) ||
            s.name.toLowerCase().includes(player.name.toLowerCase().split(' ').pop())
          );
          setWorldCupGoals(scorer ? scorer.goals : 0);
        }
      })
      .catch(() => {});

    const fetchPhoto = async () => {
      try {
        // Try mediawiki pageimages API — more reliable than REST summary
        const mwUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(player.name)}&prop=pageimages&pithumbsize=600&format=json&origin=*`;
        const mwRes = await fetch(mwUrl, { signal: AbortSignal.timeout(6000) });
        if (mwRes.ok) {
          const mwData = await mwRes.json();
          const pages = mwData.query?.pages;
          if (pages) {
            const page = Object.values(pages)[0] as any;
            if (page?.thumbnail?.source) { setPhotoUrl(page.thumbnail.source); return; }
          }
        }
        // Fallback: search Wikipedia and get image from first result
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(player.name + " footballer")}&format=json&origin=*&srlimit=1&srprop=`;
        const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(6000) });
        if (!searchRes.ok) return;
        const searchData = await searchRes.json();
        const title = searchData.query?.search?.[0]?.title;
        if (!title) return;
        const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=600&format=json&origin=*`;
        const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(6000) });
        if (!imgRes.ok) return;
        const imgData = await imgRes.json();
        const imgPages = imgData.query?.pages;
        if (imgPages) {
          const imgPage = Object.values(imgPages)[0] as any;
          if (imgPage?.thumbnail?.source) setPhotoUrl(imgPage.thumbnail.source);
        }
      } catch {}
    };
    fetchPhoto();
  }, [slug]);

  if (!slug) return null;

  const allPlayers = playersData.players as any[];
  const teams = teamsData.teams as any[];
  const matches = matchesData.matches as any[];

  const decoded = safeDecodeSlug(slug);
  const player = allPlayers.find((p: any) => p.id === slug) || allPlayers.find((p: any) => p.id === decoded);

  if (!player) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">找不到此球員</h1>
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-700 mt-4 inline-block cursor-pointer">
          ← 返回
        </button>
      </div>
    );
  }

  const team = teams.find((t: any) => t.id === player.team_id);
  const teamMatches = matches.filter(
    (m: any) => (m.home === player.team_id || m.away === player.team_id) && m.status === "completed"
  ).slice(0, 5);

  const posColor = positionColors[player.position] || "#6404eb";
  const posBg = positionBgColors[player.position] || "#f3f4f6";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="text-sm text-blue-600 hover:text-blue-700 mb-6 inline-block cursor-pointer">
        ← 返回
      </button>

      <div className="flex gap-6 items-start">
        {/* Left: all info */}
        <div className="flex-1 min-w-0">
          {/* Player Header */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4">
              {/* Mobile photo or jersey badge */}
              <div className="shrink-0 md:hidden">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={player.name}
                    className="w-16 h-16 rounded-xl object-cover shadow-md"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                    style={{ background: `linear-gradient(135deg, ${posColor}, ${posColor}88)` }}
                  >
                    {player.jersey_number}
                  </div>
                )}
              </div>
              {/* Desktop jersey badge (hidden on mobile since we show photo above) */}
              <div
                className="w-16 h-16 rounded-full hidden md:flex items-center justify-center text-white text-2xl font-bold shrink-0"
                style={{ background: `linear-gradient(135deg, ${posColor}, ${posColor}88)` }}
              >
                {player.jersey_number}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{player.name_zh}</h1>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: posBg, color: posColor }}
                  >
                    {positionLabels[player.position] || player.position}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-2">{player.name}</p>
                <div className="flex items-center gap-3">
                  <TeamBadge teamId={player.team_id} size="sm" />
                  <span className="text-sm text-gray-500">{team?.name_zh || player.team_id}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-sm text-gray-500">#{player.jersey_number}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{player.age}</div>
              <div className="text-xs text-gray-500 mt-1">年齡</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{player.height_cm ?? "—"}</div>
              <div className="text-xs text-gray-500 mt-1">身高 (cm)</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{player.national_caps}</div>
              <div className="text-xs text-gray-500 mt-1">國家隊出場</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{player.national_goals}</div>
              <div className="text-xs text-gray-500 mt-1">國家隊進球</div>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-100 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{worldCupGoals !== null ? worldCupGoals : "—"}</div>
              <div className="text-xs text-green-600 mt-1">本次世界盃進球</div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">基本資料</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">出生地</div>
                <div className="text-sm text-gray-800">{player.birthplace || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">所屬球會</div>
                <div className="text-sm text-gray-800">{player.club}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">位置</div>
                <div className="text-sm text-gray-800">{positionLabels[player.position] || player.position}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">背號</div>
                <div className="text-sm text-gray-800">#{player.jersey_number}</div>
              </div>
            </div>
          </div>

          {/* Recent Matches */}
          {teamMatches.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">近期比賽</h2>
              <div className="space-y-3">
                {teamMatches.map((m: any) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: big photo — desktop only */}
        <div className="w-64 lg:w-80 shrink-0 hidden md:block">
          <div className="sticky top-6">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={player.name}
                className="w-full rounded-2xl object-cover shadow-xl"
                style={{ aspectRatio: "3/4" }}
              />
            ) : (
              <div
                className="w-full rounded-2xl flex items-center justify-center shadow-xl"
                style={{ aspectRatio: "3/4", background: `linear-gradient(135deg, ${posColor}22, ${posColor}44)` }}
              >
                <div className="text-center">
                  <div className="text-7xl font-bold" style={{ color: posColor }}>{player.jersey_number}</div>
                  <div className="text-sm mt-2" style={{ color: posColor }}>{positionLabels[player.position]}</div>
                </div>
              </div>
            )}
            <p className="text-center text-xs text-gray-400 mt-2">{player.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
