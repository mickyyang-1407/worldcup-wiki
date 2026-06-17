import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Step 1: Find any currently live match
    const now = new Date();
    const past = new Date(now.getTime() - 2 * 86400000);
    const future = new Date(now.getTime() + 1 * 86400000);
    const fmt = (d: Date) =>
      `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;

    const boardRes = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${fmt(past)}-${fmt(future)}&limit=50`,
      { cache: "no-store", signal: AbortSignal.timeout(8000) }
    );
    if (!boardRes.ok) return NextResponse.json({ live: false });

    const boardData = await boardRes.json();
    const events: any[] = boardData.events || [];

    // Find a live event (status = "in" or "STATUS_IN_PROGRESS")
    const liveEvent = events.find((e: any) => {
      const s = e.competitions?.[0]?.status?.type?.name || "";
      return s === "STATUS_IN_PROGRESS" || s === "STATUS_HALFTIME";
    });

    if (!liveEvent) {
      return NextResponse.json({ live: false });
    }

    const eventId = liveEvent.id;
    const comp = liveEvent.competitions?.[0] || {};
    const competitors = comp.competitors || [];
    const home = competitors.find((c: any) => c.homeAway === "home");
    const away = competitors.find((c: any) => c.homeAway === "away");

    const matchInfo = {
      eventId,
      homeTeam: home?.team?.displayName || "",
      awayTeam: away?.team?.displayName || "",
      homeFlag: home?.team?.flag || "",
      homeScore: home?.score != null ? parseInt(home.score) : 0,
      awayScore: away?.score != null ? parseInt(away.score) : 0,
      clock: comp.status?.displayClock || "",
      period: comp.status?.period || 1,
      statusText: comp.status?.type?.shortDetail || "",
      venue: comp.venue?.fullName || "",
    };

    // Step 2: Fetch play-by-play
    const pbpRes = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/playbyplay?event=${eventId}`,
      { cache: "no-store", signal: AbortSignal.timeout(8000) }
    );
    if (!pbpRes.ok) {
      return NextResponse.json({ live: true, match: matchInfo, plays: [] });
    }

    const pbpData = await pbpRes.json();
    const allPlays: any[] = pbpData.plays || [];

    // Return latest 25 plays, newest first
    const plays = allPlays
      .slice(-50)
      .reverse()
      .slice(0, 25)
      .map((p: any) => ({
        id: p.id || String(Math.random()),
        clock: p.clock?.displayValue || "",
        text: p.text || "",
        scoringPlay: !!p.scoringPlay,
        type: p.type?.text || "",
        period: p.period?.number || 1,
        homeScore: p.homeScore ?? null,
        awayScore: p.awayScore ?? null,
      }));

    return NextResponse.json({ live: true, match: matchInfo, plays });
  } catch {
    return NextResponse.json({ live: false });
  }
}
