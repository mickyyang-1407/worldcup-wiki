import type { YouTubeVideo } from "./types";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

/**
 * Search YouTube for highlight videos using the YouTube Data API v3.
 * Requires YOUTUBE_API_KEY environment variable.
 * Falls back to empty results if no API key is configured.
 */
export async function searchHighlightVideos(query: string, maxResults = 5): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn("[youtube] No YOUTUBE_API_KEY configured — returning empty results");
    return [];
  }

  try {
    const url = `${YOUTUBE_API_BASE}/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(query)}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[youtube] API error: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (err) {
    console.error("[youtube] Fetch failed:", err);
    return [];
  }
}

/**
 * Build a nocookie YouTube embed URL for a search query.
 */
export function buildEmbedSearchUrl(query: string): string {
  return `https://www.youtube-nocookie.com/embed?listType=search&query=${encodeURIComponent(query)}`;
}

/**
 * Build a standard YouTube search URL.
 */
export function buildSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

/**
 * Build a direct video embed URL.
 */
export function buildVideoEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
