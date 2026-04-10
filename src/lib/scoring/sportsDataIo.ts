import type { FieldPlayer, NormalizedPlayer } from '@/types/scoring';

interface ScoringProvider {
  readonly name: string;
  fetchLeaderboard(id: string): Promise<NormalizedPlayer[]>;
  fetchField(id: string): Promise<FieldPlayer[]>;
}
import { parsePosition, parseToPar, mapStatus, parseThru, parseRoundScore } from './normalize';

// SportsDataIO Golf API adapter
// Endpoints used:
//   /scores/json/Leaderboard/{tournamentId}
//   /scores/json/PlayerTournamentProjectionStats/{tournamentId}  (field/projections)

const BASE = 'https://api.sportsdata.io/golf/v2';

export class SportsDataIOProvider implements ScoringProvider {
  readonly name = 'sportsDataIo';
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_SPORTSDATA_API_KEY ?? '';
  }

  async fetchLeaderboard(providerTournamentId: string): Promise<NormalizedPlayer[]> {
    const url = `${BASE}/scores/json/Leaderboard/${providerTournamentId}?key=${this.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`SportsDataIO leaderboard error: ${res.status}`);
    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const players: any[] = data?.Players ?? data ?? [];
    return players.map(p => ({
      playerId: String(p.PlayerTournamentID ?? p.PlayerID ?? ''),
      playerName: p.Name ?? [p.FirstName, p.LastName].filter(Boolean).join(' ') ?? '',
      position: parsePosition(p.Rank ?? p.Position),
      totalToPar: parseToPar(p.TotalScore ?? p.TotalToPar),
      todaysScore: parseRoundScore(p.TodayScore ?? p.ScoreRound),
      thru: parseThru(p.TotalThrough ?? p.Thru),
      roundScores: [
        parseRoundScore(p.Round1Score),
        parseRoundScore(p.Round2Score),
        parseRoundScore(p.Round3Score),
        parseRoundScore(p.Round4Score),
      ],
      status: mapStatus(p.PlayerStatus ?? p.Status),
      totalStrokes: typeof p.TotalStrokes === 'number' ? p.TotalStrokes : null,
      officialFinishPosition:
        (p.PlayerStatus === 'Complete' || p.Status === 'Complete')
          ? (parseInt(String(p.Rank ?? p.Position), 10) || null)
          : null,
    }));
  }

  async fetchField(providerTournamentId: string): Promise<FieldPlayer[]> {
    const url = `${BASE}/scores/json/Players/${providerTournamentId}?key=${this.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`SportsDataIO field error: ${res.status}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const players: any[] = await res.json();
    return players.map(p => ({
      playerId: String(p.PlayerID ?? ''),
      playerName: p.Name ?? [p.FirstName, p.LastName].filter(Boolean).join(' ') ?? '',
      countryCode: p.Country ?? '',
      worldRanking: typeof p.WorldGolfRanking === 'number' ? p.WorldGolfRanking : undefined,
    }));
  }
}
