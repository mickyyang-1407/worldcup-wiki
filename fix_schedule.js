const fs = require('fs');
const d = require('./src/data/schedule.json');

// Insert 73 and 74
const match73 = {
  "id": "match-73",
  "number": 73,
  "stage": "round-of-32",
  "status": "upcoming",
  "group": "",
  "date": "2026-06-28",
  "time": "10:00",
  "home": "tbd",
  "away": "tbd",
  "score": { "home": null, "away": null },
  "venue": "SoFi Stadium",
  "city": "Los Angeles"
};

const match74 = {
  "id": "match-74",
  "number": 74,
  "stage": "round-of-32",
  "status": "upcoming",
  "group": "",
  "date": "2026-06-28",
  "time": "13:00",
  "home": "tbd",
  "away": "tbd",
  "score": { "home": null, "away": null },
  "venue": "Lumen Field",
  "city": "Seattle"
};

d.matches.push(match73, match74);

// Sort by number
d.matches.sort((a, b) => a.number - b.number);

// Fix stages
d.matches.forEach(m => {
  if (m.number >= 73 && m.number <= 88) m.stage = 'round-of-32';
  else if (m.number >= 89 && m.number <= 96) m.stage = 'round-of-16';
  else if (m.number >= 97 && m.number <= 100) m.stage = 'quarter-finals';
  else if (m.number >= 101 && m.number <= 102) m.stage = 'semi-finals';
  else if (m.number === 103) m.stage = 'third-place';
  else if (m.number === 104) m.stage = 'final';
});

fs.writeFileSync('./src/data/schedule.json', JSON.stringify(d, null, 2));
