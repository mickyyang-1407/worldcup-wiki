"use client";

import type { TeamPrediction } from '@/lib/predictionTypes';
import { Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  topTeam: TeamPrediction;
}

export default function TrophyWidget({ topTeam }: Props) {
  const pct = (topTeam.probability * 100).toFixed(1);

  return (
    <div className="flex flex-col items-center py-6 px-8 bg-gray-50/50 dark:bg-slate-900/40 rounded-2xl border border-gray-200 dark:border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/trophy.svg"
          alt="2026 FIFA World Cup Trophy"
          width={180}
          height={278}
          className="trophy-glow mx-auto"
        />
        <style>{`
          @keyframes trophyPulse {
            0%,100% { filter: drop-shadow(0 0 12px rgba(245,158,11,0.4)); }
            50%      { filter: drop-shadow(0 0 28px rgba(251,191,36,0.75)); }
          }
          @keyframes trophyFloat {
            0%,100% { transform: translateY(0); }
            50%      { transform: translateY(-4px); }
          }
          .trophy-glow {
            animation: trophyPulse 3s ease-in-out infinite, trophyFloat 4s ease-in-out infinite;
          }
        `}</style>
      </div>

      {/* Predicted winner label */}
      <div className="mt-4 text-center relative z-10 w-full">
        <p className="text-[10px] font-extrabold tracking-widest uppercase mb-1.5 text-amber-500/90 flex items-center justify-center gap-1">
          <Award size={12} className="fill-amber-500/10" /> 預測奪冠熱門
        </p>
        
        <div className="flex items-center justify-center gap-2 mb-1">
          {topTeam.flagCode && (
            <span
              className={`fi fi-${topTeam.flagCode} fis shadow-md border border-gray-200 dark:border-slate-800`}
              style={{ fontSize: 24, borderRadius: 3 }}
            />
          )}
          <span className="text-xl font-bold text-gray-900 dark:text-slate-100 tracking-wide">{topTeam.teamNameZh}</span>
          
          {topTeam.trend === 'up' && <TrendingUp size={16} className="text-emerald-450" />}
          {topTeam.trend === 'down' && <TrendingDown size={16} className="text-rose-400" />}
          {topTeam.trend === 'stable' && <Minus size={16} className="text-slate-450" />}
        </div>
        
        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">{topTeam.teamName} · Group {topTeam.group}</p>
        
        <div className="mt-3 py-1.5 px-4 bg-gray-100 dark:bg-slate-950/60 rounded-xl border border-gray-200 dark:border-slate-850/60 inline-flex items-center gap-2.5">
          <span
            className="text-2xl font-black tracking-tight"
            style={{ 
               background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)', 
               WebkitBackgroundClip: 'text', 
               WebkitTextFillColor: 'transparent',
               filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.25))'
            }}
          >
            {pct}%
          </span>
          <span className="text-[10px] text-gray-550 dark:text-slate-400 font-semibold uppercase tracking-wider border-l border-gray-200 dark:border-slate-800 pl-2">
            奪冠機率
          </span>
        </div>
        
        {topTeam.odds && (
          <p className="text-[11px] text-gray-500 dark:text-slate-500 mt-2 font-medium">即時賠率 {topTeam.odds.toFixed(2)}</p>
        )}
      </div>
    </div>
  );
}
