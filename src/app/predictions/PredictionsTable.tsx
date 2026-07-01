"use client";

import { useState } from 'react';
import type { TeamPrediction } from '@/lib/predictionTypes';
import { ArrowUpDown, ShieldAlert, Award, Star } from 'lucide-react';

type SortKey = 'rank' | 'probability' | 'groupPoints' | 'odds';

interface Props {
  predictions: TeamPrediction[];
}

const TREND_ICON: Record<string, string> = { up: '▲', down: '▼', stable: '—' };
const TREND_COLOR: Record<string, string> = { 
  up: 'text-emerald-600 dark:text-emerald-400', 
  down: 'text-rose-600 dark:text-rose-500', 
  stable: 'text-gray-400 dark:text-slate-500' 
};

const SORT_LABELS: Record<SortKey, string> = {
  rank:        '總排名',
  probability: '奪冠機率',
  groupPoints: '小組積分',
  odds:        '市場賠率',
};

export default function PredictionsTable({ predictions }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [asc, setAsc] = useState(true);

  const sorted = [...predictions].sort((a, b) => {
    let va: number, vb: number;
    if (sortKey === 'odds') {
      va = a.odds ?? 99999;
      vb = b.odds ?? 99999;
    } else {
      va = a[sortKey] as number;
      vb = b[sortKey] as number;
    }
    return asc ? va - vb : vb - va;
  });

  function handleSort(key: SortKey) {
    if (key === sortKey) setAsc((v) => !v);
    else { 
      setSortKey(key); 
      setAsc(key === 'rank' || key === 'odds'); 
    }
  }

  function SortBtn({ k }: { k: SortKey }) {
    const active = sortKey === k;
    return (
      <button
        onClick={() => handleSort(k)}
        className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full font-semibold border transition-all duration-200 cursor-pointer ${
          active 
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/10' 
            : 'bg-gray-100 dark:bg-[#161F4C]/40 text-gray-600 dark:text-slate-300 border-gray-250 dark:border-slate-800 hover:bg-gray-200 dark:hover:bg-[#1E296B]/60 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <span>{SORT_LABELS[k]}</span>
        {active ? (
          asc ? <span className="text-[10px]">▲</span> : <span className="text-[10px]">▼</span>
        ) : (
          <ArrowUpDown size={11} className="opacity-45" />
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Sort controls */}
      <div className="flex flex-wrap items-center gap-3 bg-gray-50/60 dark:bg-slate-950/20 p-3 rounded-xl border border-gray-200 dark:border-slate-850/50">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">排序維度：</span>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
            <SortBtn key={k} k={k} />
          ))}
        </div>
      </div>

      {/* Standings Table container */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0F132E]/65 shadow-xl backdrop-blur-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#18204E]/50 text-[11px] font-bold text-gray-500 dark:text-slate-450 tracking-wider uppercase border-b border-gray-200 dark:border-slate-800">
              <th className="px-4 py-3.5 text-left w-12 font-extrabold text-gray-500 dark:text-slate-400">#</th>
              <th className="px-4 py-3.5 text-left min-w-[150px]">隊伍</th>
              <th className="px-4 py-3.5 text-center w-14">小組</th>
              <th className="px-4 py-3.5 text-right w-28">奪冠機率</th>
              <th className="px-4 py-3.5 text-right w-20">小組積分</th>
              <th className="px-4 py-3.5 text-right w-20">得失球</th>
              <th className="px-4 py-3.5 text-right w-20">奪冠賠率</th>
              <th className="px-4 py-3.5 text-center w-16">走勢</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 dark:divide-slate-850/40">
            {sorted.map((p) => {
              const pct = (p.probability * 100).toFixed(2);
              const isTop4 = p.rank <= 4;
              const isTop8 = p.rank <= 8;
              const isEliminated = p.qualificationStatus === 'eliminated';
              const isQualified = p.qualificationStatus === 'qualified';

              return (
                <tr
                  key={p.teamId}
                  className={`hover:bg-gray-50/80 dark:hover:bg-[#182356]/30 transition-colors duration-150 ${
                    isEliminated 
                      ? 'bg-gray-100/40 dark:bg-slate-950/30 opacity-40 text-gray-400 dark:text-slate-500' 
                      : p.rank === 1 
                        ? 'bg-amber-500/5' 
                        : 'text-gray-700 dark:text-slate-200'
                  }`}
                >
                  {/* Rank */}
                  <td className="px-4 py-3 font-mono font-bold text-xs text-gray-500 dark:text-slate-550">
                    {p.rank === 1 ? (
                      <span className="text-amber-500 dark:text-amber-400 font-extrabold">🏆 1</span>
                    ) : p.rank}
                  </td>

                  {/* Team details */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.flagCode && (
                        <span className={`fi fi-${p.flagCode} fis shadow-md flex-shrink-0`} style={{ fontSize: 20, borderRadius: 3 }} />
                      )}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <p className={`font-bold leading-snug tracking-wide truncate ${isEliminated ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-900 dark:text-slate-100'}`}>
                            {p.teamNameZh}
                          </p>
                          
                          {/* Qualification Badges */}
                          {isQualified && (
                            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                              已晉級
                            </span>
                          )}
                          {isEliminated && (
                            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-900/80 text-slate-500 border border-slate-800">
                              已淘汰
                            </span>
                          )}
                          {isTop4 && !isEliminated && (
                            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/50 shadow-[0_0_8px_rgba(245,158,11,0.1)]">
                              核心熱門
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 dark:text-slate-450 font-medium truncate">{p.teamName}</p>
                      </div>
                    </div>
                  </td>

                  {/* Group */}
                  <td className="px-4 py-3 text-center">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded border bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-350">
                      {p.group}組
                    </span>
                  </td>

                  {/* Probability Bar */}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex flex-col items-end min-w-[70px]">
                      <p className={`font-mono font-bold ${isEliminated ? 'text-gray-400 dark:text-slate-500' : isTop4 ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-sky-400'}`}>
                        {isEliminated ? '0.00' : pct}%
                      </p>
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-slate-850 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isEliminated 
                              ? 'bg-transparent' 
                              : isTop8 
                                ? 'bg-gradient-to-r from-amber-50 to-yellow-450 shadow-[0_0_4px_#f59e0b]' 
                                : 'bg-gradient-to-r from-sky-500 to-cyan-400'
                          }`}
                          style={{
                            width: isEliminated ? '0%' : `${Math.min(parseFloat(pct) * 4, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Group Points */}
                  <td className="px-4 py-3 text-right font-mono font-semibold text-gray-700 dark:text-slate-200">
                    {p.groupPoints}
                  </td>

                  {/* GD */}
                  <td className={`px-4 py-3 text-right font-mono font-medium ${
                    isEliminated 
                      ? 'text-gray-400 dark:text-slate-500' 
                      : p.goalDifference > 0 
                        ? 'text-emerald-600 dark:text-emerald-450' 
                        : p.goalDifference < 0 
                          ? 'text-rose-600 dark:text-rose-450' 
                          : 'text-gray-400 dark:text-slate-400'
                  }`}>
                    {p.goalDifference > 0 ? `+${p.goalDifference}` : p.goalDifference}
                  </td>

                  {/* Odds */}
                  <td className="px-4 py-3 text-right font-mono text-gray-600 dark:text-slate-300">
                    {p.odds ? p.odds.toFixed(1) : '—'}
                  </td>

                  {/* Trend */}
                  <td className={`px-4 py-3 text-center font-bold ${isEliminated ? 'text-gray-400 dark:text-slate-550' : TREND_COLOR[p.trend]}`}>
                    <span className="text-xs">{isEliminated ? '—' : TREND_ICON[p.trend]}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
