import Link from "next/link";

interface NewsCardProps {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  url: string;
  category?: string;
}

export default function NewsCard({ id, title, source, date, summary, url, category }: NewsCardProps) {
  const formatDate = (d: string) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("zh-TW", { month: "short", day: "numeric" });
    } catch {
      return d;
    }
  };

  const categoryLabels: Record<string, string> = {
    "match-report": "賽事報導",
    "feature": "專題",
    "team-news": "球隊動態",
    "venue": "場館",
  };

  const categoryColors: Record<string, string> = {
    "match-report": "bg-red-100 text-red-700",
    "feature": "bg-purple-100 text-purple-700",
    "team-news": "bg-blue-100 text-blue-700",
    "venue": "bg-green-100 text-green-700",
  };

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5 group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-blue-600">{source}</span>
        <div className="flex items-center gap-2">
          {category && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${categoryColors[category] || "bg-gray-100 text-gray-600"}`}>
              {categoryLabels[category] || category}
            </span>
          )}
          <span className="text-xs text-gray-400">{formatDate(date)}</span>
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
        {title}
      </h3>

      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{summary}</p>

      <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        閱讀全文
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
