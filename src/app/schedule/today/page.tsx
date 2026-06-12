"use client";

import { useState, useEffect } from "react";
import MatchCard from "@/components/MatchCard";
import { matches } from "@/data/schedule";

export default function TodayPage() {
  const [today, setToday] = useState("");

  useEffect(() => {
    const d = new Date();
    setToday(d.toISOString().slice(0, 10));
  }, []);

  const todayMatches = today
    ? (matches as any[]).filter((m: any) => m.date === today)
    : [];

  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("zh-TW", {
      year: "numeric", month: "long", day: "numeric", weekday: "long",
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">今日比賽</h1>
      <p className="text-gray-500 mb-8">
        {today ? formatDate(today) : "載入中..."}
      </p>

      {todayMatches.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {todayMatches.map((m: any) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-5xl mb-4">📅</p>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">今日沒有比賽</h2>
          <p className="text-gray-400">查看完整的賽程安排</p>
        </div>
      )}
    </div>
  );
}
