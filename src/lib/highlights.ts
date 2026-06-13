import type { MatchHighlights } from "./types";
import highlightsData from "@/data/highlights.json";
import { searchHighlightVideos } from "./youtube";
import { searchBilibiliVideos } from "./bilibili";

/**
 * Get highlights for a specific match.
 * Merges static data from highlights.json with live API search results.
 */
export async function getHighlightsForMatch(
  matchId: string,
  searchQuery?: string
): Promise<MatchHighlights> {
  const staticHighlights = (highlightsData as any[]).find((h: any) => h.matchId === matchId);
  const result: MatchHighlights = { matchId };

  if (staticHighlights) {
    if (staticHighlights.videos?.youtube) {
      result.youtube = staticHighlights.videos.youtube;
    }
    if (staticHighlights.videos?.bilibili) {
      result.bilibili = staticHighlights.videos.bilibili;
    }
  }

  // If no static data and we have a search query, try API search
  if (!result.youtube && searchQuery) {
    const youtubeResults = await searchHighlightVideos(searchQuery, 1);
    if (youtubeResults.length > 0) {
      result.youtube = { id: youtubeResults[0].id, title: youtubeResults[0].title };
    }
  }

  if (!result.bilibili && searchQuery) {
    const bilibiliResults = await searchBilibiliVideos(searchQuery, 1, 1);
    if (bilibiliResults.length > 0) {
      result.bilibili = { bvid: bilibiliResults[0].bvid, title: bilibiliResults[0].title };
    }
  }

  return result;
}

/**
 * Get all highlights across all matches.
 */
export async function getAllHighlights(): Promise<Record<string, MatchHighlights>> {
  const result: Record<string, MatchHighlights> = {};

  for (const item of highlightsData as any[]) {
    result[item.matchId] = {
      matchId: item.matchId,
      youtube: item.videos?.youtube || undefined,
      bilibili: item.videos?.bilibili || undefined,
    };
  }

  return result;
}

/**
 * Get all match IDs that have at least one highlight video.
 */
export function getMatchIdsWithHighlights(): string[] {
  return (highlightsData as any[])
    .filter((h: any) => h.videos?.youtube || h.videos?.bilibili)
    .map((h: any) => h.matchId);
}
