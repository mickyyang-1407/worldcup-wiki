import Link from "next/link";
import { teams } from "@/data/teams";

const flagEmojis: Record<string, string> = {
  mexico: "MX", "south-korea": "KR", "czech-republic": "CZ", "south-africa": "ZA",
  canada: "CA", brazil: "BR", "united-states": "US", germany: "DE",
  netherlands: "NL", japan: "JP", france: "FR", argentina: "AR",
  portugal: "PT", england: "EN", spain: "ES", belgium: "BE",
  morocco: "MA", haiti: "HT", scotland: "SC", paraguay: "PY",
  australia: "AU", turkey: "TR", curacao: "CW", "ivory-coast": "CI",
  ecuador: "EC", sweden: "SE", tunisia: "TN", egypt: "EG",
  iran: "IR", "new-zealand": "NZ", "cape-verde": "CV", "saudi-arabia": "SA",
  uruguay: "UY", senegal: "SN", iraq: "IQ", norway: "NO",
  algeria: "DZ", austria: "AT", jordan: "JO", "dr-congo": "CD",
  uzbekistan: "UZ", colombia: "CO", croatia: "HR", ghana: "GH",
  panama: "PA", "bosnia-and-herzegovina": "BA", qatar: "QA", switzerland: "CH",
};

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
  size?: "sm" | "md" | "lg";
  linkable?: boolean;
}

export default function TeamBadge({ teamId, showName = true, size = "sm", linkable = true }: TeamBadgeProps) {
  const team = teams.find((t: any) => t.id === teamId);
  if (!team) return <span className="text-gray-400">{teamId}</span>;

  const sizeClasses = size === "sm" ? "w-5 h-5 text-[8px]" : size === "md" ? "w-7 h-7 text-[10px]" : "w-10 h-10 text-xs";
  const flag = flagEmojis[teamId] || "??";
  const bgColor = teamColors[teamId] || "#666";

  const content = (
    <div className="flex items-center gap-1.5">
      <span
        className={`${sizeClasses} rounded-full flex items-center justify-center text-white font-bold`}
        style={{ backgroundColor: bgColor }}
        title={team.name}
      >
        {flag}
      </span>
      {showName && <span className="text-sm font-medium text-gray-800">{team.name_zh}</span>}
    </div>
  );

  if (linkable) return <Link href={`/teams/${team.id}`}>{content}</Link>;
  return content;
}
