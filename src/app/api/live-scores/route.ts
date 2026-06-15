import { NextResponse } from "next/server";

import { matches } from "@/data/schedule";

import { teams } from "@/data/teams";

import type { MatchWithLiveData } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ApiMatch {
  id: string;
  number: number;
  stage: string;
  group?: string;
  date: string;
  time: string;
  home: string;
  away: string;
  score: { home: number | null; away: number | null };
  status: string;
  venue: string;
  city: string;
  liveMinute?: number;
}

async function fetchFromFootballDataOrg(): Promise<ApiMatch[]> {
  const apiKey = process.env.LIVE_SCORE_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(
      "https://api.football-data.org/v4/competitions/WC/matches",
      { headers: { "X-Auth-Token": apiKey } }
    );
    if (!res.ok) return [];

    const data = await res.json();
    return (data.matches || []).slice(0, 20).map((m: any) => ({
      id: `live-${m.id}`,
      number: m.matchday || 0,
      stage: m.stage?.toLowerCase() || "group",
      date: m.utcDate?.slice(0, 10) || "",
      time: m.utcDate?.slice(11, 16) || "",
      home: m.homeTeam?.shortName?.toLowerCase().replace(/\s+/g, "-") || "unknown",
      away: m.awayTeam?.shortName?.toLowerCase().replace(/\s+/g, "-") || "unknown",
      score: {
        home: m.score?.fullTime?.home ?? null,
        away: m.score?.fullTime?.away ?? null,
      },
      status:
        m.status === "LIVE"
          ? "live"
          : m.status === "FINISHED"
            ? "completed"
            : "scheduled",
      venue: m.venue || "",
      city: "",
      liveMinute: m.minute,
    }));
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "results";
  const limit = parseInt(searchParams.get("limit") || "5");

  // Try external API first if configured
  const apiKey = process.env.LIVE_SCORE_API_KEY;
  if (apiKey) {
    const externalData = await fetchFromFootballDataOrg();
    if (externalData.length > 0) {
      const filtered = externalData
        .filter((m) => {
          if (type === "results") return m.status === "completed";
          if (type === "live") return m.status === "live";
          if (type === "upcoming") return m.status === "scheduled";
          return true;
        })
        .slice(0, limit);

      if (filtered.length > 0) {
        return NextResponse.json({
          source: "football-data.org",
          matches: filtered,
        });
      }
    }
  }

  // Fallback: local schedule data
  const matchList = matches as any[];
  let filtered: ApiMatch[];

  if (type === "results") {
    filtered = matchList
      .filter((m) => m.status === "completed")
      .sort((a: any, b: any) => b.date.localeCompare(a.date))
      .slice(0, limit);
  } else if (type === "live") {
    filtered = matchList.filter((m) => m.status === "live").slice(0, limit);
  } else if (type === "upcoming") {
    filtered = matchList
      .filter((m) => m.status === "scheduled")
      .sort((a: any, b: any) => a.date.localeCompare(b.date))
      .slice(0, limit);
  } else {
    filtered = matchList.slice(0, limit);
  }

  return NextResponse.json({
    source: "local",
    matches: filtered.map((m: any) => ({
      id: m.id,
      number: m.number,
      stage: m.stage,
      group: m.group,
      date: m.date,
      time: m.time,
      home: m.home,
      away: m.away,
      score: m.score,
      status: m.status,
      venue: m.venue,
      city: m.city,
    })),
  });
}
