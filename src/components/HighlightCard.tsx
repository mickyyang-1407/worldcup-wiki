import Link from "next/link";
import TeamBadge from "./TeamBadge";
import { teams } from "@/data/teams";
import { formatDate } from "@/lib/timezone";

interface HighlightCardProps {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  stage: string;
  group?: string;
  score: { home: number; away: number };
  status: string;
}

const stageLabels: Record<string, string> = {
  group: "小組賽",
  "round-of-16": "16強",
  "quarter-finals": "8強",
  "semi-finals": "準決賽",
  "third-place": "季軍戰",
  final: "決賽",
};

const stageColors: Record<string, string> = {
  group: "#8286cd",
  "round-of-16": "#af3525",
  "quarter-finals": "#26458b",
  "semi-finals": "#a4c44d",
  "third-place": "#5b2227",
  final: "#907ad6",
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
}: HighlightCardProps) {
  const home = (teams as any[]).find((t: any) => t.id === homeTeam);
  const away = (teams as any[]).find((t: any) => t.id === awayTeam);
  const homeName = home?.name_zh || homeTeam;
  const awayName = away?.name_zh || awayTeam;

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`愛爾達 ELTA ${homeName} ${awayName} 精華 2026`)}`;
  const bilibiliSearchUrl = `https://search.bilibili.com/all?keyword=${encodeURIComponent(`2026世界盃 ${homeName} ${awayName}`)}`;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm hover:shadow-md transition-all group overflow-hidden">
      <Link href={`/media/${matchId}`} className="block p-4">
        {/* Stage badge */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-semibold"
            style={{ color: stageColors[stage] || "#8286cd" }}
          >
            {stage === "group" ? `${group}組` : stageLabels[stage] || stage}
          </span>
          <span className="text-xs text-gray-400">{formatDate(date)}</span>
        </div>

        {/* Teams & Score */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex-1 text-right">
            <TeamBadge teamId={homeTeam} size="md" linkable={false} />
            <div className="text-xs font-medium text-gray-700 mt-1">{homeName}</div>
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
            <div className="text-xs font-medium text-gray-700 mt-1">{awayName}</div>
          </div>
        </div>
      </Link>

      {/* Search Buttons */}
      <div className="px-4 pb-3 flex flex-col gap-2">
        <a
          href={youtubeSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          愛爾達精華
        </a>
        <a
          href={bilibiliSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.562 3.76v7.36c-.038 1.51-.558 2.765-1.562 3.761s-2.263 1.52-3.773 1.574H5.333c-1.51-.054-2.769-.578-3.773-1.574C.556 20.112.036 18.857 0 17.347v-7.36c.036-1.511.556-2.765 1.562-3.76 1.004-.996 2.263-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907.249-.248.551-.372.907-.372.355 0 .657.124.906.372L9.053 4.68c.22.22.33.473.33.76 0 .286-.11.539-.33.76-.22.22-.473.33-.76.33-.286 0-.539-.11-.76-.33L6.746 5.546h10.48l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907.249-.248.551-.372.907-.372.355 0 .657.124.906.372l1.92 1.84h.027zM5.333 15.48c0 .533.186.987.56 1.36.373.373.827.56 1.36.56.534 0 .988-.187 1.36-.56.374-.373.56-.827.56-1.36 0-.534-.186-.988-.56-1.36a1.846 1.846 0 0 0-1.36-.56c-.533 0-.987.186-1.36.56-.374.372-.56.826-.56 1.36zm10.454-1.36c-.373-.374-.827-.56-1.36-.56-.534 0-.988.186-1.36.56-.374.372-.56.826-.56 1.36 0 .533.186.987.56 1.36.372.373.826.56 1.36.56.533 0 .987-.187 1.36-.56.374-.373.56-.827.56-1.36 0-.534-.186-.988-.56-1.36z"/>
          </svg>
          Bilibili 精華
        </a>
      </div>
    </div>
  );
}
