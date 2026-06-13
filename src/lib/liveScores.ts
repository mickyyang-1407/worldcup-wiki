import type { MatchWithLiveData, Standing } from "./types";
import { matches } from "@/data/schedule";
import { teams } from "@/data/teams";

/**
 * Fetch currently live matches.
 * Currently returns static data from schedule.json.
 * TODO: Replace with real API (API-Football, Football-data.org, etc.)
 */
export async function fetchLiveMatches(): Promise<MatchWithLiveData[]> {
  try {
    // Try real API first if configured
    if (process.env.LIVE_SCORE_API_KEY) {
      const liveData = await fetchFromLiveApi("live");
      if (liveData.length > 0) return liveData;
    }
  } catch (err) {
    console.warn("[liveScores] Live API failed, falling back to static data:", err);
  }

  // Fallback: return matches marked as "live" from static data
  return (matches as any[])
    .filter((m: any) => m.status === "live")
    .map(toMatchWithLiveData);
}

/**
 * Fetch latest completed match results.
 */
export async function fetchLatestResults(limit = 5): Promise<MatchWithLiveData[]> {
  try {
    if (process.env.LIVE_SCORE_API_KEY) {
      const liveData = await fetchFromLiveApi("results", limit);
      if (liveData.length > 0) return liveData;
    }
  } catch (err) {
    console.warn("[liveScores] Live API failed, falling back to static data:", err);
  }

  return (matches as any[])
    .filter((m: any) => m.status === "completed")
    .sort((a: any, b: any) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .map(toMatchWithLiveData);
}

/**
 * Fetch upcoming matches.
 */
export async function fetchUpcomingMatches(limit = 5): Promise<MatchWithLiveData[]> {
  try {
    if (process.env.LIVE_SCORE_API_KEY) {
      const liveData = await fetchFromLiveApi("upcoming", limit);
      if (liveData.length > 0) return liveData;
    }
  } catch (err) {
    console.warn("[liveScores] Live API failed, falling back to static data:", err);
  }

  return (matches as any[])
    .filter((m: any) => m.status === "upcoming")
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
    .slice(0, limit)
    .map(toMatchWithLiveData);
}

/**
 * Fetch group standings.
 */
export async function fetchStandings(groupId: string): Promise<Standing[]> {
  try {
    if (process.env.LIVE_SCORE_API_KEY) {
      const liveData = await fetchFromLiveApi("standings", undefined, groupId);
      if (liveData.length > 0) return liveData as unknown as Standing[];
    }
  } catch (err) {
    console.warn("[liveScores] Standings API failed, falling back to static data:", err);
  }

  // Fallback: compute standings from completed matches in the group
  const groupMatches = (matches as any[]).filter(
    (m: any) => m.group === groupId && m.status === "completed"
  );
  const teamPoints: Record<string, { p: number; w: number; d: number; l: number; gf: number; ga: number }> = {};

  for (const m of groupMatches) {
    if (!teamPoints[m.home]) teamPoints[m.home] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
    if (!teamPoints[m.away]) teamPoints[m.away] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };

    teamPoints[m.home].p++;
    teamPoints[m.away].p++;
    teamPoints[m.home].gf += m.score.home;
    teamPoints[m.home].ga += m.score.away;
    teamPoints[m.away].gf += m.score.away;
    teamPoints[m.away].ga += m.score.home;

    if (m.score.home > m.score.away) {
      teamPoints[m.home].w++;
      teamPoints[m.away].l++;
    } else if (m.score.home < m.score.away) {
      teamPoints[m.away].w++;
      teamPoints[m.home].l++;
    } else {
      teamPoints[m.home].d++;
      teamPoints[m.away].d++;
    }
  }

  return Object.entries(teamPoints)
    .map(([teamId, stats]) => {
      const team = (teams as any[]).find((t: any) => t.id === teamId);
      return {
        teamId,
        teamName: team?.name_zh || teamId,
        played: stats.p,
        won: stats.w,
        drawn: stats.d,
        lost: stats.l,
        goalsFor: stats.gf,
        goalsAgainst: stats.ga,
        goalDifference: stats.gf - stats.ga,
        points: stats.w * 3 + stats.d,
      };
    })
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
}

function toMatchWithLiveData(m: any): MatchWithLiveData {
  return {
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
  };
}

/**
 * Placeholder for real API integration.
 * Supported APIs (free tier available):
 * - API-Football (rapidapi.com): requires API key, comprehensive live data
 * - Football-data.org: free tier with basic data
 * - OpenLigaDB: free, German leagues mainly
 * - LiveScore API: requires API key
 */
async function fetchFromLiveApi(
  type: "live" | "results" | "upcoming" | "standings",
  limit?: number,
  groupId?: string
): Promise<MatchWithLiveData[]> {
  const apiKey = process.env.LIVE_SCORE_API_KEY;
  const apiBase = process.env.LIVE_SCORE_API_BASE || "https://api.football-data.org/v4";

  // Example: Football-data.org integration
  if (apiBase.includes("football-data")) {
    const headers = { "X-Auth-Token": apiKey! };
    let endpoint = "/competitions/2000/matches"; // FIFA World Cup

    if (type === "live") endpoint += "?status=LIVE";
    else if (type === "results") endpoint += "?status=FINISHED";
    else if (type === "upcoming") endpoint += "?status=SCHEDULED";

    const res = await fetch(`${apiBase}${endpoint}`, { headers });
    if (!res.ok) return [];

    const data = await res.json();
    return (data.matches || []).slice(0, limit || 50).map((m: any) => ({
      id: `live-${m.id}`,
      number: 0,
      stage: "group",
      date: m.utcDate?.slice(0, 10) || "",
      time: m.utcDate?.slice(11, 16) || "",
      home: m.homeTeam?.shortName?.toLowerCase()?.replace(/\s+/g, "-") || "unknown",
      away: m.awayTeam?.shortName?.toLowerCase()?.replace(/\s+/g, "-") || "unknown",
      score: { home: m.score?.fullTime?.home ?? 0, away: m.score?.fullTime?.away ?? 0 },
      status: m.status === "LIVE" ? "live" : m.status === "FINISHED" ? "completed" : "upcoming",
      venue: m.venue || "",
      city: "",
      liveMinute: m.minute,
    }));
  }

  return [];
}
