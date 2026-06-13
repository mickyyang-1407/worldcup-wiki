import { teams } from "@/data/teams";
import TeamsListClient from "@/components/TeamsListClient";

export default function TeamsPage() {
  return <TeamsListClient teams={teams as any[]} />;
}
