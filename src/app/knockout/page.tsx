import MatchCard from "@/components/MatchCard";
import { matches } from "@/data/schedule";
import LiveMatchesGrid from "@/components/LiveMatchesGrid";
import PageHero from "@/components/PageHero";
import LiveKnockoutBracket from "@/components/LiveKnockoutBracket";

const stageOrder = [
  { key: "round-of-32", label: "32 強 (新增)", color: "bg-pink-500" },
  { key: "round-of-16", label: "16 強", color: "bg-purple-500" },
  { key: "quarter-finals", label: "8 強 (半準決賽)", color: "bg-indigo-500" },
  { key: "semi-finals", label: "準決賽", color: "bg-blue-500" },
  { key: "third-place", label: "季軍戰", color: "bg-teal-500" },
  { key: "final", label: "決賽", color: "bg-yellow-500" },
];

export default function KnockoutPage() {
  return (
    <div>
      <PageHero
        gradient="#af3525"
        title="淘汰賽"
        subtitle="2026 世界盃擴編為 48 隊，淘汰賽由 32 強起步！"
        tag="Knockout"
        icon="🏆"
      />

      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <h2 className="text-2xl font-bold text-gray-900">即時戰況預測晉級樹 (Knockout Bracket)</h2>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-amber-100 border-l-4 border-amber-500"></span>
              <span>金色：已贏球確定晉級</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-gray-50/50 border border-gray-200 opacity-40"></span>
              <span>淡化：輸球已淘汰</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-white border border-gray-200"></span>
              <span>白色：待踢 / 預測參賽</span>
            </div>
          </div>
        </div>
        <LiveKnockoutBracket />
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 border-t border-gray-200 pt-8">官方賽程表</h2>
        {stageOrder.map(({ key, label, color }) => {
          const stageMatches = (matches as any[]).filter((m: any) => m.stage === key);
          if (stageMatches.length === 0) {
            return (
              <section key={key}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${color}`}></div>
                  <h2 className="text-xl font-bold text-gray-900">{label}</h2>
                  <span className="text-xs text-gray-400">待確定</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 border-dashed p-8 text-center">
                  <p className="text-gray-400">淘汰賽對陣將在小組賽結束後產生</p>
                </div>
              </section>
            );
          }

          return (
            <section key={key}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                <h2 className="text-xl font-bold text-gray-900">{label}</h2>
                <span className="text-xs text-gray-400">{stageMatches.length} 場</span>
              </div>
              <LiveMatchesGrid initialMatches={stageMatches} />
            </section>
          );
        })}
      </div>
    </div>
  );
}
