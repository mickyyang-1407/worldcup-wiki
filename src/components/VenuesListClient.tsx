"use client";

import { useState, useMemo } from "react";

const countries = ["Mexico", "United States", "Canada"];

interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  opened: number;
  description: string;
}

export default function VenuesListClient({ venues }: { venues: Venue[] }) {
  const [countryFilter, setCountryFilter] = useState("all");

  const filtered = useMemo(() => {
    if (countryFilter === "all") return venues;
    return venues.filter((v) => v.country === countryFilter);
  }, [countryFilter, venues]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">比賽場館</h1>
        <p className="text-gray-500 mt-1">16 座橫跨三國的頂級足球場館</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCountryFilter("all")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            countryFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          全部
        </button>
        {countries.map((c) => (
          <button
            key={c}
            onClick={() => setCountryFilter(c)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              countryFilter === c ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c === "Mexico" ? "🇲🇽 墨西哥" : c === "United States" ? "🇺🇸 美國" : "🇨🇦 加拿大"}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((venue) => (
          <div key={venue.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-5">
              <h3 className="text-xl font-bold text-white">{venue.name}</h3>
              <p className="text-sm text-gray-300 mt-1">
                {venue.city}，{venue.country}
              </p>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg px-4 py-2 text-center">
                  <div className="text-xs text-gray-500">容納人數</div>
                  <div className="text-lg font-bold text-gray-900">{venue.capacity.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 rounded-lg px-4 py-2 text-center">
                  <div className="text-xs text-gray-500">啟用年份</div>
                  <div className="text-lg font-bold text-gray-900">{venue.opened}</div>
                </div>
                <div className="bg-gray-50 rounded-lg px-4 py-2 text-center">
                  <div className="text-xs text-gray-500">國家</div>
                  <div className="text-lg font-bold text-gray-900">
                    {venue.country === "Mexico" ? "🇲🇽" : venue.country === "United States" ? "🇺🇸" : "🇨🇦"}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{venue.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
