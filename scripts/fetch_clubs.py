#!/usr/bin/env python3
"""Fetch club data for players from ESPN overview API.
Uses parallel requests to stay under 5 minutes total.
"""

import json
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

REPO = Path(__file__).parent.parent
PLAYERS_FILE = REPO / "src/data/players.json"

ESPN_TO_LOCAL = {
    "624":"algeria","202":"argentina","628":"australia","474":"austria",
    "459":"belgium","452":"bosnia-and-herzegovina","205":"brazil","206":"canada",
    "2597":"cape-verde","208":"colombia","2850":"dr-congo","477":"croatia",
    "11678":"curacao","450":"czech-republic","209":"ecuador","2620":"egypt",
    "448":"england","478":"france","481":"germany","4469":"ghana","2654":"haiti",
    "469":"iran","4375":"iraq","4789":"ivory-coast","627":"japan","2917":"jordan",
    "203":"mexico","2869":"morocco","449":"netherlands","2666":"new-zealand",
    "464":"norway","2659":"panama","210":"paraguay","482":"portugal","4398":"qatar",
    "655":"saudi-arabia","580":"scotland","654":"senegal","467":"south-africa",
    "451":"south-korea","164":"spain","466":"sweden","475":"switzerland",
    "659":"tunisia","465":"turkey","660":"united-states","212":"uruguay",
    "2570":"uzbekistan",
}
LOCAL_TO_ESPNID = {v: k for k, v in ESPN_TO_LOCAL.items()}


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read())


def get_espn_athlete_id(roster_team_id, player_name):
    """Get ESPN athlete ID from roster."""
    url = f"https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams/{roster_team_id}/roster"
    try:
        roster = fetch(url)
        for a in roster.get("athletes", []):
            if a.get("displayName", "").lower() == player_name.lower():
                return a.get("id")
    except Exception:
        pass
    return None


def get_club_from_overview(athlete_id, national_team_espn_id):
    """Get current club from ESPN athlete overview via team filter."""
    url = f"https://site.web.api.espn.com/apis/common/v3/sports/soccer/fifa.world/athletes/{athlete_id}/overview"
    try:
        d = fetch(url)
        filters = d.get("statistics", {}).get("filters", [])
        for f in filters:
            if f.get("name") == "team":
                options = f.get("options", [])
                # Skip national team, take first club team
                for opt in options:
                    if str(opt.get("value", "")) != str(national_team_espn_id):
                        return opt.get("displayValue", "")
    except Exception:
        pass
    return None


def fetch_player_club(args):
    player_idx, player, espn_team_id = args
    if player.get("club"):
        return player_idx, player["club"]
    # Need ESPN athlete ID - get from roster
    url = f"https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams/{espn_team_id}/roster"
    try:
        roster = fetch(url)
        for a in roster.get("athletes", []):
            if a.get("displayName", "").lower().strip() == player["name"].lower().strip():
                athlete_id = a.get("id")
                if athlete_id:
                    club = get_club_from_overview(athlete_id, espn_team_id)
                    if club:
                        return player_idx, club
    except Exception:
        pass
    return player_idx, ""


def main():
    with open(PLAYERS_FILE) as f:
        data = json.load(f)
    players = data["players"]

    missing_club = [(i, p) for i, p in enumerate(players) if not p.get("club")]
    print(f"Players missing club: {len(missing_club)}/{len(players)}")

    # Cache ESPN rosters to avoid re-fetching
    print("Caching ESPN rosters...")
    espn_rosters = {}  # espn_team_id -> {display_name_lower: athlete_id}
    team_ids_needed = set(LOCAL_TO_ESPNID.get(p["team_id"]) for _, p in missing_club if LOCAL_TO_ESPNID.get(p["team_id"]))

    for espn_id in team_ids_needed:
        try:
            url = f"https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams/{espn_id}/roster"
            roster = fetch(url)
            espn_rosters[espn_id] = {
                a.get("displayName", "").lower().strip(): a.get("id")
                for a in roster.get("athletes", [])
            }
            time.sleep(0.05)
        except Exception as e:
            print(f"  Roster fail {espn_id}: {e}")

    print(f"Cached {len(espn_rosters)} team rosters")

    # Now fetch clubs in parallel using cached athlete IDs
    def fetch_club_with_cache(args):
        idx, player = args
        team_id = player["team_id"]
        espn_team_id = LOCAL_TO_ESPNID.get(team_id)
        if not espn_team_id:
            return idx, ""
        roster = espn_rosters.get(espn_team_id, {})
        athlete_id = roster.get(player["name"].lower().strip())
        if not athlete_id:
            return idx, ""
        club = get_club_from_overview(athlete_id, espn_team_id)
        return idx, club or ""

    print(f"Fetching clubs for {len(missing_club)} players (parallel, 15 workers)...")
    updated = 0
    with ThreadPoolExecutor(max_workers=15) as executor:
        futures = {executor.submit(fetch_club_with_cache, (i, p)): (i, p) for i, p in missing_club}
        done = 0
        for future in as_completed(futures):
            try:
                idx, club = future.result()
                if club:
                    players[idx]["club"] = club
                    updated += 1
            except Exception:
                pass
            done += 1
            if done % 100 == 0:
                print(f"  Progress: {done}/{len(missing_club)}")

    print(f"\nUpdated clubs: {updated}/{len(missing_club)}")

    with open(PLAYERS_FILE, "w", encoding="utf-8") as f:
        json.dump({"players": players}, f, ensure_ascii=False, indent=2)
    print("Saved players.json")

    still_missing = sum(1 for p in players if not p.get("club"))
    print(f"Still missing clubs: {still_missing}/{len(players)}")


if __name__ == "__main__":
    main()
