"use client";

import { useState } from 'react';
import type { TeamPrediction } from '@/lib/predictionTypes';

type SortKey = 'rank' | 'probability' | 'groupPoints' | 'odds';

interface Props {
  predictions: TeamPrediction[];
}

const TREND_ICON: Record<string, string> = { up: '↑', down: '↓', stable: '→' };
const TREND_COLOR: Record<string, string> = { up: '#22c55e', down: '#ef4444', stable: '#9ca3af' };

const SORT_LABELS: Record<SortKey, string> = {
  rank:        '總排名',
  probability: '奪冠機率',
  groupPoints: '小組積分',
  odds:        '賠率',
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
    else { setSortKey(key); setAsc(key === 'rank' || key === 'odds'); }
  }

  function SortBtn({ k }: { k: SortKey }) {
    const active = sortKey === k;
    return (
      <button
        onClick={() => handleSort(k)}
        className="text-xs px-3 py-1 rounded-full font-medium transition-colors"
        style={{
          background: active ? 'linear-gradient(135deg,#8286cd,#26458b)' : 'rgba(0,0,0,0.06)',
          color: active ? '#fff' : '#6b7280',
        }}
      >
        {SORT_LABELS[k]} {active ? (asc ? '↑' : '↓') : ''}
      </button>
    );
  }

  return (
    <div>
      {/* Sort controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm text-gray-500 self-center">排序：</span>
        {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
          <SortBtn key={k} k={k} />
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left w-10">#</th>
              <th className="px-4 py-3 text-left">隊伍</th>
              <th className="px-4 py-3 text-left">組</th>
              <th className="px-4 py-3 text-right">機率</th>
              <th className="px-4 py-3 text-right">小組分</th>
              <th className="px-4 py-3 text-right">得失球</th>
              <th className="px-4 py-3 text-right">賠率</th>
              <th className="px-4 py-3 text-center">趨勢</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, idx) => {
              const pct = (p.probability * 100).toFixed(2);
              const isTop8 = p.rank <= 8;
              const isTop16 = p.rank <= 16;
              return (
                <tr
                  key={p.teamId}
                  className="border-t border-gray-50 hover:bg-gray-50 transition-colors"
                  style={{ opacity: isTop16 ? 1 : 0.72 }}
                >
                  <td className="px-4 py-2.5 font-bold text-gray-400 text-xs">{p.rank}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {p.flagCode && (
                        <span className={`fi fi-${p.flagCode} fis`} style={{ fontSize: 16, borderRadius: 2 }} />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 leading-tight">{p.teamNameZh}</p>
                        <p className="text-xs text-gray-400 leading-tight">{p.teamName}</p>
                      </div>
                      {isTop8 && (
                        <span className="ml-1 text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{ background: '#8286cd20', color: '#8286cd' }}>
                          熱門
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="text-xs px-2 py-0.5 rounded font-medium bg-gray-100 text-gray-600">
                      {p.group}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div>
                      <p className="font-bold text-gray-800">{pct}%</p>
                      <div className="w-16 h-1 bg-gray-100 rounded-full ml-auto mt-0.5">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(parseFloat(pct) * 5, 100)}%`,
                            background: 'linear-gradient(90deg,#C9A227,#8286cd)',
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-gray-700">{p.groupPoints}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">
                    {p.goalDifference > 0 ? `+${p.goalDifference}` : p.goalDifference}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-600">
                    {p.odds ? p.odds.toFixed(1) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-center font-bold" style={{ color: TREND_COLOR[p.trend] }}>
                    {TREND_ICON[p.trend]}
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
