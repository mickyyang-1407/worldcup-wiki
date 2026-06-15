import { NextResponse } from "next/server";

import { espnNameToSlug } from "@/lib/espnTeamMap";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const GROUP_LETTER_NAMES: Record<string, string> = {
  "Group A": "A", "Group B": "B", "Group C": "C", "Group D": "D",
  "Group E": "E", "Group F": "F", "Group G": "G", "Group H": "H",
  "Group I": "I", "Group J": "J", "Group K": "K", "Group L": "L",
};

export async function GET() {
  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings",
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("ESPN standings fetch failed");

    const data = await res.json();
    const children: any[] = data.children || [];

    const groups = children.map((child: any) => {
      const groupLetter = GROUP_LETTER_NAMES[child.name] || child.name;
      const entries: any[] = child.standings?.entries || [];

      const standings = entries.map((entry: any) => {
        const teamName = entry.team?.displayName || "";
        const stats = entry.stats || [];
        const getStat = (name: string) =>
          stats.find((s: any) => s.name === name)?.value ?? 0;

        return {
          team_id: espnNameToSlug(teamName),
          team_name: teamName,
          played: getStat("gamesPlayed"),
          won: getStat("wins"),
          drawn: getStat("ties"),
          lost: getStat("losses"),
          gf: getStat("pointsFor"),
          ga: getStat("pointsAgainst"),
          gd: getStat("pointDifferential"),
          pts: getStat("points"),
          rank: getStat("rank"),
        };
      }).sort((a: any, b: any) => a.rank - b.rank);

      return {
        id: groupLetter,
        name: `${groupLetter}組`,
        standings,
      };
    }).sort((a: any, b: any) => a.id.localeCompare(b.id));

    return NextResponse.json({ source: "espn", groups });
  } catch (e) {
    return NextResponse.json({ source: "error", groups: [], error: String(e) }, { status: 500 });
  }
}
