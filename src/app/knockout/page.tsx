import MatchCard from "@/components/MatchCard";
import { matches } from "@/data/schedule";
import PageHero from "@/components/PageHero";

const stageOrder = [
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
        gradient="linear-gradient(135deg, #907ad6 0%, #af3525 100%)"
        title="淘汰賽"
        subtitle="16 強 → 8 強 → 準決賽 → 決賽"
        tag="Knockout"
        icon="🏆"
      />

      <div className="space-y-8">
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
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stageMatches.map((m: any) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
