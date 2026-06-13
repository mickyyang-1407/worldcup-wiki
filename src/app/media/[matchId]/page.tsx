"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { matches } from "@/data/schedule";
import { teams } from "@/data/teams";
import TeamBadge from "@/components/TeamBadge";

export default function MediaPage({ params }: { params: Promise<{ matchId: string }> }) {
  const [matchId, setMatchId] = useState<string | null>(null);
  const [embedError, setEmbedError] = useState(false);
  const [bilibiliError, setBilibiliError] = useState(false);

  useEffect(() => {
    params.then((p) => setMatchId(p.matchId));
  }, [params]);

  if (!matchId) return null;

  const match = (matches as any[]).find((m: any) => m.id === matchId);
  if (!match) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">找不到此比賽</h1>
        <Link href="/schedule" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">← 返回賽程</Link>
      </div>
    );
  }

  const homeTeam = (teams as any[]).find((t: any) => t.id === match.home);
  const awayTeam = (teams as any[]).find((t: any) => t.id === match.away);

  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
  };

  const stageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      group: "小組賽",
      "round-of-16": "16強",
      "quarter-finals": "8強",
      "semi-finals": "準決賽",
      "third-place": "季軍戰",
      final: "決賽",
    };
    return labels[stage] || stage;
  };

  const searchQuery = encodeURIComponent(
    `愛爾達 世界盃 2026 ${homeTeam?.name_zh || match.home} vs ${awayTeam?.name_zh || match.away} 精華`
  );
  const bilibiliQuery = encodeURIComponent(
    `2026世界盃 ${homeTeam?.name_zh || match.home} vs ${awayTeam?.name_zh || match.away} 精華`
  );
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
  const bilibiliSearchUrl = `https://search.bilibili.com/all?keyword=${bilibiliQuery}`;
  const eltaChannelUrl = `https://www.youtube.com/@eltasports`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/schedule" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">← 返回賽程</Link>

      {/* Match Info Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-2">
            {formatDate(match.date)} · {stageLabel(match.stage)}{match.group ? ` · ${match.group}組` : ""}
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <TeamBadge teamId={match.home} size="lg" showName={false} linkable={false} />
              <div className="mt-2 font-bold text-gray-900">{homeTeam?.name_zh || match.home}</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 font-mono">
              {match.status === "completed" ? `${match.score.home} - ${match.score.away}` : "vs"}
            </div>
            <div className="text-center">
              <TeamBadge teamId={match.away} size="lg" showName={false} linkable={false} />
              <div className="mt-2 font-bold text-gray-900">{awayTeam?.name_zh || match.away}</div>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">📺 YouTube 精華</h2>
        <p className="text-sm text-gray-500 mb-6">
          搜尋來源：<a href={eltaChannelUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">愛爾達體育家族 YouTube</a>
        </p>

        {embedError ? (
          <div className="aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden bg-gray-100 flex flex-col items-center justify-center gap-4 mb-6">
            <div className="text-4xl">⚠️</div>
            <p className="text-gray-500 text-sm">影片嵌入被瀏覽器阻擋</p>
            <a
              href={youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              在 YouTube 上觀看
            </a>
          </div>
        ) : (
          <div className="aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-sm mb-6 bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed?listType=search&query=${searchQuery}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={() => setEmbedError(true)}
            />
          </div>
        )}

        <div className="text-center">
          <a
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            在 YouTube 上觀看
          </a>
        </div>
      </div>

      {/* Bilibili Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">📺 Bilibili 精華</h2>
        <p className="text-sm text-gray-500 mb-6">
          搜尋來源：<a href="https://search.bilibili.com/all?keyword=2026%E4%B8%96%E7%95%8C%E7%9B%83" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Bilibili 2026 世界盃</a>
        </p>

        {bilibiliError ? (
          <div className="aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden bg-gray-100 flex flex-col items-center justify-center gap-4 mb-6">
            <div className="text-4xl">⚠️</div>
            <p className="text-gray-500 text-sm">Bilibili 嵌入載入失敗</p>
            <a
              href={bilibiliSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              在 Bilibili 上搜尋
            </a>
          </div>
        ) : (
          <div className="aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-sm mb-6">
            <iframe
              src={`//player.bilibili.com/player.html?bvid=&search=${bilibiliQuery}&page=1&autoplay=0&search_local=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              onError={() => setBilibiliError(true)}
            />
          </div>
        )}

        <div className="text-center">
          <a
            href={bilibiliSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.562 3.76v7.36c-.038 1.51-.558 2.765-1.562 3.761s-2.263 1.52-3.773 1.574H5.333c-1.51-.054-2.769-.578-3.773-1.574C.556 20.112.036 18.858 0 17.348v-7.36c.036-1.511.556-2.765 1.56-3.76C2.564 5.23 3.824 4.707 5.333 4.653h.854l-.64-.853a1.066 1.066 0 0 1-.16-1.067c.107-.32.31-.577.61-.77.299-.192.619-.278.96-.256.341.021.651.139.928.352l.96.746.853-1.067a1.29 1.29 0 0 1 .96-.533c.363-.021.693.075.992.288.3.213.503.48.61.8.107.32.096.63-.053.96l-.427.853h2.986l-.64-.853a1.28 1.28 0 0 1-.16-1.067c.107-.32.31-.577.61-.77.3-.192.62-.278.96-.256.342.021.651.139.928.352l.96.746.854-1.067a1.29 1.29 0 0 1 .96-.533c.362-.021.692.075.991.288.3.213.504.48.611.8.106.32.095.63-.054.96l-.426.853zm-10.666 8.96c.32 0 .587-.107.8-.32.213-.213.32-.48.32-.8s-.107-.587-.32-.8a1.094 1.094 0 0 0-.8-.32c-.32 0-.587.107-.8.32-.213.213-.32.48-.32.8s.107.587.32.8c.213.213.48.32.8.32zm2.666 3.2c1.45 0 2.688-.502 3.712-1.504 1.024-1.003 1.536-2.219 1.536-3.648 0-1.43-.512-2.646-1.536-3.648-1.024-1.003-2.262-1.504-3.712-1.504s-2.688.501-3.712 1.504c-1.024 1.002-1.536 2.218-1.536 3.648 0 1.429.512 2.645 1.536 3.648 1.024 1.002 2.262 1.504 3.712 1.504zm8-3.2c.32 0 .587-.107.8-.32.213-.213.32-.48.32-.8s-.107-.587-.32-.8a1.094 1.094 0 0 0-.8-.32c-.32 0-.587.107-.8.32-.213.213-.32.48-.32.8s.107.587.32.8c.213.213.48.32.8.32z"/>
            </svg>
            在 Bilibili 上搜尋
          </a>
        </div>
      </div>

      {/* More highlights from ELTA */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">更多世界盃精華</h2>
        <p className="text-sm text-gray-500 mb-4">
          前往 <a href={eltaChannelUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">愛爾達體育家族</a> 頻道，觀看完整比賽精華、賽後分析與即時報導。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a href="https://www.youtube.com/@eltasports/videos" target="_blank" rel="noopener noreferrer"
             className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
            <div className="text-2xl mb-1">📺</div>
            <div className="text-sm font-medium text-gray-700">全部影片</div>
          </a>
          <a href="https://www.youtube.com/@eltasports/streams" target="_blank" rel="noopener noreferrer"
             className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
            <div className="text-2xl mb-1">🔴</div>
            <div className="text-sm font-medium text-gray-700">直播中</div>
          </a>
          <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent("愛爾達 世界盃 2026 精華")}`}
             target="_blank" rel="noopener noreferrer"
             className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-sm font-medium text-gray-700">世界盃精華</div>
          </a>
        </div>
      </div>
    </div>
  );
}
