import { matches } from "@/data/schedule";
import { groups } from "@/data/groups";
import ScheduleListClient from "@/components/ScheduleListClient";

export default function SchedulePage() {
  return <ScheduleListClient matches={matches as any[]} groups={groups as any[]} />;
}
