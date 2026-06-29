import { NextResponse } from "next/server";

import { espnNameToSlug, espnStatusToLocal } from "@/lib/espnTeamMap";
import { matches as scheduleMatches } from "@/data/schedule";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function getDateRange() {
  const now = new Date();
  const past = new Date(now.getTime() - 21 * 24 * 3600000);
  const future = new Date(now.getTime() + 21 * 24 * 3600000);
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `${fmt(past)}-${fmt(future)}`;
}

function findStage(homeSlug: string, awaySlug: string, dateStr: string): string {
  const matched = scheduleMatches.find((m: any) => 
    (m.home === homeSlug && m.away === awaySlug) || 
    (m.home === awaySlug && m.away === homeSlug)
  );
  if (matched) {
    return matched.stage;
  }

  if (dateStr) {
    const date = new Date(dateStr);
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    
    if (month === 6) {
      if (day >= 11 && day <= 27) return "group";
      if (day >= 28 && day <= 30) return "round-of-32";
    } else if (month === 7) {
      if (day >= 1 && day <= 2) return "round-of-32";
      if (day >= 3 && day <= 7) return "round-of-16";
      if (day >= 8 && day <= 12) return "quarter-finals";
      if (day >= 13 && day <= 16) return "semi-finals";
      if (day === 17 || day === 18) return "third-place";
      if (day === 19) return "final";
    }
  }
  return "group";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "results";
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    const dateRange = getDateRange();
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateRange}&limit=100`,
      { cache: "no-store", signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) throw new Error("ESPN fetch failed");

    const data = await res.json();
    const events = data.events || [];

    const matches = events.map((event: any) => {
      const comp = event.competitions?.[0] || {};
      const competitors = comp.competitors || [];
      const home = competitors.find((c: any) => c.homeAway === "home");
      const away = competitors.find((c: any) => c.homeAway === "away");
      const espnStatus = comp.status?.type?.name || "";
      const status = espnStatusToLocal(espnStatus);
      const homeSlug = espnNameToSlug(home?.team?.displayName || "");
      const awaySlug = espnNameToSlug(away?.team?.displayName || "");
      const winner = home?.winner === true ? homeSlug : away?.winner === true ? awaySlug : null;

      return {
        id: `espn-${event.id}`,
        date: event.date?.slice(0, 10) || "",
        time: event.date || "",
        home: homeSlug,
        away: awaySlug,
        homeTeamName: home?.team?.displayName || "",
        awayTeamName: away?.team?.displayName || "",
        score: {
          home: status !== "scheduled" && home?.score !== undefined ? parseInt(home.score) : null,
          away: status !== "scheduled" && away?.score !== undefined ? parseInt(away.score) : null,
        },
        status,
        stage: findStage(homeSlug, awaySlug, event.date),
        winner,
        venue: comp.venue?.fullName || "",
        city: comp.venue?.address?.city || "",
        liveMinute: comp.status?.displayClock || null,
      };
    });

    let filtered = matches;
    if (type === "results") {
      filtered = matches
        .filter((m: any) => m.status === "completed")
        .sort((a: any, b: any) => b.time.localeCompare(a.time));
    } else if (type === "live") {
      filtered = matches.filter((m: any) => m.status === "live");
    } else if (type === "upcoming") {
      filtered = matches
        .filter((m: any) => m.status === "scheduled")
        .sort((a: any, b: any) => a.time.localeCompare(b.time));
    } else if (type === "all") {
      filtered = matches.sort((a: any, b: any) => a.time.localeCompare(b.time));
    }

    return NextResponse.json({ source: "espn", matches: filtered.slice(0, limit) });
  } catch (e) {
    return NextResponse.json({ source: "error", matches: [], error: String(e), type: "catch_block", url: "espn/scoreboard" }, { status: 500 });
  }
}
