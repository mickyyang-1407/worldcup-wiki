"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { matches } from "@/data/schedule";
import { teams } from "@/data/teams";
import TeamBadge from "@/components/TeamBadge";
import { formatMatchTime } from "@/lib/timezone";

export default function MediaPage({ params }: { params: Promise<{ matchId: string }> }) {
  const [matchId, setMatchId] = useState<string | null>(null);
  const [embedError, setEmbedError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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
  const eltaSearchQuery = encodeURIComponent(
    `ELTA SPORTS HD World Cup 2026 ${homeTeam?.name_zh || match.home} vs ${awayTeam?.name_zh || match.away} highlights`
  );
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
  const eltaChannelUrl = `https://www.youtube.com/@ELTASPORTSHD`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/schedule" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">← 返回賽程</Link>

      {/* Match Info Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-2">
            {formatMatchTime(match.date, match.time)} · {stageLabel(match.stage)}{match.group ? ` · ${match.group}組` : ""}
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

      {/* YouTube Section — ELTA SPORTS HD channel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">📺 ELTA SPORTS HD 精華</h2>
        <p className="text-sm text-gray-500 mb-6">
          搜尋來源：<a href={eltaChannelUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ELTA SPORTS HD YouTube</a>
        </p>

        {embedError && retryCount >= 2 ? null : embedError ? (
          <div className="aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden bg-gray-100 flex flex-col items-center justify-center gap-4 mb-6">
            <div className="text-4xl">⚠️</div>
            <p className="text-gray-500 text-sm">影片嵌入載入失敗</p>
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
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="text-sm text-blue-600 hover:underline"
            >
              重新嘗試嵌入
            </button>
          </div>
        ) : (
          <div className="aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-sm mb-6 bg-black">
            <iframe
              key={retryCount}
              src={`https://www.youtube-nocookie.com/embed?listType=search&query=${eltaSearchQuery}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={() => setEmbedError(true)}
            />
          </div>
        )}

        {(!embedError || retryCount < 2) && (
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
        )}
      </div>

      {/* More video sources */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">更多影片來源</h2>
        <p className="text-sm text-gray-500 mb-4">
          前往 <a href={eltaChannelUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">ELTA SPORTS HD</a> 頻道，觀看完整比賽精華與即時報導。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a href="https://www.youtube.com/results?search_query=%E6%84%9B%E7%88%BE%E9%81%94+%E4%B8%96%E7%95%8C%E7%9B%83+2026+%E7%B2%BE%E8%8F%AF"
             target="_blank" rel="noopener noreferrer"
             className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
            <div className="text-2xl mb-1">📺</div>
            <div className="text-sm font-medium text-gray-700">全部影片</div>
          </a>
          <a href="https://www.youtube.com/@NDTVProfit/search?query=World+Cup+2026+commentary"
             target="_blank" rel="noopener noreferrer"
             className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
            <div className="text-2xl mb-1">📝</div>
            <div className="text-sm font-medium text-gray-700">文字直播</div>
          </a>
          <a href="https://search.bilibili.com/all?keyword=2026%E4%B8%96%E7%95%8C%E7%9B%83"
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
