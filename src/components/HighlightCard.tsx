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

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`愛爾達 ${homeName} ${awayName} 精華`)}`;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
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

      {/* YouTube Search Button */}
      <div className="px-4 pb-3">
        <a
          href={youtubeSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          愛爾達搜尋精華
        </a>
      </div>
    </div>
  );
}
