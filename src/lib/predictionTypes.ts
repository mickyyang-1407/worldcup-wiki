export interface DimensionScores {
  groupStage: number;      // 0-100
  goalDifference: number;  // 0-100
  fifaRanking: number;     // 0-100
  bettingOdds: number;     // 0-100
  recentForm: number;      // 0-100
  mediaSentiment: number;  // 0-100
  attackDefense: number;   // 0-100
}

export interface TeamPrediction {
  teamId: string;
  teamName: string;
  teamNameZh: string;
  flagCode: string;
  rank: number;
  totalScore: number;
  probability: number;       // 0-1
  dimensions: DimensionScores;
  odds: number | null;       // decimal odds
  trend: 'up' | 'down' | 'stable';
  group: string;
  groupPoints: number;
  goalDifference: number;
  qualificationStatus?: 'qualified' | 'eliminated' | 'contending';
}

export interface PredictionResult {
  predictions: TeamPrediction[];
  lastUpdated: string;
  sources: string[];
  dataQuality: 'live' | 'partial' | 'mock';
}

export interface RawSourceData {
  espnStandings: GroupData[];
  fifaRankings: FifaRankEntry[];
  bettingOdds: OddsEntry[];
  sources: string[];
}

export interface GroupData {
  id: string;
  name: string;
  standings: StandingEntry[];
}

export interface StandingEntry {
  team_id: string;
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  rank: number;
}

export interface FifaRankEntry {
  teamId: string;
  teamName: string;
  fifaRank: number;
  points: number;
}

export interface OddsEntry {
  teamId: string;
  teamName: string;
  decimalOdds: number;
}
