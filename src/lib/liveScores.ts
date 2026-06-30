import type { MatchWithLiveData, Standing } from "./types";
import { matches } from "@/data/schedule";
import { teams } from "@/data/teams";
import { espnNameToSlug, espnStatusToLocal } from "./espnTeamMap";

function getDateRange() {
  const now = new Date();
  const past = new Date(now.getTime() - 21 * 24 * 3600000);
  const future = new Date(now.getTime() + 21 * 24 * 3600000);
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `${fmt(past)}-${fmt(future)}`;
}

/**
 * Fetch currently live matches.
 */
export async function fetchLiveMatches(): Promise<MatchWithLiveData[]> {
  try {
    const liveData = await fetchFromLiveApi("live");
    if (liveData.length > 0) return liveData;
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
    const liveData = await fetchFromLiveApi("results", limit);
    if (liveData.length > 0) return liveData;
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
    const liveData = await fetchFromLiveApi("upcoming", limit);
    if (liveData.length > 0) return liveData;
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
    const liveData = await fetchFromLiveApi("standings", undefined, groupId);
    if (liveData.length > 0) return liveData as unknown as Standing[];
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

async function fetchFromLiveApi(
  type: "live" | "results" | "upcoming" | "standings",
  limit?: number,
  groupId?: string
): Promise<any[]> {
  if (type === "standings") {
    try {
      const res = await fetch(
        "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings",
        { cache: "no-store", signal: AbortSignal.timeout(10000) }
      );
      if (!res.ok) return [];
      const data = await res.json();
      const children = data.children || [];

      const GROUP_MAP: Record<string, string> = {
        'Group A': 'A', 'Group B': 'B', 'Group C': 'C', 'Group D': 'D',
        'Group E': 'E', 'Group F': 'F', 'Group G': 'G', 'Group H': 'H',
        'Group I': 'I', 'Group J': 'J', 'Group K': 'K', 'Group L': 'L',
      };

      const groupData = children.find((child: any) => {
        const letter = GROUP_MAP[child.name] || child.name;
        return !groupId || letter === groupId;
      });

      if (!groupData) return [];
      const entries = groupData.standings?.entries || [];

      return entries.map((entry: any) => {
        const teamName = entry.team?.displayName || "";
        const stats = entry.stats || [];
        const getStat = (name: string) =>
          stats.find((s: any) => s.name === name)?.value ?? 0;

        return {
          teamId: espnNameToSlug(teamName),
          teamName: teamName,
          played: getStat("gamesPlayed"),
          won: getStat("wins"),
          drawn: getStat("ties"),
          lost: getStat("losses"),
          goalsFor: getStat("pointsFor"),
          goalsAgainst: getStat("pointsAgainst"),
          goalDifference: getStat("pointDifferential"),
          points: getStat("points"),
        };
      });
    } catch (err) {
      console.warn("[liveScores] fetch ESPN standings failed:", err);
      return [];
    }
  }

  try {
    const dateRange = getDateRange();
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateRange}&limit=100`,
      { cache: "no-store", signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return [];

    const data = await res.json();
    const events = data.events || [];

    const formattedMatches = events.map((event: any) => {
      const comp = event.competitions?.[0] || {};
      const competitors = comp.competitors || [];
      const home = competitors.find((c: any) => c.homeAway === "home");
      const away = competitors.find((c: any) => c.homeAway === "away");
      const espnStatus = comp.status?.type?.name || "";
      const status = espnStatusToLocal(espnStatus);
      const homeSlug = espnNameToSlug(home?.team?.displayName || "");
      const awaySlug = espnNameToSlug(away?.team?.displayName || "");

      // Find stage
      let stage = "group";
      const matched = matches.find((m: any) =>
        (m.home === homeSlug && m.away === awaySlug) ||
        (m.home === awaySlug && m.away === homeSlug)
      );
      if (matched) {
        stage = matched.stage;
      } else if (event.date) {
        const date = new Date(event.date);
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        if (month === 6) {
          if (day >= 11 && day <= 27) stage = "group";
          else if (day >= 28 && day <= 30) stage = "round-of-32";
        } else if (month === 7) {
          if (day >= 1 && day <= 2) stage = "round-of-32";
          else if (day >= 3 && day <= 7) stage = "round-of-16";
          else if (day >= 8 && day <= 12) stage = "quarter-finals";
          else if (day >= 13 && day <= 16) stage = "semi-finals";
          else if (day === 17 || day === 18) stage = "third-place";
          else if (day === 19) stage = "final";
        }
      }

      return {
        id: `espn-${event.id}`,
        number: matched?.number || 0,
        stage,
        group: matched?.group,
        date: event.date?.slice(0, 10) || "",
        time: event.date || "",
        home: homeSlug,
        away: awaySlug,
        score: {
          home: status !== "scheduled" && home?.score !== undefined ? parseInt(home.score) : null,
          away: status !== "scheduled" && away?.score !== undefined ? parseInt(away.score) : null,
        },
        status,
        venue: comp.venue?.fullName || "",
        city: comp.venue?.address?.city || "",
        liveMinute: comp.status?.displayClock || null,
      };
    });

    const filtered = formattedMatches.filter((m: any) => {
      if (type === "live") return m.status === "live";
      if (type === "results") return m.status === "completed";
      if (type === "upcoming") return m.status === "scheduled";
      return true;
    });

    if (type === "results") {
      filtered.sort((a: any, b: any) => b.time.localeCompare(a.time));
    } else if (type === "upcoming") {
      filtered.sort((a: any, b: any) => a.time.localeCompare(b.time));
    }

    return filtered.slice(0, limit || 100);
  } catch (err) {
    console.warn("[liveScores] fetch ESPN matches failed:", err);
    return [];
  }
}

