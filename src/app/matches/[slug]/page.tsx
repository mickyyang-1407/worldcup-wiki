"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TeamBadge from "@/components/TeamBadge";
import teamsData from "@/data/teams.json";



function StatBar({ label, homeVal, awayVal }: { label: string; homeVal: any; awayVal: any }) {
  const h = parseFloat(homeVal) || 0;
  const a = parseFloat(awayVal) || 0;
  const total = h + a || 1;
  const hPct = Math.round((h / total) * 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span className="font-semibold text-gray-800">{homeVal ?? "—"}</span>
        <span className="text-gray-400">{label}</span>
        <span className="font-semibold text-gray-800">{awayVal ?? "—"}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100">
        <div className="bg-blue-500 rounded-l-full transition-all" style={{ width: `${hPct}%` }} />
        <div className="bg-orange-400 rounded-r-full transition-all" style={{ width: `${100 - hPct}%` }} />
      </div>
    </div>
  );
}

function EventIcon({ type }: { type: string }) {
  if (type === "goal" || type === "penalty") return <span className="text-base">⚽</span>;
  if (type === "own-goal") return <span className="text-base">🔴⚽</span>;
  if (type === "yellow") return <span className="inline-block w-3.5 h-4 bg-yellow-400 rounded-sm" />;
  if (type === "red") return <span className="inline-block w-3.5 h-4 bg-red-600 rounded-sm" />;
  if (type === "sub") return <span className="text-base">🔄</span>;
  return null;
}

export default function MatchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    params.then(({ slug }) => {
      const parts = slug.split("--");
      if (parts.length < 3) { setError(true); setLoading(false); return; }
      const date = parts[parts.length - 1];
      const away = parts[parts.length - 2];
      const home = parts.slice(0, parts.length - 2).join("--");
      fetch(`/api/match-detail?home=${home}&away=${away}&date=${date}`)
        .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
        .then(setDetail)
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    });
  }, [params]);

  const teams = teamsData.teams as any[];
  const homeTeam = detail ? teams.find((t) => t.id === detail.home) : null;
  const awayTeam = detail ? teams.find((t) => t.id === detail.away) : null;

  if (loading) return (
    <div className="animate-pulse space-y-4 py-8">
      <div className="h-32 bg-gray-100 rounded-xl" />
      <div className="h-48 bg-gray-100 rounded-xl" />
    </div>
  );

  if (error || !detail) return (
    <div className="py-16 text-center">
      <div className="text-4xl mb-3">❌</div>
      <p className="text-gray-500 mb-4">找不到比賽資料（ESPN 可能尚未收錄）</p>
      <button onClick={() => router.back()} className="text-blue-600 hover:underline text-sm cursor-pointer">← 返回</button>
    </div>
  );

  const isCompleted = detail.status === "completed";
  const isUpcoming = detail.status === "upcoming";
  const homeEvents = detail.keyEvents.filter((e: any) => e.team === "home");
  const awayEvents = detail.keyEvents.filter((e: any) => e.team === "away");

  const statKeys = [
    { key: "possessionPct", label: "控球率 %" },
    { key: "totalShots", label: "射門" },
    { key: "shotsOnTarget", label: "射正" },
    { key: "wonCorners", label: "角球" },
    { key: "foulsCommitted", label: "犯規" },
    { key: "offsides", label: "越位" },
    { key: "saves", label: "撲救" },
    { key: "yellowCards", label: "黃牌" },
    { key: "redCards", label: "紅牌" },
  ];

  function formatTime(iso: string) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) throw new Error();
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).formatToParts(d);
      const map = new Map(parts.map((p) => [p.type, p.value]));
      return `${map.get("month")}/${map.get("day")} ${map.get("hour")}:${map.get("minute")} 台北時間`;
    } catch { 
      const datePart = iso.slice(0, 10);
      const match = datePart.match(/^\d{4}-(\d{2})-(\d{2})$/);
      if (match) {
        const m = parseInt(match[1], 10);
        const d = parseInt(match[2], 10);
        return `${m}/${d} 台北時間`;
      }
      return iso ? `${iso} 台北時間` : "";
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block cursor-pointer">
        ← 返回
      </button>

      {/* Match Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div
          className="px-6 py-8"
          style={{ background: isCompleted ? "#2d1b4e" : "#2c5364" }}
        >
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Home */}
            <div className="flex flex-col items-center gap-2">
              <TeamBadge teamId={detail.home} size="lg" />
              <div className="text-center">
                <div className="text-white font-bold text-lg leading-tight">{homeTeam?.name_zh || detail.home}</div>
                <div className="text-white/50 text-xs">{homeTeam?.name}</div>
              </div>
            </div>

            {/* Score / VS */}
            <div className="flex flex-col items-center gap-2">
              {isCompleted ? (
                <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">
                  {detail.score.home} — {detail.score.away}
                </div>
              ) : (
                <div className="text-3xl font-bold text-white/60">vs</div>
              )}
              <div className="text-white/50 text-xs text-center">{formatTime(detail.time)}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isCompleted ? "bg-green-500/20 text-green-300" :
                detail.status === "live" ? "bg-red-500/20 text-red-300 animate-pulse" :
                "bg-white/10 text-white/60"
              }`}>
                {isCompleted ? "已結束" : detail.status === "live" ? "進行中" : "即將開賽"}
              </span>
            </div>

            {/* Away */}
            <div className="flex flex-col items-center gap-2">
              <TeamBadge teamId={detail.away} size="lg" />
              <div className="text-center">
                <div className="text-white font-bold text-lg leading-tight">{awayTeam?.name_zh || detail.away}</div>
                <div className="text-white/50 text-xs">{awayTeam?.name}</div>
              </div>
            </div>
          </div>

          {detail.venue && (
            <div className="text-center mt-4 text-white/40 text-xs">
              📍 {detail.venue}{detail.city ? ` · ${detail.city}` : ""}
            </div>
          )}
        </div>
      </div>

      {/* Completed: Key Events + Stats */}
      {isCompleted && (
        <>
          {/* Key Events Timeline */}
          {detail.keyEvents.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">比賽事件</h2>
              <div className="space-y-1">
                {detail.keyEvents
                  .filter((e: any) => e.type !== "sub")
                  .map((e: any, i: number) => (
                  <div key={i} className={`flex items-center gap-3 py-1.5 ${e.team === "home" ? "flex-row" : "flex-row-reverse"}`}>
                    <div className="w-8 text-center shrink-0">
                      <EventIcon type={e.type} />
                    </div>
                    <div className={`flex-1 text-sm ${e.team === "home" ? "text-left" : "text-right"}`}>
                      <span className="font-semibold text-gray-800">{e.player}</span>
                      {e.assist && <span className="text-gray-400 text-xs ml-1">(助攻: {e.assist})</span>}
                      {e.playerIn && <span className="text-green-600"> ↑{e.playerIn}</span>}
                      {e.playerOut && <span className="text-red-500"> ↓{e.playerOut}</span>}
                    </div>
                    <div className="w-10 text-center shrink-0">
                      <span className="text-xs font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{e.minute}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Substitutions */}
          {detail.keyEvents.filter((e: any) => e.type === "sub").length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">換人</h2>
              <div className="grid md:grid-cols-2 gap-1">
                {detail.keyEvents.filter((e: any) => e.type === "sub").map((e: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-gray-50">
                    <TeamBadge teamId={e.team === "home" ? detail.home : detail.away} size="sm" />
                    <span className="text-gray-400 shrink-0">{e.minute}</span>
                    <span className="text-green-600">↑ {e.playerIn}</span>
                    <span className="text-gray-300">/</span>
                    <span className="text-red-500">↓ {e.playerOut}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          {(detail.stats.home.possessionPct || detail.stats.home.totalShots) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <TeamBadge teamId={detail.home} size="sm" />
                  <span className="text-sm font-semibold text-blue-600">{homeTeam?.name_zh}</span>
                </div>
                <span className="text-xs text-gray-400">技術統計</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-orange-500">{awayTeam?.name_zh}</span>
                  <TeamBadge teamId={detail.away} size="sm" />
                </div>
              </div>
              {statKeys.map(({ key, label }) => {
                if (detail.stats.home[key] == null && detail.stats.away[key] == null) return null;
                return (
                  <StatBar
                    key={key}
                    label={label}
                    homeVal={detail.stats.home[key] ?? 0}
                    awayVal={detail.stats.away[key] ?? 0}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
}
