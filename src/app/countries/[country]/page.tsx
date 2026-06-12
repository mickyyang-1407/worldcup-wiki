import Link from "next/link";
import { countries } from "@/data/countries";
import { teams } from "@/data/teams";
import TeamBadge from "@/components/TeamBadge";

const countryFlags: Record<string, string> = {
  mexico: "🇲🇽", "south-korea": "🇰🇷", "czech-republic": "🇨🇿", "south-africa": "🇿🇦",
  canada: "🇨🇦", brazil: "🇧🇷", "united-states": "🇺🇸", germany: "🇩🇪",
  netherlands: "🇳🇱", japan: "🇯🇵", france: "🇫🇷", argentina: "🇦🇷",
  portugal: "🇵🇹", england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", spain: "🇪🇸", belgium: "🇧🇪",
  morocco: "🇲🇦", haiti: "🇭🇹", scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", paraguay: "🇵🇾",
  australia: "🇦🇺", turkey: "🇹🇷", curacao: "🇨🇼", "ivory-coast": "🇨🇮",
  ecuador: "🇪🇨", sweden: "🇸🇪", tunisia: "🇹🇳", egypt: "🇪🇬",
  iran: "🇮🇷", "new-zealand": "🇳🇿", "cape-verde": "🇨🇻", "saudi-arabia": "🇸🇦",
  uruguay: "🇺🇾", senegal: "🇸🇳", iraq: "🇮🇶", norway: "🇳🇴",
  algeria: "🇩🇿", austria: "🇦🇹", jordan: "🇯🇴", "dr-congo": "🇨🇩",
  uzbekistan: "🇺🇿", colombia: "🇨🇴", croatia: "🇭🇷", ghana: "🇬🇭",
  panama: "🇵🇦", "bosnia-and-herzegovina": "🇧🇦", qatar: "🇶🇦", switzerland: "🇨🇭",
};

export function generateStaticParams() {
  return (countries as any[]).map((c: any) => ({ country: c.id }));
}

const continentLabels: Record<string, string> = {
  Asia: "亞洲", Africa: "非洲", Europe: "歐洲",
  "North America": "北美洲", "South America": "南美洲", Oceania: "大洋洲",
};

export default async function CountryDetailPage({ params }: { params: Promise<{ country: string }> }) {
  const { country: countryId } = await params;
  const country = (countries as any[]).find((c: any) => c.id === countryId);
  if (!country) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">找不到此國家</h1>
        <Link href="/countries" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">← 返回國家列表</Link>
      </div>
    );
  }

  const countryTeams = (teams as any[]).filter((t: any) => country.teams.includes(t.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/countries" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">← 所有國家</Link>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{countryFlags[country.id] || ""} {country.name_zh}</h1>
            <p className="text-gray-500">{country.name}</p>
          </div>
          <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
            {continentLabels[country.continent] || country.continent}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-500">FIFA 會員</div>
            <div className="font-semibold text-gray-800">{country.fifa_member_since}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-500">世界盃參賽</div>
            <div className="font-semibold text-gray-800">{country.wc_appearances} 次</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-500">最佳成績</div>
            <div className="font-semibold text-gray-800">{country.best_result}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-500">參賽隊伍</div>
            <div className="font-semibold text-gray-800">{country.total_teams} 隊</div>
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">參賽隊伍</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {countryTeams.map((team: any) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <TeamBadge teamId={team.id} size="md" />
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>FIFA 排名</span>
                  <span className="font-semibold text-gray-700">#{team.fifa_ranking}</span>
                </div>
                <div className="flex justify-between">
                  <span>小組</span>
                  <span className="font-semibold text-gray-700">{team.group}組</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
