#!/usr/bin/env python3
"""Fetch real 2026 World Cup squads from ESPN and update players.json.
Keeps existing Chinese names and club data where player names match.
"""

import json
import time
import urllib.request
from pathlib import Path

REPO = Path(__file__).parent.parent
PLAYERS_FILE = REPO / "src/data/players.json"

# ESPN team ID → local team ID
ESPN_TO_LOCAL = {
    "624":   "algeria",
    "202":   "argentina",
    "628":   "australia",
    "474":   "austria",
    "459":   "belgium",
    "452":   "bosnia-and-herzegovina",
    "205":   "brazil",
    "206":   "canada",
    "2597":  "cape-verde",
    "208":   "colombia",
    "2850":  "dr-congo",
    "477":   "croatia",
    "11678": "curacao",
    "450":   "czech-republic",
    "209":   "ecuador",
    "2620":  "egypt",
    "448":   "england",
    "478":   "france",
    "481":   "germany",
    "4469":  "ghana",
    "2654":  "haiti",
    "469":   "iran",
    "4375":  "iraq",
    "4789":  "ivory-coast",
    "627":   "japan",
    "2917":  "jordan",
    "203":   "mexico",
    "2869":  "morocco",
    "449":   "netherlands",
    "2666":  "new-zealand",
    "464":   "norway",
    "2659":  "panama",
    "210":   "paraguay",
    "482":   "portugal",
    "4398":  "qatar",
    "655":   "saudi-arabia",
    "580":   "scotland",
    "654":   "senegal",
    "467":   "south-africa",
    "451":   "south-korea",
    "164":   "spain",
    "466":   "sweden",
    "475":   "switzerland",
    "659":   "tunisia",
    "465":   "turkey",
    "660":   "united-states",
    "212":   "uruguay",
    "2570":  "uzbekistan",
}

POS_MAP = {"G": "GK", "D": "DF", "M": "MF", "F": "FW"}


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())


def load_existing():
    """Build lookup: (team_id, normalized_name) → player dict."""
    with open(PLAYERS_FILE) as f:
        data = json.load(f)
    lookup = {}
    for p in data["players"]:
        key = (p["team_id"], p["name"].lower().strip())
        lookup[key] = p
    return lookup


def normalize_name(name):
    return name.lower().strip()


def main():
    print("Loading existing player data...")
    existing = load_existing()
    print(f"  {len(existing)} existing players indexed")

    # Get all ESPN team IDs
    print("Fetching ESPN team list...")
    teams_data = fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams")
    espn_teams = teams_data["sports"][0]["leagues"][0]["teams"]
    print(f"  {len(espn_teams)} teams found")

    all_players = []
    failed_teams = []

    for team_obj in espn_teams:
        team = team_obj["team"]
        espn_id = team["id"]
        local_id = ESPN_TO_LOCAL.get(str(espn_id))
        if not local_id:
            print(f"  SKIP unknown team: {team['displayName']} (id={espn_id})")
            continue

        url = f"https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams/{espn_id}/roster"
        try:
            roster = fetch(url)
            athletes = roster.get("athletes", [])
        except Exception as e:
            print(f"  FAIL {local_id}: {e}")
            failed_teams.append(local_id)
            continue

        team_players = []
        for a in athletes:
            name = a.get("displayName") or a.get("fullName") or ""
            if not name:
                continue

            pos_abbr = a.get("position", {}).get("abbreviation", "M")
            pos = POS_MAP.get(pos_abbr, "MF")
            jersey = int(a.get("jersey") or 0)
            age = a.get("age") or 0
            slug = a.get("slug") or name.lower().replace(" ", "-")
            player_id = f"{local_id}-{slug}"

            # Height: ESPN gives inches as float
            height_in = a.get("height")
            height_cm = round(height_in * 2.54) if height_in else None

            # Birthplace
            bp = a.get("birthPlace") or {}
            birthplace = ", ".join(filter(None, [bp.get("city"), bp.get("country")])) or ""

            # Match to existing data by (team_id, name)
            key = (local_id, normalize_name(name))
            existing_p = existing.get(key)

            player = {
                "id": player_id,
                "name": name,
                "name_zh": existing_p["name_zh"] if existing_p and existing_p.get("name_zh") else name,
                "team_id": local_id,
                "position": pos,
                "age": age,
                "jersey_number": jersey,
                "height_cm": height_cm,
                "birthplace": birthplace or (existing_p.get("birthplace") if existing_p else ""),
                "club": existing_p["club"] if existing_p and existing_p.get("club") else "",
                "national_caps": existing_p["national_caps"] if existing_p and isinstance(existing_p.get("national_caps"), (int, float)) else 0,
                "national_goals": existing_p["national_goals"] if existing_p and isinstance(existing_p.get("national_goals"), (int, float)) else 0,
            }
            team_players.append(player)

        team_players.sort(key=lambda p: (p["position"], p["jersey_number"]))
        all_players.extend(team_players)
        print(f"  OK  {local_id}: {len(team_players)} players")
        time.sleep(0.1)  # be polite

    print(f"\nTotal players: {len(all_players)}")
    if failed_teams:
        print(f"Failed teams: {failed_teams}")

    # Write output
    with open(PLAYERS_FILE, "w", encoding="utf-8") as f:
        json.dump({"players": all_players}, f, ensure_ascii=False, indent=2)
    print(f"Written to {PLAYERS_FILE}")

    # Stats
    matched = sum(1 for p in all_players if p["name_zh"] != p["name"])
    print(f"Players with Chinese names: {matched}/{len(all_players)}")
    no_club = sum(1 for p in all_players if not p["club"])
    print(f"Players missing club: {no_club}/{len(all_players)}")


if __name__ == "__main__":
    main()
