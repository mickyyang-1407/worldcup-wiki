"use client";

import Link from "next/link";
import { teams } from "@/data/teams";
import { getFlagClass } from "@/data/teamFlags";

interface TeamBadgeProps {
  teamId: string;
  showName?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  linkable?: boolean;
}

const sizeStyles: Record<string, string> = {
  sm: "text-base",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-3xl",
};

export default function TeamBadge({ teamId, showName = true, size = "sm", linkable = true }: TeamBadgeProps) {
  const team = teams.find((t: any) => t.id === teamId);
  if (!team) return <span className="text-gray-400">{teamId}</span>;

  const flagClass = getFlagClass(teamId);
  const sizeClass = sizeStyles[size] || "text-base";

  const content = (
    <div className="flex items-center gap-1.5">
      {flagClass ? (
        <span className={`${flagClass} ${sizeClass} rounded-sm`} title={team.name} />
      ) : (
        <span
          className={`inline-flex items-center justify-center rounded-full ${sizeClass}`}
          title={team.name}
        >
          🏳️
        </span>
      )}
      {showName && <span className="text-sm font-medium text-gray-800">{team.name_zh}</span>}
    </div>
  );

  if (linkable) return <Link href={`/teams/${team.id}`}>{content}</Link>;
  return content;
}
