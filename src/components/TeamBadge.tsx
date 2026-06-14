"use client";

import Link from "next/link";
import { teams } from "@/data/teams";

// ISO 3166-1 alpha-2 codes for flag emoji conversion
const isoCodes: Record<string, string> = {
  mexico: "MX", "south-korea": "KR", "czech-republic": "CZ", "south-africa": "ZA",
  canada: "CA", brazil: "BR", "united-states": "US", germany: "DE",
  netherlands: "NL", japan: "JP", france: "FR", argentina: "AR",
  portugal: "PT", england: "GB-ENG", spain: "ES", belgium: "BE",
  morocco: "MA", haiti: "HT", scotland: "GB-SCT", paraguay: "PY",
  australia: "AU", turkey: "TR", curacao: "CW", "ivory-coast": "CI",
  ecuador: "EC", sweden: "SE", tunisia: "TN", egypt: "EG",
  iran: "IR", "new-zealand": "NZ", "cape-verde": "CV", "saudi-arabia": "SA",
  uruguay: "UY", senegal: "SN", iraq: "IQ", norway: "NO",
  algeria: "DZ", austria: "AT", jordan: "JO", "dr-congo": "CD",
  uzbekistan: "UZ", colombia: "CO", croatia: "HR", ghana: "GH",
  panama: "PA", "bosnia-and-herzegovina": "BA", qatar: "QA", switzerland: "CH",
};

// Subdivision flag emojis (England, Scotland)
const subdivisionFlags: Record<string, string> = {
  "GB-ENG": "\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F",
  "GB-SCT": "\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74\uDB40\uDC7F",
};

function getFlagEmoji(code: string): string {
  // Subdivision flags (England, Scotland)
  if (code.startsWith("GB-")) {
    return subdivisionFlags[code] || "🏴";
  }
  // Standard country flags from ISO alpha-2
  return code
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
}

const teamColors: Record<string, string> = {
  mexico: "#006847", brazil: "#009739", argentina: "#75AADB", france: "#002395",
  germany: "#000000", netherlands: "#FF6600", spain: "#C60B1E", england: "#CF081F",
  portugal: "#006600", belgium: "#000000", croatia: "#C8102E", uruguay: "#003DA5",
  colombia: "#FCD116", japan: "#0000FF", "south-korea": "#C60C30", morocco: "#C1272D",
  switzerland: "#FF0000", "united-states": "#002868", canada: "#FF0000",
  senegal: "#00853F", ghana: "#CE1126", norway: "#BA0C2F", egypt: "#C8102E",
  iran: "#239F40", "saudi-arabia": "#006C35", sweden: "#FEFF00", tunisia: "#E70013",
  turkey: "#E30A17", australia: "#FFD700", paraguay: "#C8102E", ecuador: "#FFD100",
};

interface TeamBadgeProps {
  teamId: string;
  showName?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  linkable?: boolean;
}

export default function TeamBadge({ teamId, showName = true, size = "sm", linkable = true }: TeamBadgeProps) {
  const team = teams.find((t: any) => t.id === teamId);
  if (!team) return <span className="text-gray-400">{teamId}</span>;

  const sizeMap = { sm: 20, md: 28, lg: 40, xl: 36 };
  const px = sizeMap[size];
  const bgColor = teamColors[teamId] || "#666";

  const content = (
    <div className="flex items-center gap-1.5">
      <span
        className="rounded-full inline-flex items-center justify-center overflow-hidden shrink-0"
        style={{ width: px, height: px, backgroundColor: bgColor }}
        title={team.name}
      >
        <img
          src={`/flags/${teamId}.png`}
          alt={team.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to emoji if flag image not available
            const isoCode = isoCodes[teamId] || "??";
            const flag = getFlagEmoji(isoCode);
            (e.target as HTMLElement).style.display = 'none';
            (e.target as HTMLElement).parentElement!.textContent = flag;
          }}
        />
      </span>
      {showName && <span className="text-sm font-medium text-gray-800">{team.name_zh}</span>}
    </div>
  );

  if (linkable) return <Link href={`/teams/${team.id}`}>{content}</Link>;
  return content;
}
