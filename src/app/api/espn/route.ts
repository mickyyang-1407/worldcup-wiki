import { NextResponse } from "next/server";
import { espnNameToSlug, espnStatusToLocal } from "@/lib/espnTeamMap";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getDateRange() {
  const now = new Date();
  const past = new Date(now.getTime() - 7 * 24 * 3600000);
  const future = new Date(now.getTime() + 14 * 24 * 3600000);
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `${fmt(past)}-${fmt(future)}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "results";
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    const dateRange = getDateRange();
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateRange}&limit=100`,
      { cache: "no-store" }
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

      return {
        id: `espn-${event.id}`,
        date: event.date?.slice(0, 10) || "",
        time: event.date || "",
        home: espnNameToSlug(home?.team?.displayName || ""),
        away: espnNameToSlug(away?.team?.displayName || ""),
        homeTeamName: home?.team?.displayName || "",
        awayTeamName: away?.team?.displayName || "",
        score: {
          home: status !== "scheduled" && home?.score !== undefined ? parseInt(home.score) : null,
          away: status !== "scheduled" && away?.score !== undefined ? parseInt(away.score) : null,
        },
        status,
        stage: "group",
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
    }

    return NextResponse.json({ source: "espn", matches: filtered.slice(0, limit) });
  } catch (e) {
    return NextResponse.json({ source: "error", matches: [], error: String(e) }, { status: 500 });
  }
}
