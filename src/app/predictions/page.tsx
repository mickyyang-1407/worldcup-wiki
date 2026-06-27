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
    <div>
      <PageHero
        gradient="#af3525"
        title="冠軍預測"
        subtitle="多維數據分析 · 加權評分模型 · ESPN 即時賽況整合"
        tag="Predictions"
        icon="🏆"
      />

      {/* Trophy + Top team */}
      <div className="flex flex-col lg:flex-row items-center gap-8 mb-10">
        {/* Trophy widget */}
        <div className="flex-shrink-0">
          <TrophyWidget topTeam={topTeam} />
        </div>

        {/* Scoring methodology */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-800 mb-3">預測方法</h2>
          <p className="text-sm text-gray-600 mb-4">
            整合 7 個維度的加權評分，即時反映賽場數據與市場預期：
          </p>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: '小組賽成績', weight: '25%', desc: '積分 / 最大可得積分', color: '#8286cd' },
              { label: '奪冠賠率',   weight: '20%', desc: '博彩市場隱含機率',   color: '#af3525' },
              { label: '小組得失球', weight: '15%', desc: '得失球差，反映實力差距', color: '#26458b' },
              { label: '近期狀態',   weight: '15%', desc: '近期比賽勝負表現',   color: '#a4c44d' },
              { label: 'FIFA 排名',  weight: '10%', desc: '官方世界排名趨勢',   color: '#C9A227' },
              { label: '媒體聲望',   weight: '10%', desc: '媒體關注度與情緒分析', color: '#907ad6' },
              { label: '攻守指數',   weight: '5%',  desc: '場均進球 / 失球比率', color: '#5b2227' },
            ].map((dim) => (
              <div key={dim.label} className="flex items-center gap-3 text-sm">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded text-white min-w-[40px] text-center"
                  style={{ background: dim.color }}
                >
                  {dim.weight}
                </span>
                <span className="font-medium text-gray-700 w-24">{dim.label}</span>
                <span className="text-gray-400 text-xs">{dim.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 5 prediction cards */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🥇</span> 前五大熱門
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-5">
          {top5.map((p, i) => (
            <PredictionCard key={p.teamId} prediction={p} highlight={i === 0} />
          ))}
        </div>
      </div>

      {/* Full rankings table */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📊</span> 48 隊完整排名
        </h2>
        <PredictionsTable predictions={predictions} />
      </div>

      {/* Source badges + disclaimer */}
      <DataSourceBadge
        sources={sources}
        dataQuality={dataQuality}
        lastUpdated={lastUpdated}
      />
    </div>
  );
}
