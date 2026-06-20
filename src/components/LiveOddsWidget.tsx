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
  donateUrl?: string;
}

export default function LiveOddsWidget({
  homeTeam,
  awayTeam,
  oddsHome = "2.10",
  oddsDraw = "3.25",
  oddsAway = "2.85",
  donateUrl = "https://www.buymeacoffee.com/yourusername" // 替換成您的贊助連結
}: LiveOddsWidgetProps) {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 my-4 overflow-hidden relative">
      {/* 裝飾用的背景亮點 */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl"></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        
        {/* 左側：盤口資訊 */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Live Odds (參考賠率)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
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

        {/* 右側：贊助按鈕 */}
        <div className="w-full md:w-auto flex flex-col items-center justify-center shrink-0 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
            覺得本站提供的資訊有幫助嗎？
          </p>
          <a
            href={donateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 bg-gradient-to-r from-amber-500 to-orange-500 border border-transparent rounded-full hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-md hover:shadow-lg w-full md:w-auto"
          >
            <span className="mr-2 text-lg group-hover:scale-110 transition-transform">🍻</span>
            請站長喝杯啤酒
          </a>
        </div>
      </div>
    </div>
  );
}
