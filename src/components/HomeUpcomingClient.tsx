"use client";

import { useEffect, useState } from "react";
import MatchCard from "./MatchCard";
import Link from "next/link";

export default function HomeUpcomingClient() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    fetch("/api/espn?type=upcoming&limit=6")
      .then((r) => r.json())
      .then((d) => {
        setMatches(d.matches || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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

  return (
    <section className="mb-8">
      <div
        className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between"
        style={{ background: "#6e9400" }}
      >
        <h2 className="text-xl font-bold text-white">即將開賽</h2>
        <Link href="/schedule" className="text-sm font-semibold text-white/80 hover:text-white transition-colors">
          完整賽程 →
        </Link>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm p-5">
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-gray-100 dark:bg-white/10 rounded" />
            <div className="h-16 bg-gray-100 dark:bg-white/10 rounded" />
          </div>
        </div>
      ) : matches.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {matches.slice(0, 4).map((m: any) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      ) : (
        <div className="col-span-2 text-center py-8 text-gray-400">
          <p className="text-3xl mb-2">📅</p>
          <p>暫無即將開賽的賽事</p>
        </div>
      )}
    </section>
  );
}
