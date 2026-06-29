# World Cup Wiki Update Changelog

This document outlines the modifications made to resolve the 5 development tasks:

## 1. Home Page Layout Adjustments
* **File:** [page.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/app/page.tsx)
* **Action:** Removed the "小組積分" (Group standings preview) section rendering `<HomeStandingsClient />`. This naturally aligned the layout, positioning the `Quick Stats Row` directly above the `News` section.

## 2. Match Time Parse & Display Optimization
* **File:** [MatchCard.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/components/MatchCard.tsx)
* **Action:** Refactored `getMatchDateTime` to robustly parse various match time formats:
  * Full ISO 8601 strings (e.g. `"2026-06-28T19:00:00.000Z"`)
  * Local times with UTC offsets (e.g. `"5:00p.m. UTC-4"`, `"1:00p.m. UTC−6"`)
  * Simple time strings (e.g. `"20:30"`)
  * Implemented a custom Taipei Time formatting helper (`Asia/Taipei`) to output `MM-DD HH:mm`.
  * Implemented standard fallback displaying only the date (`MM-DD`) if no time can be parsed.

## 3. Dynamic Qualified Team Highlighting
* **Files:** [LiveGroupStandings.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/components/LiveGroupStandings.tsx), [GroupStandingsTable.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/components/GroupStandingsTable.tsx)
* **Action:** Imported the schedule matches and calculated the set of `QUALIFIED_TEAMS` dynamically from the home/away teams of matches 73 to 88 (Round of 32). Replaced the static position checks (`pos <= 2`) with checking `QUALIFIED_TEAMS.has(team_id)` to decide highlight status (`bg-amber-50`).

## 4. Schedule Page Verification
* **Files:** [ScheduleListClient.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/components/ScheduleListClient.tsx), [MatchCard.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/components/MatchCard.tsx)
* **Action:** Verified that the default tab is set to `"round-of-32"` in `ScheduleListClient.tsx`. Verified that the winner color border and light background are dynamically resolved and applied to completed 32-team matches in `MatchCard.tsx`.

## 5. Complete 16-Team Knockout Prediction Tree
* **File:** [LiveKnockoutBracket.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/components/LiveKnockoutBracket.tsx)
* **Action:** 
  * Expanded the bracket visualization from 2 columns to a 7-column layout displaying the complete 16-team knockout tree.
  * Implemented recursive resolution of home/away team IDs and confirmed status from the source matches.
  * Implemented recursive predicted winner calculation (defaulting to the home team if scheduled).
  * Refactored `renderTeam` to apply gold styling (`bg-amber-100`) ONLY when `team.isWinner` is true, and faded styling (`opacity-40`) when `team.isLoser` is true.
  * Added a dynamic Champion Banner in the center column indicating the predicted or actual champion of the tournament.
  * Verified that matches 73 to 88 (32強) dates/times and `datetime_utc` align correctly in [schedule.json](file:///Users/mickyyang/Projects/worldcup-wiki/src/data/schedule.json).

---

## Code Review Fixes (June 29th Updates)

### 1. Knockout Match Tie-Breaker (Shootouts)
* **Files:** [route.ts](file:///Users/mickyyang/Projects/worldcup-wiki/src/app/api/espn/route.ts), [LiveKnockoutBracket.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/components/LiveKnockoutBracket.tsx), [MatchCard.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/components/MatchCard.tsx)
* **Action:** 
  * Extracted the `winner` property from ESPN's competitor data inside `route.ts`.
  * Updated winner resolution in `LiveKnockoutBracket.tsx` and `MatchCard.tsx` to check for `winner` override first, before falling back to checking scores `hs` and `as`.

### 2. Case-Insensitive Team Key Matching
* **Files:** [LiveKnockoutBracket.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/components/LiveKnockoutBracket.tsx), [ScheduleListClient.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/components/ScheduleListClient.tsx)
* **Action:** Lowercased all ESPN mapping keys (`${m.home}|${m.away}`) and lookups (`toLowerCase()`) to achieve case-insensitive matching.

### 3. Confirmation Checks on Group Placeholders
* **File:** [LiveKnockoutBracket.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/components/LiveKnockoutBracket.tsx)
* **Action:** Loaded `teams.json` to construct a `VALID_TEAM_IDS` set. Checked `VALID_TEAM_IDS.has(teamId)` to ensure placeholders like `"1A"` or `"Winner Group A"` are not treated as confirmed teams, avoiding broken navigation links.

### 4. Fetch Error Handling
* **Files:** [LiveKnockoutBracket.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/components/LiveKnockoutBracket.tsx), [ScheduleListClient.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/components/ScheduleListClient.tsx), [HomeUpcomingClient.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/components/HomeUpcomingClient.tsx)
* **Action:** Added `if (!r.ok) throw new Error(...)` checks to all fetch operations to guarantee robust HTTP error handling.

### 5. Winner Highlight Stage Limitation
* **File:** [MatchCard.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/components/MatchCard.tsx)
* **Action:** Expanded `winnerColor` styling to apply to all completed knockout matches (`match.stage !== "group" && match.status === "completed"`) rather than restricting it to the `"round-of-32"`.

### 6. Fallback for Unresolved Team Placeholders
* **File:** [MatchCard.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/components/MatchCard.tsx)
* **Action:** Implemented a fallback to display team ID/placeholder text in uppercase if a team ID is not found in `teams`, preventing empty rendering labels.

### 7. Unused Variable Cleanup
* **File:** [LiveGroupStandings.tsx](file:///Users/mickyyang/Projects/worldcup-wiki/src/components/LiveGroupStandings.tsx)
* **Action:** Removed the unused `darkColor` variable.
