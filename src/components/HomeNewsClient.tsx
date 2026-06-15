"use client";

import { useEffect, useState } from "react";
import NewsCard from "./NewsCard";

export default function HomeNewsClient() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-36" />
        ))}
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 snap-x snap-mandatory">
      {items.slice(0, 6).map((item: any) => (
        <div key={item.id} className="min-w-[280px] snap-start md:min-w-0">
          <NewsCard
            id={item.id}
            title={item.title}
            source={item.source}
            date={item.date}
            summary={item.summary}
            url={item.url}
          />
        </div>
      ))}
    </div>
  );
}
