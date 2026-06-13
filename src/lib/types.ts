export interface NewsItem {
  title: string;
  source: string;
  date: string;
  summary: string;
  url: string;
  language: "zh-TW" | "zh-CN";
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
}

export interface BilibiliVideo {
  bvid: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
}

export interface MatchHighlights {
  matchId: string;
  youtube?: { id: string; title: string };
  bilibili?: { bvid: string; title: string };
}

export interface LiveEvent {
  type: "goal" | "card" | "substitution" | "penalty";
  team: "home" | "away";
  player: string;
  minute: number;
}

export interface MatchWithLiveData {
  id: string;
  number: number;
  stage: string;
  group?: string;
  date: string;
  time: string;
  home: string;
  away: string;
  score: { home: number; away: number };
  status: string;
  venue: string;
  city: string;
  liveMinute?: number;
  liveEvents?: LiveEvent[];
}

export interface Standing {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}
