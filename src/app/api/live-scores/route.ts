import { NextResponse } from "next/server";
import { fetchLiveMatches, fetchLatestResults, fetchUpcomingMatches } from "@/lib/liveScores";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "results";
  const limit = parseInt(searchParams.get("limit") || "5");

  try {
    let matches = [];
    if (type === "live") {
      matches = await fetchLiveMatches();
    } else if (type === "results") {
      matches = await fetchLatestResults(limit);
    } else if (type === "upcoming") {
      matches = await fetchUpcomingMatches(limit);
    } else {
      // all
      const live = await fetchLiveMatches();
      const results = await fetchLatestResults(limit);
      const upcoming = await fetchUpcomingMatches(limit);
      matches = [...live, ...results, ...upcoming];
    }

    return NextResponse.json({
      source: "espn",
      matches: matches.slice(0, limit),
    });
  } catch (e) {
    return NextResponse.json({ source: "error", matches: [], error: String(e) }, { status: 500 });
  }
}

