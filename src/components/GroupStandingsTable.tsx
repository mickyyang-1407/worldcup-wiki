import { groups } from "@/data/groups";
import TeamBadge from "./TeamBadge";


/* FIFA 2026 brand colors extracted from official brand image */
const GROUP_COLORS: Record<string, { bg: string; text: string; hex: string }> = {
  A: { bg: "linear-gradient(135deg, #a4c44d 0%, #8fb33e 100%)", text: "#a4c44d", hex: "#a4c44d" },
  B: { bg: "linear-gradient(135deg, #b1301f 0%, #8f2618 100%)", text: "#b1301f", hex: "#b1301f" },
  C: { bg: "linear-gradient(135deg, #2d47cb 0%, #2339a8 100%)", text: "#2d47cb", hex: "#2d47cb" },
  D: { bg: "linear-gradient(135deg, #907ad6 0%, #7560be 100%)", text: "#907ad6", hex: "#907ad6" },
  E: { bg: "linear-gradient(135deg, #5b2227 0%, #3d1619 100%)", text: "#5b2227", hex: "#5b2227" },
  F: { bg: "linear-gradient(135deg, #1c433a 0%, #122d27 100%)", text: "#1c433a", hex: "#1c433a" },
  G: { bg: "linear-gradient(135deg, #4b1cc3 0%, #3a15a0 100%)", text: "#4b1cc3", hex: "#4b1cc3" },
  H: { bg: "linear-gradient(135deg, #7cd4c2 0%, #5cbfaa 100%)", text: "#7cd4c2", hex: "#7cd4c2" },
  I: { bg: "linear-gradient(135deg, #9d6d7b 0%, #805763 100%)", text: "#9d6d7b", hex: "#9d6d7b" },
  J: { bg: "linear-gradient(135deg, #98783d 0%, #7a6030 100%)", text: "#98783d", hex: "#98783d" },
  K: { bg: "linear-gradient(135deg, #c64524 0%, #a5381d 100%)", text: "#c64524", hex: "#c64524" },
  L: { bg: "linear-gradient(135deg, #7c2926 0%, #5e1e1c 100%)", text: "#7c2926", hex: "#7c2926" },
};

function getGroupLetter(name: string): string {
  // Group name like "A組" or "Group A" — extract the actual group letter
  const match = name.match(/([A-L])(?:組|$)/);
  return match ? match[1] : "A";
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
          <div className="px-4 py-3" style={{ background: GROUP_COLORS[getGroupLetter(group.name)]?.bg || "linear-gradient(135deg, #2d47cb 0%, #2339a8 100%)" }}>
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
