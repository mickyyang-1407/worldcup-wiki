'use client';

import React from 'react';

// 假設的 Props，您可以根據實際賽事資料結構調整
interface LiveOddsWidgetProps {
  homeTeam: string;
  awayTeam: string;
  // 以下可以設定為外部傳入，目前先用預設的 Mock 資料
  oddsHome?: string;
  oddsDraw?: string;
  oddsAway?: string;
}

export default function LiveOddsWidget({
  homeTeam,
  awayTeam,
  oddsHome = "2.10",
  oddsDraw = "3.25",
  oddsAway = "2.85",
}: LiveOddsWidgetProps) {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4 overflow-hidden relative">
      <div className="flex flex-col items-center justify-center relative z-10 w-full">
        <div className="flex items-center gap-2 mb-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Live Odds (參考賠率)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center w-full max-w-md">
          {/* 主勝 */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">{homeTeam} 勝</div>
            <div className="font-mono font-semibold text-gray-900 dark:text-white">{oddsHome}</div>
          </div>
          
          {/* 和局 */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">和局</div>
            <div className="font-mono font-semibold text-gray-900 dark:text-white">{oddsDraw}</div>
          </div>

          {/* 客勝 */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">{awayTeam} 勝</div>
            <div className="font-mono font-semibold text-gray-900 dark:text-white">{oddsAway}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
