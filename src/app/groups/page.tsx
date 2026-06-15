import LiveGroupStandings from "@/components/LiveGroupStandings";
import PageHero from "@/components/PageHero";

export default function GroupsPage() {
  return (
    <div>
      <PageHero
        gradient="linear-gradient(135deg, #1a2d6e 0%, #a4c44d 100%)"
        title="小組積分表"
        subtitle="12 組 × 4 隊，各組前兩名晉級 16 強 · ESPN 即時同步"
        tag="Groups"
        icon="📋"
      />
      <LiveGroupStandings />
    </div>
  );
}
