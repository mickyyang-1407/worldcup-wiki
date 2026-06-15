import { NextResponse } from "next/server";

export const runtime = "edge";
export const revalidate = 900; // cache 15 min

function extractCDATA(str: string): string {
  const m = str.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return m ? m[1].trim() : str.trim();
}

function stripHtml(str: string): string {
  return str
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function parseRSS(xml: string) {
  const items: any[] = [];
  const blocks = xml.split(/<item[\s>]/i).slice(1);

  for (const block of blocks) {
    const titleRaw = block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "";
    const title = stripHtml(extractCDATA(titleRaw));
    if (!title) continue;

    const link = block.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim() ||
                 block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1]?.trim() || "";

    const pubDateRaw = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() || "";
    let date = "";
    if (pubDateRaw) {
      try {
        const d = new Date(pubDateRaw);
        if (!isNaN(d.getTime())) date = d.toISOString().slice(0, 10);
      } catch {}
    }

    const descRaw = block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || "";
    const descClean = stripHtml(extractCDATA(descRaw));

    // Source: either <source> tag or last part of description after "·"
    const sourceTag = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i)?.[1]?.trim() || "";
    const source = sourceTag ? stripHtml(sourceTag) : "Google 新聞";

    items.push({ id: `news-${Date.now()}-${items.length}`, title, url: link, date, summary: descClean, source });
  }

  return items;
}

export async function GET() {
  try {
    const url = "https://news.google.com/rss/search?q=%E4%B8%96%E7%95%8C%E7%9B%83+%E8%B6%B3%E7%90%83&hl=zh-TW&gl=TW&ceid=TW:zh-Hant";
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WorldCupWiki/1.0)" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
    const xml = await res.text();
    const items = parseRSS(xml).slice(0, 12);
    return NextResponse.json({ items }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=300" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
