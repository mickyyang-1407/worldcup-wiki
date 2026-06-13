import { matches } from "@/data/schedule";
import { teams } from "@/data/teams";
import StatsClient from "@/components/StatsClient";

export default function StatsPage() {
  return <StatsClient matches={matches as any[]} teams={teams as any[]} />;
}
