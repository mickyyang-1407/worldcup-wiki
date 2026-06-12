import json
from collections import Counter

data = json.load(open('src/data/players.json'))
players = data['players']

for t in sorted(set(p['team_id'] for p in players)):
    ps = [p for p in players if p['team_id'] == t]
    pos = Counter(p['position'] for p in ps)
    print(f'{t}: {len(ps)}人 (GK:{pos["GK"]} DF:{pos["DF"]} MF:{pos["MF"]} FW:{pos["FW"]})')
