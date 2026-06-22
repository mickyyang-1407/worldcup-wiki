import type { GroupData, StandingEntry } from './predictionTypes';

export type QualificationStatus = 'qualified' | 'eliminated' | 'contending';

export const CONFIRMED_QUALIFIED_TEAMS = new Set([
  'mexico',
  'united-states',
  'germany',
]);

function compareStandings(a: StandingEntry, b: StandingEntry) {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return a.team_name.localeCompare(b.team_name);
}

function sortedGroup(group: GroupData) {
  return [...group.standings].sort(compareStandings);
}

function getEighthBestCompletedThird(groups: GroupData[]) {
  const completedThirds = groups
    .filter((group) => group.standings.length >= 4 && group.standings.every((team) => team.played >= 3))
    .map((group) => sortedGroup(group)[2])
    .filter(Boolean)
    .sort(compareStandings);

  return completedThirds.length >= 8 ? completedThirds[7] : null;
}

export function getQualificationStatus(
  teamId: string,
  groupId: string,
  groups: GroupData[]
): QualificationStatus {
  if (CONFIRMED_QUALIFIED_TEAMS.has(teamId)) return 'qualified';

  const group = groups.find((g) => g.id === groupId);
  if (!group || group.standings.length < 4) return 'contending';

  const sorted = sortedGroup(group);
  const standing = sorted.find((team) => team.team_id === teamId);
  if (!standing) return 'contending';

  const groupRank = sorted.findIndex((team) => team.team_id === teamId) + 1;
  const groupComplete = sorted.every((team) => team.played >= 3);

  if (groupComplete) {
    if (groupRank <= 2) return 'qualified';
    if (groupRank === 4) return 'eliminated';

    const eighthBestThird = getEighthBestCompletedThird(groups);
    if (eighthBestThird && compareStandings(eighthBestThird, standing) < 0) {
      return 'eliminated';
    }

    return 'contending';
  }

  const gamesLeft = Math.max(0, 3 - standing.played);
  const maxPossiblePts = standing.pts + gamesLeft * 3;
  const secondPlacePts = sorted[1]?.pts ?? 0;
  const eighthBestThird = getEighthBestCompletedThird(groups);

  if (maxPossiblePts < secondPlacePts && eighthBestThird && compareStandings(eighthBestThird, {
    ...standing,
    pts: maxPossiblePts,
  }) < 0) {
    return 'eliminated';
  }

  return 'contending';
}
