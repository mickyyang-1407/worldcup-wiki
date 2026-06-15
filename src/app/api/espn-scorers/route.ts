import { NextResponse } from "next/server";

import { espnNameToSlug, espnStatusToLocal } from "@/lib/espnTeamMap";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getDateRange() {
  const now = new Date();
  const past = new Date(now.getTime() - 21 * 24 * 3600000);
  const future = new Date(now.getTime() + 1 * 24 * 3600000);
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `${fmt(past)}-${fmt(future)}`;
}

export async function GET() {
  try {
    const dateRange = getDateRange();
    const boardRes = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateRange}&limit=100`,
      { cache: "no-store" }
    );
    if (!boardRes.ok) throw new Error("scoreboard fetch failed");
    const boardData = await boardRes.json();
    const events = (boardData.events || []) as any[];

    const completedEvents = events.filter((e: any) => {
      const status = e.competitions?.[0]?.status?.type?.name || "";
      return espnStatusToLocal(status) === "completed";
    });

    const totalGoals = completedEvents.reduce((sum: number, e: any) => {
      const comps = e.competitions?.[0]?.competitors || [];
      return sum + comps.reduce((s: number, c: any) => s + (parseInt(c.score) || 0), 0);
    }, 0);

    // Fetch all match summaries in parallel
    const summaries = await Promise.all(
      completedEvents.map((e: any) =>
        fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${e.id}`, { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    );

    const scorerMap: Record<string, { name: string; goals: number; team: string; teamSlug: string }> = {};
    let yellowCards = 0;
    let redCards = 0;
    let ownGoals = 0;

    for (const summary of summaries) {
      if (!summary) continue;
      const keyEvents = summary.keyEvents || [];
      for (const event of keyEvents) {
        const typeText: string = event.type?.text || "";

        if (event.scoringPlay) {
          if (event.ownGoal) {
            ownGoals++;
          } else {
            const scorer = event.participants?.[0]?.athlete?.displayName;
            const teamName = event.team?.displayName || "";
            if (scorer) {
              if (!scorerMap[scorer]) {
                scorerMap[scorer] = { name: scorer, goals: 0, team: teamName, teamSlug: espnNameToSlug(teamName) };
              }
              scorerMap[scorer].goals++;
            }
          }
        } else if (typeText === "Yellow Card") {
          yellowCards++;
        } else if (typeText === "Red Card") {
          redCards++;
        }
      }
    }

    const topScorers = Object.values(scorerMap)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10);

    return NextResponse.json({
      source: "espn",
      totalGoals,
      completedMatches: completedEvents.length,
      avgGoalsPerMatch: completedEvents.length > 0
        ? (totalGoals / completedEvents.length).toFixed(2)
        : "0",
      yellowCards,
      redCards,
      ownGoals,
      topScorers,
    });
  } catch (e) {
    return NextResponse.json({ source: "error", error: String(e) }, { status: 500 });
  }
}
