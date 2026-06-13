import type { BilibiliVideo } from "./types";

const BILIBILI_API_BASE = "https://api.bilibili.com/x/web-interface";

/**
 * Search Bilibili for videos using Bilibili's open search API (no API key required).
 */
export async function searchBilibiliVideos(query: string, page = 1, pageSize = 10): Promise<BilibiliVideo[]> {
  try {
    const url = `${BILIBILI_API_BASE}/search/all/v2?keyword=${encodeURIComponent(query)}&page=${page}&pagesize=${pageSize}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WorldCupWiki/1.0)",
        "Referer": "https://www.bilibili.com",
      },
    });
    if (!res.ok) {
      console.error(`[bilibili] API error: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    if (data.code !== 0) {
      console.error(`[bilibili] API business error: ${data.code} ${data.message}`);
      return [];
    }

    // Extract video results from the search response
    const videoResults = data.data?.result?.find((r: any) => r.result_type === "video")?.data || [];
    return videoResults.slice(0, pageSize).map((item: any) => ({
      bvid: item.bvid,
      title: item.title.replace(/<[^>]*>/g, ""), // strip HTML tags
      thumbnail: item.pic,
      publishedAt: item.pubdate ? new Date(item.pubdate * 1000).toISOString() : "",
    }));
  } catch (err) {
    console.error("[bilibili] Fetch failed:", err);
    return [];
  }
}

/**
 * Build a Bilibili search URL.
 */
export function buildBilibiliSearchUrl(query: string): string {
  return `https://search.bilibili.com/all?keyword=${encodeURIComponent(query)}`;
}

/**
 * Build a Bilibili player embed URL.
 */
export function buildBilibiliEmbedUrl(bvid: string): string {
  return `//player.bilibili.com/player.html?bvid=${bvid}&autoplay=0`;
}
