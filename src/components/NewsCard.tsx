interface NewsCardProps {
  title: string;
  source: string;
  date: string;
  summary: string;
  url: string;
}

export default function NewsCard({ title, source, date, summary, url }: NewsCardProps) {
  const formatDate = (d: string) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("zh-TW", { month: "short", day: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5 group"
    >
      {/* Source & Date */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-blue-600">{source}</span>
        <span className="text-xs text-gray-400">{formatDate(date)}</span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
        {title}
      </h3>

      {/* Summary */}
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{summary}</p>

      {/* Read more */}
      <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        閱讀全文
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}
