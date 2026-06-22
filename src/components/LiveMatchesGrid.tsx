"use client";

import { useState, useEffect } from "react";
import MatchCard from "./MatchCard";

interface LiveMatchesGridProps {
  initialMatches: any[];
}

export default function LiveMatchesGrid({ initialMatches }: LiveMatchesGridProps) {
  const [matches, setMatches] = useState<any[]>(initialMatches);

  const fetchData = () => {
    fetch("/api/espn?type=all&limit=150")
      .then((r) => r.json())
      .then((data) => {
        if (!data.matches?.length) return;
        const espnMap: Record<string, any> = {};
        for (const m of data.matches) {
          espnMap[`${m.home}|${m.away}`] = m;
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
    const timer = setInterval(fetchData, 30000);
    const onVisible = () => { if (document.visibilityState === "visible") fetchData(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, []);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {matches.map((m) => (
        <MatchCard key={m.id} match={m} />
      ))}
    </div>
  );
}
