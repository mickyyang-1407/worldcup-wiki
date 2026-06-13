import type { NewsItem } from "./types";
import newsData from "@/data/news.json";

/**
 * Fetch latest football news.
 * Currently returns static data from news.json.
 * 
 * Available free Chinese football news sources (for future integration):
 * - Yahoo奇摩運動 RSS: https://tw.sports.yahoo.com/football/rss
 * - 新浪體育 足球: https://sports.sina.com.cn/china-football/
 * - 騰訊體育: https://sports.qq.com/
 * - 搜狐體育: https://sports.sohu.com/
 * - Google News RSS (足球): https://news.google.com/rss/search?q=足球+世界盃&hl=zh-TW
 * - 中央社體育: https://www.cna.com.tw/topic/sport.aspx
 * 
 * To enable live fetching, set NEWS_RSS_URL environment variable.
 */
export async function fetchFootballNews(limit = 5): Promise<NewsItem[]> {
  // Try RSS feed if configured
  const rssUrl = process.env.NEWS_RSS_URL;
  if (rssUrl) {
    try {
      const rssItems = await fetchFromRss(rssUrl, limit);
      if (rssItems.length > 0) return rssItems;
    } catch (err) {
      console.warn("[news] RSS fetch failed, falling back to static data:", err);
    }
  }

  // Try Google News RSS as fallback
  try {
    const googleNews = await fetchFromRss(
      "https://news.google.com/rss/search?q=世界盃+足球&hl=zh-TW&gl=TW&ceid=TW:zh-Hant",
      limit
    );
    if (googleNews.length > 0) return googleNews;
  } catch {
    // silent fallback to static data
  }

  // Static fallback
  return (newsData as NewsItem[]).slice(0, limit);
}

async function fetchFromRss(rssUrl: string, limit: number): Promise<NewsItem[]> {
  const res = await fetch(rssUrl);
  if (!res.ok) return [];

  const xml = await res.text();
  const items: NewsItem[] = [];

  // Simple RSS XML parser (no dependency needed)
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const itemXml = match[1];
    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    const pubDate = extractTag(itemXml, "pubDate");
    const description = extractTag(itemXml, "description") || extractTag(itemXml, "content:encoded") || "";

    if (title && link) {
      items.push({
        title: decodeHtmlEntities(title),
        source: extractTag(xml, "title") || "未知來源", // channel title
        date: pubDate ? new Date(pubDate).toISOString().slice(0, 10) : "",
        summary: stripHtml(description).slice(0, 150),
        url: link,
        language: "zh-TW",
      });
    }
  }

  return items;
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = regex.exec(xml);
  return match ? match[1].trim() : "";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}
