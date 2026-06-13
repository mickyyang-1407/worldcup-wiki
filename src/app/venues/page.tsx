import { venues } from "@/data/venues";
import VenuesListClient from "@/components/VenuesListClient";

export default function VenuesPage() {
  return <VenuesListClient venues={venues as any[]} />;
}
