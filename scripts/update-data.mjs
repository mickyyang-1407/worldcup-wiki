#!/usr/bin/env node
/**
 * World Cup Wiki - 每日資料更新腳本
 *
 * 功能：
 * 1. 從 Google News RSS 抓取最新世界盃新聞
 * 2. 更新 src/data/news.json
 * 3. 重新 build 靜態網站
 * 4. 重啟 dev server（如果正在運行）
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const NEWS_FILE = join(ROOT, 'src/data/news.json');

// ── 工具函式 ──

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = regex.exec(xml);
  return match ? match[1].trim() : '';
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

// ── RSS 抓取 ──

async function fetchFromRss(rssUrl, limit = 10) {
  console.log(`[update] Fetching RSS: ${rssUrl}`);
  const res = await fetch(rssUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WorldCupWiki/1.0)' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    console.warn(`[update] RSS fetch failed: ${res.status}`);
    return [];
  }

  const xml = await res.text();
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const itemXml = match[1];
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const pubDate = extractTag(itemXml, 'pubDate');
    const description = extractTag(itemXml, 'description') || extractTag(itemXml, 'content:encoded') || '';

    if (title && link) {
      const cleanTitle = decodeHtmlEntities(title);
      const cleanUrl = link.startsWith('http') ? link : `https://news.google.com${link.startsWith('./') ? link.slice(1) : link}`;
      const id = `news-rss-${Date.now()}-${items.length}`;
      items.push({
        id,
        title: cleanTitle,
        source: extractTag(xml, 'title') || 'Google News',
        date: pubDate ? new Date(pubDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        summary: stripHtml(description).slice(0, 150),
        url: cleanUrl,
        language: 'zh-TW',
        content: stripHtml(description).slice(0, 1000) || cleanTitle,
        category: 'feature',
      });
    }
  }
  return items;
}

// ── 主要流程 ──

async function main() {
  console.log('=== World Cup Wiki 每日更新開始 ===');
  console.log(`時間: ${new Date().toISOString()}`);

  // 1. 抓取新聞
  const rssUrls = [
    'https://news.google.com/rss/search?q=世界盃+足球&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
    'https://news.google.com/rss/search?q=FIFA+World+Cup+2026&hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
  ];

  let newsItems = [];
  for (const url of rssUrls) {
    if (newsItems.length >= 5) break;
    const items = await fetchFromRss(url, 5);
    newsItems = newsItems.concat(items);
    console.log(`[update] Got ${items.length} items from RSS`);
  }

  // 2. 更新 news.json
  if (newsItems.length > 0) {
    // 去重（以 title 為 key）
    const seen = new Set();
    const unique = newsItems.filter(item => {
      const key = item.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 讀取現有新聞，保留作為 fallback
    let existingNews = [];
    if (existsSync(NEWS_FILE)) {
      try {
        existingNews = JSON.parse(readFileSync(NEWS_FILE, 'utf-8'));
      } catch (e) {
        console.warn('[update] Failed to parse existing news.json, starting fresh');
      }
    }

    // 合併：新 RSS 在前，舊資料在後（以 title 去重）
    const merged = [...unique, ...existingNews];
    const seen2 = new Set();
    const deduped = merged.filter(item => {
      const key = item.title.toLowerCase().trim();
      if (seen2.has(key)) return false;
      seen2.add(key);
      return true;
    });

    const finalNews = deduped.slice(0, 20);
    writeFileSync(NEWS_FILE, JSON.stringify(finalNews, null, 2) + '\n');
    console.log(`[update] ✅ news.json updated: ${finalNews.length} items (${unique.length} new from RSS)`);
  } else {
    console.log('[update] ⚠️ No news from RSS, keeping existing news.json');
  }

  // 3. Rebuild
  console.log('[update] Rebuilding static site...');
  const { execSync } = await import('child_process');
  try {
    execSync('npm run build', { cwd: ROOT, stdio: 'inherit', timeout: 180000 });
    console.log('[update] ✅ Build successful');
  } catch (err) {
    console.error('[update] ❌ Build failed:', err.message);
    process.exit(1);
  }

  // 4. 重啟 dev server（如果有 running process）
  try {
    // 找 port 3056 上的 node process
    const lsof = execSync('lsof -ti :3056', { cwd: ROOT, timeout: 5000 });
    const pids = lsof.toString().trim().split('\n').filter(Boolean);
    if (pids.length > 0) {
      console.log(`[update] Killing old dev server PIDs: ${pids.join(', ')}`);
      execSync(`kill ${pids.join(' ')}`, { timeout: 3000 });
      // 等待 port 釋放
      await new Promise(r => setTimeout(r, 2000));
    }
  } catch {
    // no process on port 3056, that's fine
    console.log('[update] No existing dev server on port 3056');
  }

  // 啟動新的 dev server（background）
  console.log('[update] Starting dev server...');
  const { spawn } = await import('child_process');
  const child = spawn('npm', ['run', 'dev'], { cwd: ROOT, stdio: 'ignore', detached: true });
  child.unref();
  // 等待 server 就緒
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log('[update] ✅ Dev server started on http://localhost:3056');

  console.log('=== World Cup Wiki 每日更新完成 ===');
}

main().catch(err => {
  console.error('[update] Fatal error:', err);
  process.exit(1);
});
