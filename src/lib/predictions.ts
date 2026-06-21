import type { TeamPrediction, DimensionScores, PredictionResult, RawSourceData, StandingEntry } from './predictionTypes';
import teamsRaw from '@/data/teams.json';
import { TEAM_FLAGS } from '@/data/teamFlags';
import { fetchAllSources } from './predictionSources';

const WEIGHTS: Record<keyof DimensionScores, number> = {
  groupStage:      0.25,
  goalDifference:  0.15,
  fifaRanking:     0.10,
  bettingOdds:     0.20,
  recentForm:      0.15,
  mediaSentiment:  0.10,
  attackDefense:   0.05,
};

// Hand-tuned mock form scores — would come from football-data.org or ESPN recent results
const RECENT_FORM: Record<string, number> = {
  argentina: 91, france: 86, brazil: 84, spain: 85, england: 80,
  portugal: 83, germany: 77, netherlands: 74, belgium: 71, mexico: 67,
  colombia: 65, uruguay: 70, croatia: 66, morocco: 63, japan: 61,
  senegal: 58, 'united-states': 56, switzerland: 62, austria: 60,
  sweden: 57, norway: 59, turkey: 55, 'south-korea': 58,
  'ivory-coast': 52, australia: 50, iran: 48, ecuador: 51,
};

// Media attention / sentiment index (0-100) — derived from search volume & headlines
const MEDIA_SENTIMENT: Record<string, number> = {
  argentina: 93, brazil: 91, france: 89, england: 85, germany: 82,
  spain: 84, portugal: 86, netherlands: 73, belgium: 70, mexico: 75,
  colombia: 62, uruguay: 68, croatia: 64, morocco: 65, japan: 63,
  'united-states': 72, senegal: 55, switzerland: 52, sweden: 50,
};

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function getRecentForm(teamId: string, fifaRank: number): number {
  return RECENT_FORM[teamId] ?? clamp(90 - fifaRank * 0.72, 15, 88);
}

function getMediaSentiment(teamId: string, fifaRank: number): number {
  return MEDIA_SENTIMENT[teamId] ?? clamp(85 - fifaRank * 0.75, 10, 82);
}

// Mock trend — in production would compare day-over-day betting movement
const TREND_UP = new Set(['argentina', 'morocco', 'japan', 'spain', 'senegal', 'colombia', 'norway']);
const TREND_DOWN = new Set(['germany', 'belgium', 'brazil', 'south-korea', 'iran']);

function getTrend(teamId: string): 'up' | 'down' | 'stable' {
  if (TREND_UP.has(teamId)) return 'up';
  if (TREND_DOWN.has(teamId)) return 'down';
  return 'stable';
}

export function calculatePredictions(
  sourceData: RawSourceData & { live?: boolean }
): PredictionResult {
  const teams = teamsRaw.teams as any[];

  const standingsMap = new Map<string, StandingEntry>();
  for (const group of sourceData.espnStandings) {
    for (const s of group.standings) standingsMap.set(s.team_id, s);
  }

  const fifaRankMap = new Map(sourceData.fifaRankings.map((r) => [r.teamId, r]));
  const oddsMap = new Map(sourceData.bettingOdds.map((o) => [o.teamId, o]));

  const allGDs = [...standingsMap.values()].map((s) => s.gd);
  const minGD = allGDs.length ? Math.min(...allGDs, -5) : -5;
  const maxGD = allGDs.length ? Math.max(...allGDs, 5) : 5;
  const gdRange = Math.max(maxGD - minGD, 1);

  const allImpliedProbs = sourceData.bettingOdds.map((o) => 1 / o.decimalOdds);
  const maxImpliedProb = Math.max(...allImpliedProbs, 0.001);

  const scored = teams.map((team) => {
    const teamId: string = team.id;
    const s = standingsMap.get(teamId);
    const fifaEntry = fifaRankMap.get(teamId);
    const oddsEntry = oddsMap.get(teamId);
    const fifaRank: number = fifaEntry?.fifaRank ?? 100;

    // 1. Group stage performance (pts per possible pts)
    let groupStage = 50;
    if (s && s.played > 0) {
      groupStage = (s.pts / (s.played * 3)) * 100;
    }

    // 2. Goal difference normalised to 0-100
    let goalDifference = 50;
    if (s) {
      goalDifference = ((s.gd - minGD) / gdRange) * 100;
    }

    // 3. FIFA ranking → 0-100 (rank 1 = 100, rank 110 = 0)
    const fifaRanking = clamp(((110 - fifaRank) / 109) * 100, 0, 100);

    // 4. Betting odds → implied prob normalised to max
    let bettingOdds = 20;
    if (oddsEntry) {
      bettingOdds = ((1 / oddsEntry.decimalOdds) / maxImpliedProb) * 100;
    }

    // 5. Recent form (mock or fallback)
    const recentForm = getRecentForm(teamId, fifaRank);

    // 6. Media sentiment (mock)
    const mediaSentiment = getMediaSentiment(teamId, fifaRank);

    // 7. Attack / defense ratio from group stage
    let attackDefense = 50;
    if (s && s.played > 0) {
      const avgGF = s.gf / s.played;
      const avgGA = s.ga / s.played;
      const attack = clamp(avgGF * 25, 0, 100);
      const defense = clamp((3 - avgGA) * 33.3, 0, 100);
      attackDefense = (attack + defense) / 2;
    }

    const dimensions: DimensionScores = {
      groupStage:     Math.round(clamp(groupStage,     0, 100)),
      goalDifference: Math.round(clamp(goalDifference, 0, 100)),
      fifaRanking:    Math.round(fifaRanking),
      bettingOdds:    Math.round(clamp(bettingOdds,    0, 100)),
      recentForm:     Math.round(clamp(recentForm,      0, 100)),
      mediaSentiment: Math.round(clamp(mediaSentiment,  0, 100)),
      attackDefense:  Math.round(clamp(attackDefense,   0, 100)),
    };

    const totalScore =
      dimensions.groupStage     * WEIGHTS.groupStage +
      dimensions.goalDifference * WEIGHTS.goalDifference +
      dimensions.fifaRanking    * WEIGHTS.fifaRanking +
      dimensions.bettingOdds    * WEIGHTS.bettingOdds +
      dimensions.recentForm     * WEIGHTS.recentForm +
      dimensions.mediaSentiment * WEIGHTS.mediaSentiment +
      dimensions.attackDefense  * WEIGHTS.attackDefense;

    return {
      teamId,
      teamName: team.name as string,
      teamNameZh: team.name_zh as string,
      flagCode: TEAM_FLAGS[teamId] || '',
      rank: 0,
      totalScore,
      probability: 0,
      dimensions,
      odds: oddsEntry?.decimalOdds ?? null,
      trend: getTrend(teamId),
      group: (team.group as string) || 'A',
      groupPoints: s?.pts ?? 0,
      goalDifference: s?.gd ?? 0,
    } satisfies Omit<TeamPrediction, 'rank' | 'probability'> & { rank: number; probability: number };
  });

  scored.sort((a, b) => b.totalScore - a.totalScore);
  scored.forEach((t, i) => { t.rank = i + 1; });

  // Softmax-style probability — exponent amplifies spread between leaders and tail
  const exponent = 2.2;
  const powered = scored.map((t) => Math.pow(t.totalScore, exponent));
  const poweredSum = powered.reduce((a, b) => a + b, 0);
  scored.forEach((t, i) => {
    t.probability = parseFloat((powered[i] / poweredSum).toFixed(4));
  });

  return {
    predictions: scored as TeamPrediction[],
    lastUpdated: new Date().toISOString(),
    sources: sourceData.sources,
    dataQuality: sourceData.live ? 'live' : 'mock',
  };
}

export async function getPredictions(): Promise<PredictionResult> {
  const sourceData = await fetchAllSources();
  return calculatePredictions(sourceData);
}
