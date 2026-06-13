import { players } from "@/data/players";
import { teams } from "@/data/teams";
import PlayersListClient from "@/components/PlayersListClient";

export default function PlayersPage() {
  return <PlayersListClient players={players as any[]} teams={teams as any[]} />;
}
