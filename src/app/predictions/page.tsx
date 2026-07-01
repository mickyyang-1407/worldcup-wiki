import { getPredictions } from '@/lib/predictions';
import PageHero from '@/components/PageHero';
import TrophyWidget from '@/components/TrophyWidget';
import PredictionCard from '@/components/PredictionCard';
import DataSourceBadge from '@/components/DataSourceBadge';
import PredictionsTable from './PredictionsTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PredictionsPage() {
  const result = await getPredictions();
  const { predictions, lastUpdated, sources, dataQuality } = result;
  const top5 = predictions.slice(0, 5);
  const topTeam = predictions[0];

  return (
    <div className="-mx-6 -my-6 md:-mx-8 md:-my-8 bg-[#060818] text-slate-100 min-h-screen rounded-2xl overflow-hidden flex flex-col">
      {/* Premium Deep Red Gradient Hero Banner */}
      <PageHero
        gradient="linear-gradient(135deg, #7C1A2E 0%, #150A1A 100%)"
        title="冠軍預測"
        subtitle="多維數據分析 · 加權評分模型 · ESPN 即時賽況整合"
        tag="Predictions"
        icon="🏆"
      />

      {/* Main page content wrapped with paddings */}
      <div className="p-6 md:p-8 flex flex-col gap-10 flex-1 relative z-10">
        
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy + Scoring Methodology */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Top predicted winner card */}
          <div className="lg:col-span-4 flex flex-col">
            <TrophyWidget topTeam={topTeam} />
          </div>

          {/* Detailed methodology explanation */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-1.5 tracking-wide flex items-center gap-2">
                <span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block" /> 冠軍預測模型方法論
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                整合 7 個核心維度的即時數據，採用多維度權重分析（Weighted Scoring Model）得出評分。模型融合了球隊的歷史底蘊、目前世界排名、即時賽事狀態以及博彩市場隱含機率，全面評估奪冠可能性。
              </p>

              {/* Weight Distribution Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                  <span>模型權重分配比例</span>
                  <span className="text-indigo-400 font-semibold">Total 100%</span>
                </div>
                <div className="w-full bg-slate-950/50 p-1.5 rounded-full border border-slate-850/80 flex items-center overflow-hidden h-7 shadow-inner">
                  <div className="h-full bg-indigo-500 rounded-l-full flex items-center justify-center text-[10px] font-extrabold text-white transition-all duration-300 hover:opacity-90 cursor-default" style={{ width: '25%' }} title="小組賽成績: 25%">25%</div>
                  <div className="h-full bg-amber-500 flex items-center justify-center text-[10px] font-extrabold text-slate-950 transition-all duration-300 hover:opacity-90 cursor-default" style={{ width: '20%' }} title="奪冠賠率: 20%">20%</div>
                  <div className="h-full bg-blue-500 flex items-center justify-center text-[10px] font-extrabold text-white transition-all duration-300 hover:opacity-90 cursor-default" style={{ width: '15%' }} title="小組得失球: 15%">15%</div>
                  <div className="h-full bg-emerald-500 flex items-center justify-center text-[10px] font-extrabold text-white transition-all duration-300 hover:opacity-90 cursor-default" style={{ width: '15%' }} title="近期狀態: 15%">15%</div>
                  <div className="h-full bg-yellow-500 flex items-center justify-center text-[10px] font-extrabold text-slate-950 transition-all duration-300 hover:opacity-90 cursor-default" style={{ width: '10%' }} title="FIFA 排名: 10%">10%</div>
                  <div className="h-full bg-purple-500 flex items-center justify-center text-[10px] font-extrabold text-white transition-all duration-300 hover:opacity-90 cursor-default" style={{ width: '10%' }} title="媒體聲望: 10%">10%</div>
                  <div className="h-full bg-rose-500 rounded-r-full flex items-center justify-center text-[9px] font-extrabold text-white transition-all duration-300 hover:opacity-90 cursor-default" style={{ width: '5%' }} title="攻守指數: 5%">5%</div>
                </div>
              </div>
            </div>

            {/* Weights Cards Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {[
                { label: '小組賽成績', weight: '25%', desc: '積分及戰意', color: 'bg-indigo-500', text: 'text-indigo-400' },
                { label: '奪冠賠率', weight: '20%', desc: '市場大眾預期', color: 'bg-amber-500', text: 'text-amber-400' },
                { label: '小組得失球', weight: '15%', desc: '攻防淨勝水準', color: 'bg-blue-500', text: 'text-blue-400' },
                { label: '近期狀態', weight: '15%', desc: '近期勝負連貫', color: 'bg-emerald-500', text: 'text-emerald-400' },
                { label: 'FIFA 排名', weight: '10%', desc: '官方戰力趨勢', color: 'bg-yellow-500', text: 'text-yellow-400' },
                { label: '媒體聲望', weight: '10%', desc: '聲望關注指標', color: 'bg-purple-500', text: 'text-purple-400' },
                { label: '攻守指數', weight: '5%',  desc: '進出失球效能', color: 'bg-rose-500', text: 'text-rose-400' },
              ].map((dim) => (
                <div key={dim.label} className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-850/60 flex flex-col justify-between gap-1.5 hover:border-slate-700/60 transition-all duration-200">
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className={`w-1.5 h-1.5 rounded-full ${dim.color}`} />
                    <span className={`text-[10px] font-extrabold ${dim.text}`}>{dim.weight}</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-200 mt-1 leading-tight truncate">{dim.label}</p>
                  <p className="text-[9px] text-slate-500 leading-tight truncate">{dim.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 5 Hot Contenders */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-slate-100 tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block" /> 🏆 奪冠大熱門 (Top 5 Contenders)
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Champion favorite card */}
            <div className="lg:col-span-7 flex flex-col">
              <PredictionCard prediction={top5[0]} highlight={true} />
            </div>
            
            {/* Rank 2-5 grids */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {top5.slice(1).map((p) => (
                <PredictionCard key={p.teamId} prediction={p} highlight={false} />
              ))}
            </div>
          </div>
        </div>

        {/* 48 Teams rankings list */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-slate-100 tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block" /> 📊 48 隊預測指數完整排名
          </h3>
          <PredictionsTable predictions={predictions} />
        </div>

        {/* DataSource badges & updates */}
        <DataSourceBadge
          sources={sources}
          dataQuality={dataQuality}
          lastUpdated={lastUpdated}
        />
      </div>
    </div>
  );
}
