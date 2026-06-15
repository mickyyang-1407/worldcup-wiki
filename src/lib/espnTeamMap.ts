export const ESPN_TEAM_MAP: Record<string, string> = {
  "Mexico": "mexico",
  "Czechia": "czech-republic",
  "South Korea": "south-korea",
  "South Africa": "south-africa",
  "Canada": "canada",
  "Bosnia-Herzegovina": "bosnia-and-herzegovina",
  "Switzerland": "switzerland",
  "Qatar": "qatar",
  "Brazil": "brazil",
  "Scotland": "scotland",
  "Haiti": "haiti",
  "Morocco": "morocco",
  "Paraguay": "paraguay",
  "Türkiye": "turkey",
  "Australia": "australia",
  "United States": "united-states",
  "Ecuador": "ecuador",
  "Germany": "germany",
  "Ivory Coast": "ivory-coast",
  "Curaçao": "curacao",
  "Netherlands": "netherlands",
  "Sweden": "sweden",
  "Japan": "japan",
  "Tunisia": "tunisia",
  "Belgium": "belgium",
  "Iran": "iran",
  "Egypt": "egypt",
  "New Zealand": "new-zealand",
  "Spain": "spain",
  "Uruguay": "uruguay",
  "Saudi Arabia": "saudi-arabia",
  "Cape Verde": "cape-verde",
  "Norway": "norway",
  "France": "france",
  "Senegal": "senegal",
  "Iraq": "iraq",
  "Argentina": "argentina",
  "Austria": "austria",
  "Algeria": "algeria",
  "Jordan": "jordan",
  "Colombia": "colombia",
  "Portugal": "portugal",
  "Uzbekistan": "uzbekistan",
  "Congo DR": "dr-congo",
  "England": "england",
  "Croatia": "croatia",
  "Panama": "panama",
  "Ghana": "ghana",
};

export function espnNameToSlug(name: string): string {
  return ESPN_TEAM_MAP[name] || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function espnStatusToLocal(status: string): string {
  if (status === "STATUS_FULL_TIME" || status === "STATUS_FINAL") return "completed";
  if (status === "STATUS_IN_PROGRESS" || status === "STATUS_HALFTIME") return "live";
  return "scheduled";
}
