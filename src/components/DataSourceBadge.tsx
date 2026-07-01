"use client";

import { Calendar, ShieldAlert } from 'lucide-react';

interface Props {
  sources: string[];
  dataQuality: 'live' | 'partial' | 'mock';
  lastUpdated: string;
}

const QUALITY_LABELS: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  live:    { label: '即時數據', color: '#22c55e', bgColor: 'bg-emerald-50 dark:bg-emerald-950/60', borderColor: 'border-emerald-200 dark:border-emerald-800/60' },
  partial: { label: '部分即時', color: '#f59e0b', bgColor: 'bg-amber-50 dark:bg-amber-950/60', borderColor: 'border-amber-200 dark:border-amber-800/60' },
  mock:    { label: '模擬數據', color: '#8286cd', bgColor: 'bg-indigo-50 dark:bg-indigo-950/60', borderColor: 'border-indigo-200 dark:border-indigo-800/60' },
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
    <div className="mt-10 border-t border-gray-200 dark:border-slate-800/80 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Sources list */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-slate-450">整合數據源：</span>
          <div className="flex flex-wrap gap-2">
            {sources.map((src) => (
              <span
                key={src}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-[#161F4C]/40 border border-gray-200 dark:border-slate-850 text-gray-650 dark:text-slate-300"
              >
                <span>{SOURCE_ICONS[src] ?? '🔗'}</span>
                <span>{src}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Quality + Time */}
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${quality.bgColor} ${quality.borderColor}`}
            style={{ color: quality.color }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block animate-ping" style={{ background: quality.color }} />
            <span>{quality.label}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100/80 dark:bg-[#161F4C]/45 border border-gray-200 dark:border-slate-850 text-gray-500 dark:text-slate-400">
            <Calendar size={12} />
            <span>最後更新：{updated}</span>
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2 bg-gray-50 dark:bg-slate-950/20 p-3 rounded-xl border border-gray-200 dark:border-slate-850/50">
        <ShieldAlert size={16} className="text-gray-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
          免責聲明：冠軍預測模型基於 7 個數據維度加權得出，結果僅供世界盃資訊參考與趣味討論，不構成任何投注或理財建議。請理性看待賽事結果。
        </p>
      </div>
    </div>
  );
}
