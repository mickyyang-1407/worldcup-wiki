'use client';

import React from 'react';

interface DonationBannerProps {
  donateUrl?: string;
}

export default function DonationBanner({
  donateUrl = "https://portaly.cc/mickyyang/support"
}: DonationBannerProps) {
  return (
    <div className="w-full bg-gray-900   dark: dark: rounded-xl shadow-sm border border-amber-100 dark:border-gray-700 p-4 md:p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
      {/* 裝飾背景 */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl"></div>
      
      <div className="relative z-10 flex-1">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>⚽️</span> 支持 WorldCup Wiki 持續更新！
        </h3>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1">
          本站由站長獨立開發維護。如果您覺得即時比分和賽程資訊對您有幫助，歡迎贊助站長一杯咖啡，讓伺服器和站長都能保持最佳狀態！
        </p>
      </div>

      <div className="relative z-10 shrink-0 w-full md:w-auto">
        <a
          href={donateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white transition-all duration-200 bg-gray-900   border border-transparent rounded-xl hover: hover: focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <span className="text-xl group-hover:rotate-12 transition-transform">☕️</span>
          請站長喝杯咖啡
        </a>
      </div>
    </div>
  );
}
