import Link from "next/link";
import LiveGroupStandings from "@/components/LiveGroupStandings";
import MatchCard from "@/components/MatchCard";
import { groups } from "@/data/groups";
import { matches } from "@/data/schedule";

const groupIds = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export function generateStaticParams() {
  return groupIds.map((g) => ({ group: g }));
}

export default async function GroupDetailPage({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params;
  const groupId = group.toUpperCase();
  const groupData = (groups as any[]).find((g: any) => g.id === groupId);

  if (!groupData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">找不到此小組</h1>
        <Link href="/groups" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">← 返回小組列表</Link>
      </div>
    );
  }

  const groupMatches = (matches as any[]).filter(
    (m: any) => m.stage === "group" && m.group === groupId
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/groups" className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block">← 所有小組</Link>
        <h1 className="text-3xl font-bold text-gray-900">第 {groupId} 組</h1>
      </div>

      <div className="mb-8">
        <LiveGroupStandings groupId={groupId} compact isLink={false} />
      </div>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">小組賽程</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {groupMatches.map((m: any) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </section>
    </div>
  );
}
