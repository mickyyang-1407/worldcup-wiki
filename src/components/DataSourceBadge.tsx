interface Props {
  sources: string[];
  dataQuality: 'live' | 'partial' | 'mock';
  lastUpdated: string;
}

const QUALITY_LABELS: Record<string, { label: string; color: string }> = {
  live:    { label: '即時數據', color: '#22c55e' },
  partial: { label: '部分即時', color: '#f59e0b' },
  mock:    { label: '模擬數據', color: '#8286cd' },
};

const SOURCE_ICONS: Record<string, string> = {
  'ESPN Standings': '📡',
  'FIFA Rankings': '🌍',
  'Betting Odds (simulation)': '📊',
};

export default function DataSourceBadge({ sources, dataQuality, lastUpdated }: Props) {
  const quality = QUALITY_LABELS[dataQuality] ?? QUALITY_LABELS.mock;
  const updated = new Date(lastUpdated).toLocaleString('zh-TW', {
    month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="mt-8 border-t border-gray-100 pt-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">資料來源</span>
        {sources.map((src) => (
          <span
            key={src}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
          >
            <span>{SOURCE_ICONS[src] ?? '🔗'}</span>
            {src}
          </span>
        ))}
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ background: quality.color + '20', color: quality.color }}
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: quality.color }} />
          {quality.label}
        </span>
      </div>
      <p className="text-xs text-gray-400">
        最後更新：{updated} · 預測結果僅供娛樂參考，不構成任何投注建議，本站不對任何損失負責。
      </p>
    </div>
  );
}
