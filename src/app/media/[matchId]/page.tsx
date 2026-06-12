import Link from "next/link";
import { matches } from "@/data/schedule";
import { teams } from "@/data/teams";
import TeamBadge from "@/components/TeamBadge";

export function generateStaticParams() {
  return (matches as any[]).map((m: any) => ({ matchId: m.id }));
}

export default async function MediaPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
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
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
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

      {/* Video Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">比賽精華</h2>
        <p className="text-sm text-gray-500 mb-6">
          搜尋來源：<a href={eltaChannelUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">愛爾達體育家族 YouTube</a>
        </p>

        {/* YouTube Search Embed */}
        <div className="aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-sm mb-6">
          <iframe
            src={`https://www.youtube.com/embed?listType=search&query=${searchQuery}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

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

      {/* Other highlights from ELTA */}
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
