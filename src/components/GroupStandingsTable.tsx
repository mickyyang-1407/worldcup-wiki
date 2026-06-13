import { groups } from "@/data/groups";
import TeamBadge from "./TeamBadge";


const GROUP_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: "from-red-600 to-red-700", text: "text-red-600" },
  B: { bg: "from-blue-600 to-blue-700", text: "text-blue-600" },
  C: { bg: "from-yellow-500 to-yellow-600", text: "text-yellow-600" },
  D: { bg: "from-green-600 to-green-700", text: "text-green-600" },
  E: { bg: "from-purple-600 to-purple-700", text: "text-purple-600" },
  F: { bg: "from-orange-500 to-orange-600", text: "text-orange-600" },
  G: { bg: "from-pink-500 to-pink-600", text: "text-pink-600" },
  H: { bg: "from-cyan-500 to-cyan-600", text: "text-cyan-600" },
  I: { bg: "from-red-700 to-red-800", text: "text-red-700" },
  J: { bg: "from-blue-800 to-blue-900", text: "text-blue-800" },
  K: { bg: "from-green-700 to-green-800", text: "text-green-700" },
  L: { bg: "from-amber-800 to-amber-900", text: "text-amber-800" },
};

function getGroupLetter(name: string): string {
  // Group name like "A組" or "Group A"
  const match = name.match(/[A-L]/);
  return match ? match[0] : "A";
}
interface StandingsRow {
  pos: number;
  team_id: string;
  pld: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: string;
  pts: number;
}

interface Group {
  id: string;
  name: string;
  teams: string[];
  standings: StandingsRow[];
}

interface GroupStandingsTableProps {
  groupId?: string;
  compact?: boolean;
}

export default function GroupStandingsTable({ groupId, compact = false }: GroupStandingsTableProps) {
  const groupList: Group[] = groupId
    ? (groups as any[]).filter((g) => g.id === groupId)
    : (groups as any[]);

  return (
    <div className={`grid gap-6 ${compact ? "" : "md:grid-cols-2"}`}>
      {groupList.map((group: Group) => (
        <div key={group.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={`bg-gradient-to-r ${GROUP_COLORS[getGroupLetter(group.name)]?.bg || "from-blue-600 to-blue-700"} px-4 py-3`}>
            <h3 className="text-white font-bold text-lg">{group.name}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-3 py-2 text-left text-gray-500 font-medium w-8">#</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">隊伍</th>
                  <th className="px-3 py-2 text-center text-gray-500 font-medium">賽</th>
                  <th className="px-3 py-2 text-center text-gray-500 font-medium">勝</th>
                  <th className="px-3 py-2 text-center text-gray-500 font-medium">和</th>
                  <th className="px-3 py-2 text-center text-gray-500 font-medium">敗</th>
                  <th className="px-3 py-2 text-center text-gray-500 font-medium">進</th>
                  <th className="px-3 py-2 text-center text-gray-500 font-medium">失</th>
                  <th className="px-3 py-2 text-center text-gray-500 font-medium">差</th>
                  <th className="px-3 py-2 text-center text-gray-500 font-medium font-bold">分</th>
                </tr>
              </thead>
              <tbody>
                {group.standings.map((row: StandingsRow) => {
                  const isQualified = row.pos <= 2;
                  return (
                    <tr
                      key={row.team_id}
                      className={`border-b border-gray-50 hover:bg-blue-50/50 transition-colors ${
                        isQualified ? "bg-green-50/30" : ""
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center">
                        {isQualified ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                            {row.pos}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">{row.pos}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <TeamBadge teamId={row.team_id} size="sm" />
                      </td>
                      <td className="px-3 py-2.5 text-center text-gray-700">{row.pld}</td>
                      <td className="px-3 py-2.5 text-center text-gray-700">{row.w}</td>
                      <td className="px-3 py-2.5 text-center text-gray-700">{row.d}</td>
                      <td className="px-3 py-2.5 text-center text-gray-700">{row.l}</td>
                      <td className="px-3 py-2.5 text-center text-gray-700">{row.gf}</td>
                      <td className="px-3 py-2.5 text-center text-gray-700">{row.ga}</td>
                      <td className="px-3 py-2.5 text-center font-mono text-gray-700">{row.gd}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-lg text-gray-900">{row.pts}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 text-xs text-gray-400 bg-gray-50 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded bg-green-100"></span>
            <span>晉級淘汰賽</span>
          </div>
        </div>
      ))}
    </div>
  );
}
