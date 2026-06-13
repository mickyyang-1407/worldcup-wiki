import Link from "next/link";
import TeamBadge from "./TeamBadge";
import { teams } from "@/data/teams";

interface VideoLink {
  id?: string;
  bvid?: string;
  title?: string;
}

interface HighlightCardProps {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  stage: string;
  group?: string;
  score: { home: number; away: number };
  status: string;
  youtube?: VideoLink;
  bilibili?: VideoLink;
}

const stageLabels: Record<string, string> = {
  group: "小組賽",
  "round-of-16": "16強",
  "quarter-finals": "8強",
  "semi-finals": "準決賽",
  "third-place": "季軍戰",
  final: "決賽",
};

export default function HighlightCard({
  matchId,
  homeTeam,
  awayTeam,
  date,
  stage,
  group,
  score,
  status,
  youtube,
  bilibili,
}: HighlightCardProps) {
  const home = (teams as any[]).find((t: any) => t.id === homeTeam);
  const away = (teams as any[]).find((t: any) => t.id === awayTeam);

  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("zh-TW", { month: "short", day: "numeric", weekday: "short" });
  };

  return (
    <Link
      href={`/media/${matchId}`}
      className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
    >
      <div className="p-4">
        {/* Stage badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold ${stage === "group" ? "text-blue-600" : "text-purple-600"}`}>
            {stage === "group" ? `${group}組` : stageLabels[stage] || stage}
          </span>
          <span className="text-xs text-gray-400">{formatDate(date)}</span>
        </div>

        {/* Teams & Score */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex-1 text-right">
            <TeamBadge teamId={homeTeam} size="md" linkable={false} />
            <div className="text-xs font-medium text-gray-700 mt-1">{home?.name_zh || homeTeam}</div>
          </div>
          <div className="shrink-0 text-center">
            {status === "completed" ? (
              <span className="text-xl font-bold text-gray-900 font-mono">
                {score.home} - {score.away}
              </span>
            ) : (
              <span className="text-base font-semibold text-gray-500">vs</span>
            )}
          </div>
          <div className="flex-1 text-left">
            <TeamBadge teamId={awayTeam} size="md" linkable={false} />
            <div className="text-xs font-medium text-gray-700 mt-1">{away?.name_zh || awayTeam}</div>
          </div>
        </div>

        {/* Video source indicators */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
          {youtube?.id || bilibili?.bvid ? (
            <>
              {youtube?.id && (
                <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </span>
              )}
              {bilibili?.bvid && (
                <span className="inline-flex items-center gap-1 text-xs text-blue-500 font-medium">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.562 3.76v7.36c-.038 1.51-.558 2.765-1.562 3.761s-2.263 1.52-3.773 1.574H5.333c-1.51-.054-2.769-.578-3.773-1.574C.556 20.112.036 18.858 0 17.348v-7.36c.036-1.511.556-2.765 1.56-3.76C2.564 5.23 3.824 4.707 5.333 4.653h.854l-.64-.853a1.066 1.066 0 0 1-.16-1.067c.107-.32.31-.577.61-.77.299-.192.619-.278.96-.256.341.021.651.139.928.352l.96.746.853-1.067a1.29 1.29 0 0 1 .96-.533c.363-.021.693.075.992.288.3.213.503.48.61.8.107.32.096.63-.053.96l-.427.853h2.986l-.64-.853a1.28 1.28 0 0 1-.16-1.067c.107-.32.31-.577.61-.77.3-.192.62-.278.96-.256.342.021.651.139.928.352l.96.746.854-1.067a1.29 1.29 0 0 1 .96-.533c.362-.021.692.075.991.288.3.213.504.48.611.8.106.32.095.63-.054.96l-.426.853zm-10.666 8.96c.32 0 .587-.107.8-.32.213-.213.32-.48.32-.8s-.107-.587-.32-.8a1.094 1.094 0 0 0-.8-.32c-.32 0-.587.107-.8.32-.213.213-.32.48-.32.8s.107.587.32.8c.213.213.48.32.8.32zm2.666 3.2c1.45 0 2.688-.502 3.712-1.504 1.024-1.003 1.536-2.219 1.536-3.648 0-1.43-.512-2.646-1.536-3.648-1.024-1.003-2.262-1.504-3.712-1.504s-2.688.501-3.712 1.504c-1.024 1.002-1.536 2.218-1.536 3.648 0 1.429.512 2.645 1.536 3.648 1.024 1.002 2.262 1.504 3.712 1.504zm8-3.2c.32 0 .587-.107.8-.32.213-.213.32-.48.32-.8s-.107-.587-.32-.8a1.094 1.094 0 0 0-.8-.32c-.32 0-.587.107-.8.32-.213.213-.32.48-.32.8s.107.587.32.8c.213.213.48.32.8.32z"/>
                  </svg>
                  Bilibili
                </span>
              )}
              <span className="ml-auto text-xs text-blue-600 group-hover:text-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                觀看 →
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-400">📺 精華準備中</span>
          )}
        </div>
      </div>
    </Link>
  );
}
