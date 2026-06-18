import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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

    const liveEvent = events.find((e: any) => {
      const s = e.competitions?.[0]?.status?.type?.name || "";
      return (
        s === "STATUS_IN_PROGRESS" ||
        s === "STATUS_HALFTIME" ||
        s === "STATUS_FIRST_HALF" ||
        s === "STATUS_SECOND_HALF" ||
        s === "STATUS_EXTRA_TIME" ||
        s === "STATUS_PENALTIES"
      );
    });

    if (!liveEvent) return NextResponse.json({ live: false });

    const eventId = liveEvent.id;
    const comp = liveEvent.competitions?.[0] || {};
    const competitors = comp.competitors || [];
    const home = competitors.find((c: any) => c.homeAway === "home");
    const away = competitors.find((c: any) => c.homeAway === "away");

    const matchInfo = {
      eventId,
      homeTeam: home?.team?.displayName || "",
      awayTeam: away?.team?.displayName || "",
      homeScore: home?.score != null ? parseInt(home.score) : 0,
      awayScore: away?.score != null ? parseInt(away.score) : 0,
      homeId: home?.team?.id || "",
      awayId: away?.team?.id || "",
      clock: comp.status?.displayClock || "",
      period: comp.status?.period || 1,
      statusText: comp.status?.type?.shortDetail || "",
      venue: comp.venue?.fullName || "",
    };

    const pbpRes = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/playbyplay?event=${eventId}`,
      { cache: "no-store", signal: AbortSignal.timeout(8000) }
    );
    if (!pbpRes.ok) return NextResponse.json({ live: true, match: matchInfo, plays: [] });

    const pbpData = await pbpRes.json();
    const allPlays: any[] = pbpData.plays || [];

    const plays = allPlays
      .slice(-80)
      .reverse()
      .slice(0, 30)
      .map((p: any) => {
        // ESPN soccer coords: x=0..100 (attacking left→right for home), y=0..100
        const coord = p.coordinate ?? p.coordinates ?? null;
        const teamId: string = p.team?.id || "";
        const side = teamId === matchInfo.homeId ? "home" : teamId === matchInfo.awayId ? "away" : null;

        // Normalize so home always attacks left→right (x: 0→105)
        let nx: number | null = null;
        let ny: number | null = null;
        if (coord && coord.x != null && coord.y != null) {
          nx = parseFloat(coord.x);
          ny = parseFloat(coord.y);
          // If away team, flip x so both teams' attacks go left→right from their own half
          if (side === "away") nx = 100 - nx;
          // Scale to pitch dimensions (0–105, 0–68)
          nx = (nx / 100) * 105;
          ny = (ny / 100) * 68;
        }

        return {
          id: p.id || String(Math.random()),
          clock: p.clock?.displayValue || "",
          text: p.text || "",
          scoringPlay: !!p.scoringPlay,
          type: p.type?.text || "",
          period: p.period?.number || 1,
          homeScore: p.homeScore ?? null,
          awayScore: p.awayScore ?? null,
          team: side,
          x: nx,
          y: ny,
        };
      });

    return NextResponse.json({ live: true, match: matchInfo, plays });
  } catch {
    return NextResponse.json({ live: false });
  }
}
