"use client";

import type { TeamPrediction, DimensionScores } from '@/lib/predictionTypes';
import { 
  Trophy, 
  TrendingUp, 
  Activity, 
  Zap, 
  Globe, 
  Newspaper, 
  Shield 
} from 'lucide-react';

interface Props {
  prediction: TeamPrediction;
  highlight?: boolean;
}

const RANK_COLORS: Record<number, string> = {
  1: '#F59E0B', // Golden Yellow
  2: '#94A3B8', // Silver Slate
  3: '#B45309', // Bronze Amber
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

const DIMENSION_DETAILS: Record<keyof DimensionScores, { label: string; icon: any; color: string }> = {
  groupStage:     { label: '小組賽成績', icon: Trophy, color: 'from-indigo-500 to-purple-650' },
  bettingOdds:    { label: '奪冠賠率',   icon: TrendingUp, color: 'from-amber-500 to-red-600' },
  goalDifference: { label: '小組得失球', icon: Activity, color: 'from-blue-500 to-indigo-600' },
  recentForm:     { label: '近期狀態',   icon: Zap, color: 'from-emerald-500 to-teal-650' },
  fifaRanking:    { label: 'FIFA 排名',  icon: Globe, color: 'from-yellow-500 to-amber-600' },
  mediaSentiment: { label: '媒體聲望',   icon: Newspaper, color: 'from-purple-550 to-pink-650' },
  attackDefense:  { label: '攻守指數',   icon: Shield, color: 'from-rose-500 to-pink-600' },
};

const N = RADAR_KEYS.length;
const CX = 60;
const CY = 60;
const R_MAX = 42;

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

function RadarChart({ dims, highlight }: { dims: DimensionScores; highlight: boolean }) {
  const dataPoints = RADAR_KEYS.map((k, i) => radarPoint(dims[k], i));
  const polygon = dataPoints.map(([x, y]) => `${x},${y}`).join(' ');
  const gridLevels = [0.25, 0.5, 0.75, 1];

  // Neon theme colors based on rank
  const polyFill = highlight ? 'rgba(245,158,11,0.15)' : 'rgba(56,189,248,0.15)';
  const polyStroke = highlight ? '#F59E0B' : '#38BDF8';
  const pointColor = highlight ? '#FBBF24' : '#0EA5E9';

  return (
    <svg viewBox="0 0 120 120" className="w-[130px] h-[130px] md:w-[140px] md:h-[140px] drop-shadow-[0_0_6px_rgba(0,0,0,0.3)]">
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
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.8"
          />
        );
      })}

      {/* Axis lines */}
      {Array.from({ length: N }, (_, i) => {
        const [x, y] = gridPoint(1, i);
        return (
          <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={polygon}
        fill={polyFill}
        stroke={polyStroke}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.2} fill={pointColor} className="transition-all duration-300" />
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
            fontSize="7.5"
            fill="#94A3B8"
            fontWeight="600"
          >
            {RADAR_LABELS[k]}
          </text>
        );
      })}
    </svg>
  );
}

export default function PredictionCard({ prediction: p, highlight }: Props) {
  const rankColor = RANK_COLORS[p.rank] || '#64748B';
  const pctNum = p.probability * 100;
  const pct = pctNum.toFixed(1);

  // Trend styling
  const trendConfig = {
    up: { icon: '↑', text: '看漲', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50' },
    down: { icon: '↓', text: '看跌', color: 'text-rose-400 bg-rose-950/40 border-rose-800/50' },
    stable: { icon: '→', text: '平穩', color: 'text-slate-400 bg-slate-900/60 border-slate-800/60' },
  }[p.trend];

  // 1. #1 Hot Contender: Detailed Horizontal Layout
  if (highlight) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-gradient-to-br from-[#1E1B4B]/80 via-[#0F172A]/90 to-[#0F172A]/95 p-6 shadow-[0_0_30px_rgba(245,158,11,0.12)] backdrop-blur-md transition-all duration-300 hover:border-amber-400/60 flex flex-col lg:flex-row gap-8">
        
        {/* Glow corner decorations */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Left Column: Team info, Probability, Radar chart */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 items-center">
          
          {/* Rank Badge & Flag */}
          <div className="flex flex-col items-center text-center md:text-left md:items-start gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-extrabold tracking-wider bg-amber-500 text-slate-950 px-3 py-1 rounded-md uppercase shadow-md flex items-center gap-1.5 animate-pulse">
                <Trophy size={14} className="fill-slate-950" /> Champion Favorite
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${trendConfig.color}`}>
                <span>{trendConfig.icon}</span> {trendConfig.text}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-2">
              {p.flagCode && (
                <span className={`fi fi-${p.flagCode} fis shadow-lg`} style={{ fontSize: 48, borderRadius: 6, border: '2px solid rgba(255,255,255,0.1)' }} />
              )}
              <div>
                <h3 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  {p.teamNameZh}
                  <span className="text-amber-400 text-lg font-bold">#1</span>
                </h3>
                <p className="text-sm text-slate-400 font-medium">{p.teamName} · Group {p.group}</p>
              </div>
            </div>

            {/* Probability summary */}
            <div className="w-full mt-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-slate-400 font-semibold">奪冠模擬機率</span>
                <span className="text-3xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]">{pct}%</span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-350 transition-all duration-1000 shadow-[0_0_8px_#f59e0b]"
                  style={{ width: `${Math.min(pctNum * 2.5, 100)}%` }} // Scaled slightly for visual impact
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>小組積分: {p.groupPoints} pts</span>
                <span>得失球差: {p.goalDifference > 0 ? `+${p.goalDifference}` : p.goalDifference}</span>
                <span>市場賠率: {p.odds ? p.odds.toFixed(2) : '—'}</span>
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="flex-shrink-0 bg-slate-900/30 p-2.5 rounded-2xl border border-slate-850/50 backdrop-blur-sm">
            <RadarChart dims={p.dimensions} highlight={true} />
          </div>
        </div>

        {/* Right Column: 7 Dimensions Detailed Scores */}
        <div className="flex-1 flex flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-6 lg:pt-0 lg:pl-8">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> 評分權重與分數明細
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RADAR_KEYS.map((k) => {
              const score = p.dimensions[k];
              const config = DIMENSION_DETAILS[k];
              const Icon = config.icon;
              return (
                <div key={k} className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/50 flex flex-col justify-center gap-1.5 hover:bg-slate-900/60 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-350 flex items-center gap-1.5">
                      <Icon size={12} className="text-slate-400" />
                      {config.label}
                    </span>
                    <span className="text-xs font-bold text-slate-100">{score}/100</span>
                  </div>
                  <div className="h-1.5 bg-slate-850 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${config.color}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2. #2-5 Hot Contenders: Sleek Vertical Card Layout
  return (
    <div className="relative rounded-2xl border border-slate-800 bg-[#0F132E]/70 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-slate-700 hover:shadow-xl flex flex-col gap-4">
      
      {/* Top row: Rank, Flag, Name, Trend */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className="text-base font-black w-7 h-7 flex items-center justify-center rounded-lg text-slate-950 font-sans shadow-md"
            style={{ background: rankColor }}
          >
            {p.rank}
          </span>
          <div className="flex items-center gap-2">
            {p.flagCode && (
              <span className={`fi fi-${p.flagCode} fis shadow-sm`} style={{ fontSize: 24, borderRadius: 4 }} />
            )}
            <div>
              <h4 className="font-bold text-slate-100 text-sm leading-tight">{p.teamNameZh}</h4>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight leading-tight">{p.teamName}</p>
            </div>
          </div>
        </div>

        <span
          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold border ${trendConfig.color}`}
          title={`趨勢: ${p.trend}`}
        >
          {trendConfig.icon}
        </span>
      </div>

      {/* Probability details */}
      <div className="bg-slate-905/30 p-2.5 rounded-xl border border-slate-850/50">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[11px] text-slate-400 font-medium">預測機率</span>
          <span className="text-lg font-black text-sky-400">{pct}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#0ea5e9]"
            style={{ width: `${Math.min(pctNum * 3, 100)}%` }} // Visual scaling
          />
        </div>
      </div>

      {/* Radar chart */}
      <div className="flex justify-center py-2 bg-slate-950/20 rounded-xl border border-slate-850/30">
        <RadarChart dims={p.dimensions} highlight={false} />
      </div>

      {/* Stats footer */}
      <div className="grid grid-cols-3 gap-1 text-center text-[10px] bg-slate-950/40 p-2 rounded-lg border border-slate-850/50">
        <div>
          <p className="text-slate-400 font-medium mb-0.5">FIFA 排名</p>
          <p className="font-bold text-slate-200">#{p.dimensions.fifaRanking > 0 ? Math.round((110 - (110 * p.dimensions.fifaRanking / 100))) : '—'}</p>
        </div>
        <div>
          <p className="text-slate-400 font-medium mb-0.5">小組積分</p>
          <p className="font-bold text-slate-200">{p.groupPoints} pts</p>
        </div>
        <div>
          <p className="text-slate-400 font-medium mb-0.5">奪冠賠率</p>
          <p className="font-bold text-slate-200">{p.odds ? p.odds.toFixed(1) : '—'}</p>
        </div>
      </div>
    </div>
  );
}
