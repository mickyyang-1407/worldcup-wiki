import Link from "next/link";
import { players } from "@/data/players";
import { teams } from "@/data/teams";
import TeamBadge from "@/components/TeamBadge";

export function generateStaticParams() {
  return (players as any[]).map((p: any) => ({ player: p.id }));
}

const posLabels: Record<string, string> = {
  GK: "守門員", DF: "後衛", MF: "中場", FW: "前鋒",
};

const posColors: Record<string, string> = {
  GK: "bg-yellow-100 text-yellow-700",
  DF: "bg-blue-100 text-blue-700",
  MF: "bg-green-100 text-green-700",
  FW: "bg-red-100 text-red-700",
};

export default async function PlayerDetailPage({ params }: { params: Promise<{ player: string }> }) {
  const { player: playerId } = await params;
  const player = (players as any[]).find((p: any) => p.id === playerId);
  if (!player) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">找不到此球員</h1>
        <Link href="/players" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">← 返回球員列表</Link>
      </div>
    );
  }

  const team = (teams as any[]).find((t: any) => t.id === player.team_id);

  const details = [
    { label: "英文名", value: player.name },
    { label: "背號", value: `#${player.jersey_number}` },
    { label: "位置", value: posLabels[player.position] || player.position, badge: true },
    { label: "年齡", value: `${player.age} 歲` },
    { label: "出生地", value: player.birthplace },
    { label: "身高", value: `${player.height_cm} cm` },
    { label: "所屬球會", value: player.club },
    { label: "國家隊出場", value: `${player.national_caps} 次` },
    { label: "國家隊進球", value: `${player.national_goals} 球` },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/players" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">← 所有球員</Link>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {player.jersey_number}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{player.name_zh}</h1>
            <p className="text-gray-500">{player.name}</p>
            {team && (
              <div className="mt-1">
                <TeamBadge teamId={team.id} size="sm" />
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {details.map((d) => (
            <div key={d.label} className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">{d.label}</div>
              {d.badge ? (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${posColors[player.position] || "bg-gray-100 text-gray-700"}`}>
                  {d.value}
                </span>
              ) : (
                <div className="font-medium text-gray-800 text-sm">{d.value}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
