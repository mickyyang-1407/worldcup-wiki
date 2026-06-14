/**
 * Mapping from team slug/ID to ISO 3166-1 alpha-2 country code
 * for use with flag-icons CSS classes (fi fi-{code} fis).
 */
export const TEAM_FLAGS: Record<string, string> = {
  "mexico": "mx",
  "south-korea": "kr",
  "czech-republic": "cz",
  "south-africa": "za",
  "canada": "ca",
  "bosnia-and-herzegovina": "ba",
  "qatar": "qa",
  "switzerland": "ch",
  "brazil": "br",
  "morocco": "ma",
  "haiti": "ht",
  "scotland": "gb-sct",
  "united-states": "us",
  "paraguay": "py",
  "australia": "au",
  "turkey": "tr",
  "germany": "de",
  "curacao": "cw",
  "ivory-coast": "ci",
  "ecuador": "ec",
  "netherlands": "nl",
  "japan": "jp",
  "sweden": "se",
  "tunisia": "tn",
  "belgium": "be",
  "egypt": "eg",
  "iran": "ir",
  "new-zealand": "nz",
  "spain": "es",
  "cape-verde": "cv",
  "saudi-arabia": "sa",
  "uruguay": "uy",
  "france": "fr",
  "senegal": "sn",
  "iraq": "iq",
  "norway": "no",
  "argentina": "ar",
  "algeria": "dz",
  "austria": "at",
  "jordan": "jo",
  "portugal": "pt",
  "dr-congo": "cd",
  "uzbekistan": "uz",
  "colombia": "co",
  "england": "gb-eng",
  "croatia": "hr",
  "ghana": "gh",
  "panama": "pa",
};

export function getFlagClass(teamId: string): string {
  const code = TEAM_FLAGS[teamId];
  if (!code) return "";
  return `fi fi-${code} fis`;
}
