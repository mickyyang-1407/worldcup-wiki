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

    // Use summary endpoint — it has commentary + full match details
    const summaryRes = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${eventId}`,
      { cache: "no-store", signal: AbortSignal.timeout(8000) }
    );
    if (!summaryRes.ok) return NextResponse.json({ live: false });

    const summaryData = await summaryRes.json();

    // Extract match info from header
    const headerComp = summaryData.header?.competitions?.[0] || {};
    const competitors: any[] = headerComp.competitors || [];
    const home = competitors.find((c: any) => c.homeAway === "home");
    const away = competitors.find((c: any) => c.homeAway === "away");
    const venue = summaryData.gameInfo?.venue?.fullName || "";

    const matchInfo = {
      eventId,
      homeTeam: home?.team?.displayName || "",
      awayTeam: away?.team?.displayName || "",
      homeScore: home?.score != null ? parseInt(home.score) : 0,
      awayScore: away?.score != null ? parseInt(away.score) : 0,
      clock: headerComp.status?.displayClock || "",
      period: headerComp.status?.period || 1,
      statusText: headerComp.status?.type?.shortDetail || "",
      venue,
    };

    // Parse commentary — deduplicate by play.id
    const commentary: any[] = summaryData.commentary || [];
    const seenIds = new Set<string>();

    const plays = commentary
      .filter((c: any) => {
        const pid = c.play?.id;
        if (!pid || seenIds.has(pid)) return false;
        seenIds.add(pid);
        return true;
      })
      .slice(-60)
      .reverse()
      .slice(0, 35)
      .map((c: any) => {
        const p = c.play;
        const teamName: string = p.team?.displayName || "";
        const side =
          teamName === matchInfo.homeTeam
            ? "home"
            : teamName === matchInfo.awayTeam
            ? "away"
            : null;

        let nx: number | null = null;
        let ny: number | null = null;
        if (p.fieldPositionX != null && p.fieldPositionY != null) {
          nx = (p.fieldPositionX / 100) * 105;
          ny = (p.fieldPositionY / 100) * 68;
          // Flip away team so home always attacks left→right
          if (side === "away") nx = 105 - nx;
        }

        return {
          id: p.id || String(Math.random()),
          clock: c.time?.displayValue || p.clock?.displayValue || "",
          text: c.text || p.text || "",
          scoringPlay: !!p.scoringPlay,
          type: p.type?.text || "",
          period: p.period?.number || 1,
          homeScore: null,
          awayScore: null,
          team: side as "home" | "away" | null,
          x: nx,
          y: ny,
        };
      });

    return NextResponse.json({ live: true, match: matchInfo, plays });
  } catch {
    return NextResponse.json({ live: false });
  }
}
