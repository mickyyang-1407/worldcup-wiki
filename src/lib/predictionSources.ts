import type { GroupData, FifaRankEntry, OddsEntry, RawSourceData, StandingEntry } from './predictionTypes';
import teamsRaw from '@/data/teams.json';
import groupsRaw from '@/data/groups.json';
import { espnNameToSlug } from './espnTeamMap';

const ESPN_STANDINGS_URL =
  'https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings';

const GROUP_MAP: Record<string, string> = {
  'Group A': 'A', 'Group B': 'B', 'Group C': 'C', 'Group D': 'D',
  'Group E': 'E', 'Group F': 'F', 'Group G': 'G', 'Group H': 'H',
  'Group I': 'I', 'Group J': 'J', 'Group K': 'K', 'Group L': 'L',
};

function buildLocalStandings(): GroupData[] {
  return (groupsRaw.groups as any[]).map((g) => ({
    id: g.id as string,
    name: g.name as string,
    standings: (g.standings as any[]).map((s): StandingEntry => ({
      team_id: s.team_id as string,
      team_name: String(s.team_id).replace(/-/g, ' '),
      played: s.pld ?? 0,
      won: s.w ?? 0,
      drawn: s.d ?? 0,
      lost: s.l ?? 0,
      gf: s.gf ?? 0,
      ga: s.ga ?? 0,
      gd: typeof s.gd === 'string' ? parseInt(s.gd) : (s.gd ?? 0),
      pts: s.pts ?? 0,
      rank: s.pos ?? 1,
    })),
  }));
}

export function buildFifaRankings(): FifaRankEntry[] {
  return (teamsRaw.teams as any[]).map((t) => ({
    teamId: t.id as string,
    teamName: t.name as string,
    fifaRank: (t.fifa_ranking as number) ?? 100,
    points: Math.max(0, (120 - ((t.fifa_ranking as number) ?? 100)) * 15),
  }));
}

async function fetchESPNStandings(): Promise<{ groups: GroupData[]; live: boolean }> {
  try {
    const res = await fetch(ESPN_STANDINGS_URL, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error('ESPN standings fetch failed');

    const data = await res.json();
    const children: any[] = data.children || [];
    if (!children.length) throw new Error('No ESPN groups');

    const groups = children
      .map((child: any) => {
        const groupId = GROUP_MAP[child.name] || child.name;
        const entries: any[] = child.standings?.entries || [];

        const standings: StandingEntry[] = entries.map((entry: any) => {
          const teamName = entry.team?.displayName || '';
          const stats = entry.stats || [];
          const getStat = (name: string) =>
            stats.find((s: any) => s.name === name)?.value ?? 0;

          return {
            team_id: espnNameToSlug(teamName),
            team_name: teamName,
            played: getStat('gamesPlayed'),
            won: getStat('wins'),
            drawn: getStat('ties'),
            lost: getStat('losses'),
            gf: getStat('pointsFor'),
            ga: getStat('pointsAgainst'),
            gd: getStat('pointDifferential'),
            pts: getStat('points'),
            rank: getStat('rank'),
          };
        });

        return { id: groupId as string, name: `${groupId}組`, standings };
      })
      .sort((a, b) => a.id.localeCompare(b.id));

    const live = groups.some((g) => g.standings.some((s) => s.played > 0));
    return { groups, live };
  } catch {
    return { groups: buildLocalStandings(), live: false };
  }
}

// Realistic 2026 World Cup outright winner decimal odds (mock — would use The Odds API with key)
export const BETTING_ODDS: OddsEntry[] = [
  { teamId: 'argentina',              teamName: 'Argentina',              decimalOdds: 5.50 },
  { teamId: 'france',                 teamName: 'France',                 decimalOdds: 6.50 },
  { teamId: 'brazil',                 teamName: 'Brazil',                 decimalOdds: 7.00 },
  { teamId: 'spain',                  teamName: 'Spain',                  decimalOdds: 8.50 },
  { teamId: 'england',                teamName: 'England',                decimalOdds: 9.00 },
  { teamId: 'portugal',               teamName: 'Portugal',               decimalOdds: 11.00 },
  { teamId: 'germany',                teamName: 'Germany',                decimalOdds: 12.00 },
  { teamId: 'netherlands',            teamName: 'Netherlands',            decimalOdds: 15.00 },
  { teamId: 'belgium',                teamName: 'Belgium',                decimalOdds: 17.00 },
  { teamId: 'mexico',                 teamName: 'Mexico',                 decimalOdds: 19.00 },
  { teamId: 'colombia',               teamName: 'Colombia',               decimalOdds: 21.00 },
  { teamId: 'uruguay',                teamName: 'Uruguay',                decimalOdds: 26.00 },
  { teamId: 'croatia',                teamName: 'Croatia',                decimalOdds: 34.00 },
  { teamId: 'morocco',                teamName: 'Morocco',                decimalOdds: 34.00 },
  { teamId: 'japan',                  teamName: 'Japan',                  decimalOdds: 41.00 },
  { teamId: 'senegal',                teamName: 'Senegal',                decimalOdds: 51.00 },
  { teamId: 'united-states',          teamName: 'United States',          decimalOdds: 51.00 },
  { teamId: 'switzerland',            teamName: 'Switzerland',            decimalOdds: 67.00 },
  { teamId: 'austria',                teamName: 'Austria',                decimalOdds: 67.00 },
  { teamId: 'sweden',                 teamName: 'Sweden',                 decimalOdds: 81.00 },
  { teamId: 'norway',                 teamName: 'Norway',                 decimalOdds: 81.00 },
  { teamId: 'turkey',                 teamName: 'Turkey',                 decimalOdds: 101.00 },
  { teamId: 'south-korea',            teamName: 'South Korea',            decimalOdds: 101.00 },
  { teamId: 'ivory-coast',            teamName: 'Ivory Coast',            decimalOdds: 151.00 },
  { teamId: 'australia',              teamName: 'Australia',              decimalOdds: 151.00 },
  { teamId: 'iran',                   teamName: 'Iran',                   decimalOdds: 151.00 },
  { teamId: 'ecuador',                teamName: 'Ecuador',                decimalOdds: 151.00 },
  { teamId: 'egypt',                  teamName: 'Egypt',                  decimalOdds: 201.00 },
  { teamId: 'ghana',                  teamName: 'Ghana',                  decimalOdds: 201.00 },
  { teamId: 'scotland',               teamName: 'Scotland',               decimalOdds: 201.00 },
  { teamId: 'tunisia',                teamName: 'Tunisia',                decimalOdds: 251.00 },
  { teamId: 'canada',                 teamName: 'Canada',                 decimalOdds: 251.00 },
  { teamId: 'czech-republic',         teamName: 'Czech Republic',         decimalOdds: 301.00 },
  { teamId: 'algeria',                teamName: 'Algeria',                decimalOdds: 401.00 },
  { teamId: 'bosnia-and-herzegovina', teamName: 'Bosnia and Herzegovina', decimalOdds: 501.00 },
  { teamId: 'paraguay',               teamName: 'Paraguay',               decimalOdds: 501.00 },
  { teamId: 'saudi-arabia',           teamName: 'Saudi Arabia',           decimalOdds: 501.00 },
  { teamId: 'dr-congo',               teamName: 'DR Congo',               decimalOdds: 751.00 },
  { teamId: 'uzbekistan',             teamName: 'Uzbekistan',             decimalOdds: 1001.00 },
  { teamId: 'cape-verde',             teamName: 'Cape Verde',             decimalOdds: 1001.00 },
  { teamId: 'jordan',                 teamName: 'Jordan',                 decimalOdds: 1001.00 },
  { teamId: 'qatar',                  teamName: 'Qatar',                  decimalOdds: 1001.00 },
  { teamId: 'south-africa',           teamName: 'South Africa',           decimalOdds: 1001.00 },
  { teamId: 'panama',                 teamName: 'Panama',                 decimalOdds: 1001.00 },
  { teamId: 'haiti',                  teamName: 'Haiti',                  decimalOdds: 2001.00 },
  { teamId: 'new-zealand',            teamName: 'New Zealand',            decimalOdds: 5001.00 },
  { teamId: 'curacao',                teamName: 'Curaçao',                decimalOdds: 5001.00 },
];

export async function fetchAllSources(): Promise<RawSourceData & { live: boolean }> {
  const { groups: espnStandings, live } = await fetchESPNStandings();
  const fifaRankings = buildFifaRankings();

  return {
    espnStandings,
    fifaRankings,
    bettingOdds: BETTING_ODDS,
    sources: ['ESPN Standings', 'FIFA Rankings', 'Betting Odds (simulation)'],
    live,
  };
}
