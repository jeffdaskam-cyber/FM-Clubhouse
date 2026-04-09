# Fantasy Golf League App

## What to build
Build a production-ready Progressive Web App for a fantasy golf league focused on golf majors.

Users need to:
- create fantasy teams before each tournament
- select a tournament from a supported majors list
- assign exactly 3 golfers to each team through an admin-managed entry flow
- view a fantasy team scoreboard during live play
- view a full real-world tournament leaderboard

## Product scope for MVP
This is an admin-managed fantasy app, not a full user self-service platform.

For MVP:
- use a simple admin entry page for creating teams
- do not build a true turn-based or snake draft flow
- do not build social features, chat, payments, or push notifications
- optimize for mobile-first usage, but support desktop cleanly

## Supported tournaments
Support these tournaments:
- The Players Championship
- The Masters
- The PGA Championship
- The U.S. Open
- The Open Championship

The tournament selector should determine:
- which player field to show in the team-entry UI
- which live scoring feed to query
- which tournament leaderboard to display

## Core scoring rules
- Each fantasy team has exactly 3 golfers.
- Team score is the sum of each golfer's cumulative score relative to par.
- Lower score is better.
- Scoring is cumulative across the tournament.
- If a golfer withdraws, freeze that golfer's score at the time of withdrawal.
- If a golfer misses the cut, their score stands as recorded when participation ends.
- Team rankings should update whenever leaderboard data refreshes.

## Tiebreaker rules
When two or more fantasy teams finish with the same cumulative score:
1. The team with the single highest-finishing golfer wins the tie.
2. If still tied, compare the next-best finisher.
3. If still tied after comparing all three golfers, the teams remain tied.

Use tournament finishing position from the scoring provider. Normalize positions so comparisons are reliable.

## Required tech stack
- Frontend: React
- Styling: Tailwind CSS
- Backend/BaaS: Firebase Auth + Firestore
- Hosting: Vercel
- Weather: Open-Meteo
- Scoring data: provider abstraction that supports Sportradar or SportsDataIO

Local development is on Windows. Production is Linux/Vercel, so keep file paths and imports case-correct.

## Architecture expectations
Use a clean, modular structure.

Recommended areas:
- app/routes
- components
- features
- hooks
- lib/firebase
- lib/api
- lib/scoring
- utils

Do not scatter API calls through UI components. Put all external data access behind service modules.

## Routes
Implement at least these routes:
- `/` home fantasy scoreboard
- `/leaderboard` full tournament leaderboard
- `/draft` admin team entry page
- `/settings` optional admin/config page
- `/login` only if auth is required for MVP

## UI requirements
### Home page
Show the fantasy team scoreboard.

Each team should clearly display:
- team name
- team total relative to par
- ranking position
- the three rostered golfers
- each golfer's tournament score and status

Also show a detailed table using a standard golf leaderboard feel with columns such as:
- Position
- Player
- Total Score
- Today's Score
- Thru
- R1
- R2
- R3
- R4
- Total

### Full leaderboard page
Show all players in the selected tournament.
The page should resemble a modern golf leaderboard such as ESPN or PGA-style layouts.
Prioritize readability, rank clarity, and responsive design.

### Draft page
This is an admin entry workflow.

Requirements:
- select a tournament from a dropdown
- create between 4 and 6 teams for a league instance
- enter a team name for each team
- pick exactly 3 golfers per team from a searchable dropdown sourced from the tournament field
- prevent the same golfer from being assigned to multiple teams in the same tournament
- provide validation before saving
- allow editing until the league is locked

## Data model expectations
Use Firestore for application data.

At minimum, model these concepts:
- tournaments
- players
- fantasy leagues or league instances
- teams
- cached leaderboard snapshots or scoring cache

Each team record should include:
- tournament reference
- team name
- exactly 3 golfer ids
- computed total score
- computed ranking position

## Scoring provider abstraction
Implement a provider layer so the app is not tightly coupled to one external scoring API.

Create a common normalized shape for leaderboard/player scoring data, including:
- player id
- player name
- position
- total to par
- today's score
- thru
- round scores
- status
- total strokes if available
- official finishing position when tournament is complete

The app should work if the backing provider changes from Sportradar to SportsDataIO.

## Refresh behavior
During active tournaments, refresh live scoring on an interval.
Use a reasonable MVP cadence such as every 60 to 180 seconds.
Cache results when useful to reduce provider calls.

## Auth expectations
For MVP, keep auth minimal.
A simple admin-only workflow is acceptable.
If auth is implemented, use Firebase Auth and protect admin write paths.
Public read access for scoreboard views is acceptable if that simplifies MVP.

## PWA requirements
Ship as a PWA with:
- installable manifest
- service worker setup
- mobile-friendly layout
- fast initial load
- graceful offline fallback for previously loaded views where practical

## Visual direction
Use a golf-adjacent palette:
- greens
- blues
- white
- yellow accents

The UI should feel modern, clean, and slightly premium rather than playful.

## Implementation priorities
Prioritize in this order:
1. tournament selection and normalized scoring provider integration
2. admin team entry flow
3. fantasy score calculation engine
4. fantasy home scoreboard
5. full leaderboard page
6. PWA polish and deployment readiness

## Build quality rules
- Prefer simple, maintainable patterns over heavy abstractions.
- Keep components modular and readable.
- Add clear TypeScript types if the repo uses TypeScript.
- Validate all admin inputs.
- Handle loading, empty, and API error states gracefully.
- Avoid hardcoding tournament-specific logic unless unavoidable.
- Keep comments concise and only where helpful.

## Done criteria for MVP
MVP is complete when:
- an admin can select a supported tournament
- an admin can enter teams with 3 unique golfers each
- the app can ingest live tournament data from a provider abstraction
- the fantasy standings calculate correctly from player scores
- withdrawals and missed cuts freeze correctly
- ties use the specified tiebreaker
- users can view both fantasy standings and the full tournament leaderboard
- the app runs as a deployable PWA on Vercel
