import { matches } from "@/data/schedule";
import { getMatchIdsWithHighlights } from "@/lib/highlights";
import HighlightsListClient from "@/components/HighlightsListClient";

export default function HighlightsPage() {
  const highlightedMatchIds = new Set(getMatchIdsWithHighlights());
  return (
    <HighlightsListClient
      matches={matches as any[]}
      highlightedMatchIds={highlightedMatchIds}
    />
  );
}
