"use client";

import type { TeamPrediction, DimensionScores } from '@/lib/predictionTypes';

interface Props {
  prediction: TeamPrediction;
  highlight?: boolean;
}

const RANK_COLORS: Record<number, string> = {
  1: '#C9A227',
  2: '#9E9E9E',
  3: '#CD7F32',
};

const RADAR_KEYS: (keyof DimensionScores)[] = [
  'groupStage', 'goalDifference', 'fifaRanking',
  'bettingOdds', 'recentForm', 'mediaSentiment', 'attackDefense',
];
const RADAR_LABELS: Record<keyof DimensionScores, string> = {
  groupStage:     '小組賽',
  goalDifference: '得失球',
  fifaRanking:    'FIFA',
  bettingOdds:    '賠率',
  recentForm:     '狀態',
  mediaSentiment: '聲望',
  attackDefense:  '攻守',
};

const N = RADAR_KEYS.length;
const CX = 60;
const CY = 60;
const R_MAX = 46;

function radarPoint(score: number, i: number): [number, number] {
  const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
  const r = (score / 100) * R_MAX;
  return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)];
}

function gridPoint(fraction: number, i: number): [number, number] {
  const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
  const r = fraction * R_MAX;
  return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)];
}

function RadarChart({ dims }: { dims: DimensionScores }) {
  const dataPoints = RADAR_KEYS.map((k, i) => radarPoint(dims[k], i));
  const polygon = dataPoints.map(([x, y]) => `${x},${y}`).join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 120 120" width={120} height={120}>
      {/* Grid levels */}
      {gridLevels.map((frac) => {
        const pts = Array.from({ length: N }, (_, i) => {
          const [x, y] = gridPoint(frac, i);
          return `${x},${y}`;
        }).join(' ');
        return (
          <polygon
            key={frac}
            points={pts}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="0.8"
          />
        );
      })}

      {/* Axis lines */}
      {Array.from({ length: N }, (_, i) => {
        const [x, y] = gridPoint(1, i);
        return (
          <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#e5e7eb" strokeWidth="0.8" />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={polygon}
        fill="rgba(130,134,205,0.25)"
        stroke="#8286cd"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2} fill="#8286cd" />
      ))}

      {/* Labels */}
      {RADAR_KEYS.map((k, i) => {
        const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
        const lx = CX + (R_MAX + 13) * Math.cos(angle);
        const ly = CY + (R_MAX + 13) * Math.sin(angle);
        return (
          <text
            key={k}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="7"
            fill="#9ca3af"
            fontWeight="500"
          >
            {RADAR_LABELS[k]}
          </text>
        );
      })}
    </svg>
  );
}

const TREND_ICON: Record<string, string> = {
  up: '↑',
  down: '↓',
  stable: '→',
};
const TREND_COLOR: Record<string, string> = {
  up: '#22c55e',
  down: '#ef4444',
  stable: '#9ca3af',
};

export default function PredictionCard({ prediction: p, highlight }: Props) {
  const rankColor = RANK_COLORS[p.rank] || '#6b7280';
  const pctNum = p.probability * 100;
  const pct = pctNum.toFixed(1);

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 min-w-[200px] flex-1 border transition-shadow hover:shadow-md"
      style={{
        background: highlight ? 'linear-gradient(135deg,rgba(130,134,205,0.08),rgba(38,69,139,0.06))' : 'rgba(249,250,251,0.9)',
        borderColor: highlight ? '#8286cd40' : '#e5e7eb',
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span
          className="text-xl font-black w-8 h-8 flex items-center justify-center rounded-lg text-white text-sm"
          style={{ background: rankColor, minWidth: 32 }}
        >
          {p.rank}
        </span>

        <div className="flex items-center gap-1.5 flex-1 ml-2">
          {p.flagCode && (
            <span className={`fi fi-${p.flagCode} fis`} style={{ fontSize: 22, borderRadius: 3 }} />
          )}
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">{p.teamNameZh}</p>
            <p className="text-xs text-gray-400 leading-tight">{p.teamName}</p>
          </div>
        </div>

        <span
          className="text-sm font-bold"
          style={{ color: TREND_COLOR[p.trend] }}
          title={`趨勢: ${p.trend}`}
        >
          {TREND_ICON[p.trend]}
        </span>
      </div>

      {/* Probability bar */}
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs text-gray-500">奪冠機率</span>
          <span className="text-base font-black" style={{ color: rankColor }}>{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(pctNum, 100)}%`,
              background: `linear-gradient(90deg, ${rankColor}, #8286cd)`,
            }}
          />
        </div>
      </div>

      {/* Radar chart */}
      <div className="flex justify-center">
        <RadarChart dims={p.dimensions} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-1 text-center text-xs">
        <div>
          <p className="text-gray-400">FIFA</p>
          <p className="font-semibold text-gray-700">#{p.dimensions.fifaRanking > 0 ? Math.round((110 - (110 * p.dimensions.fifaRanking / 100))) : '—'}</p>
        </div>
        <div>
          <p className="text-gray-400">小組分</p>
          <p className="font-semibold text-gray-700">{p.groupPoints}pts</p>
        </div>
        <div>
          <p className="text-gray-400">賠率</p>
          <p className="font-semibold text-gray-700">{p.odds ? p.odds.toFixed(1) : '—'}</p>
        </div>
      </div>
    </div>
  );
}
