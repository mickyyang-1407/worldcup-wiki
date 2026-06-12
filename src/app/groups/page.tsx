import GroupStandingsTable from "@/components/GroupStandingsTable";

export default function GroupsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">小組積分表</h1>
        <p className="text-gray-500 mt-1">12 組 × 4 隊，各組前兩名晉級 16 強淘汰賽</p>
      </div>
      <GroupStandingsTable />
    </div>
  );
}
