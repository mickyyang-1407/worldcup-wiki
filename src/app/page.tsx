"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { matches } from "@/data/schedule";
import { teams } from "@/data/teams";
import { venues } from "@/data/venues";
import MatchCard from "@/components/MatchCard";

export default function Home() {
  const [today, setToday] = useState("2026-06-12");

  useEffect(() => {
    const d = new Date();
    setToday(d.toISOString().slice(0, 10));
  }, []);

  const completed = matches.filter((m: any) => m.status === "completed").slice(0, 4);
  const upcoming = matches.filter((m: any) => m.status === "upcoming").slice(0, 4);

  const stats = [
    { label: "參賽隊伍", value: teams.length, icon: "🏆", color: "bg-blue-500" },
    { label: "比賽場次", value: matches.length, icon: "⚽", color: "bg-green-500" },
    { label: "比賽場館", value: venues.length, icon: "🏟️", color: "bg-purple-500" },
    { label: "主辦國", value: 3, icon: "🌍", color: "bg-orange-500" },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              2026年6月11日 — 7月19日
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
              2026 FIFA 世界盃
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              美國、加拿大、墨西哥三國聯辦 &middot; 48 隊 &middot; 104 場比賽 &middot; 16 座場館
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/schedule"
                className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
              >
                查看賽程 →
              </Link>
              <Link
                href="/groups"
                className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors"
              >
                小組積分 →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Latest Results */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">最新賽果</h2>
              <Link href="/schedule" className="text-sm text-blue-600 hover:text-blue-700">查看全部 →</Link>
            </div>
            <div className="space-y-3">
              {completed.map((m: any) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>

          {/* Upcoming */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">即將開賽</h2>
              <Link href="/schedule" className="text-sm text-blue-600 hover:text-blue-700">查看全部 →</Link>
            </div>
            <div className="space-y-3">
              {upcoming.map((m: any) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        </div>

        {/* Quick links */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">快速導覽</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: "/teams", label: "48 支隊伍", icon: "👥", desc: "瀏覽所有參賽隊伍" },
              { href: "/players", label: "球員名單", icon: "⭐", desc: "搜尋球員資訊" },
              { href: "/knockout", label: "淘汰賽", icon: "🏅", desc: "16 強至決賽對陣" },
              { href: "/venues", label: "場館介紹", icon: "🏟️", desc: "16 座世界級場館" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="text-2xl mb-2">{link.icon}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{link.label}</h3>
                <p className="text-xs text-gray-500 mt-1">{link.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
