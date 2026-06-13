import { matches } from "@/data/schedule";
import TodayClient from "@/components/TodayClient";

export default function TodayPage() {
  return <TodayClient matches={matches as any[]} />;
}
