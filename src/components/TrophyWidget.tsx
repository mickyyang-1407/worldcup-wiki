"use client";

import type { TeamPrediction } from '@/lib/predictionTypes';

interface Props {
  topTeam: TeamPrediction;
}

export default function TrophyWidget({ topTeam }: Props) {
  const pct = (topTeam.probability * 100).toFixed(1);

  return (
    <div className="flex flex-col items-center py-8">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/trophy.svg"
          alt="2026 FIFA World Cup Trophy"
          width={200}
          height={309}
          className="trophy-glow"
        />

        <style>{`
          @keyframes trophyPulse {
            0%,100% { filter: drop-shadow(0 0 14px rgba(218,165,32,0.5)); }
            50%      { filter: drop-shadow(0 0 35px rgba(255,215,0,0.85)); }
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
      <div className="mt-4 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#8286cd' }}>
          預測冠軍
        </p>
        <div className="flex items-center justify-center gap-2 mb-1">
          {topTeam.flagCode && (
            <span
              className={`fi fi-${topTeam.flagCode} fis`}
              style={{ fontSize: 28, borderRadius: 4 }}
            />
          )}
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{topTeam.teamNameZh}</span>
          {topTeam.trend === 'up' && <span className="text-green-500 text-lg">↑</span>}
          {topTeam.trend === 'down' && <span className="text-red-500 text-lg">↓</span>}
          {topTeam.trend === 'stable' && <span className="text-gray-400 text-lg">→</span>}
        </div>
        <p className="text-sm text-gray-500">{topTeam.teamName}</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span
            className="text-3xl font-black"
            style={{ background: 'linear-gradient(135deg,#B7791F,#F6D860)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            {pct}%
          </span>
          <span className="text-xs text-gray-400">奪冠機率</span>
        </div>
        {topTeam.odds && (
          <p className="text-xs text-gray-400 mt-1">賠率 {topTeam.odds.toFixed(2)}</p>
        )}
      </div>
    </div>
  );
}
