import type { FieldPlayer, NormalizedPlayer } from '@/types/scoring';

interface ScoringProvider {
  readonly name: string;
  fetchLeaderboard(id: string): Promise<NormalizedPlayer[]>;
  fetchField(id: string): Promise<FieldPlayer[]>;
}
import { parsePosition, parseToPar, mapStatus, parseThru, parseRoundScore } from './normalize';

// Sportradar Golf API v3 adapter
// Base URL: https://api.sportradar.us/golf/trial/v3/en/
// Endpoints used:
//   /tournaments/{id}/leaderboard.json
//   /tournaments/{id}/summary.json  (field)

const BASE = 'https://api.sportradar.us/golf/trial/v3/en';

export class SportradarProvider implements ScoringProvider {
  readonly name = 'sportradar';
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_SPORTRADAR_API_KEY ?? '';
  }

  async fetchLeaderboard(providerTournamentId: string): Promise<NormalizedPlayer[]> {
    const url = `${BASE}/tournaments/${providerTournamentId}/leaderboard.json?api_key=${this.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sportradar leaderboard error: ${res.status}`);
    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const players: any[] = data?.leaderboard?.players ?? [];
    return players.map(p => ({
      playerId: p.id ?? p.player_id ?? '',
      playerName: [p.first_name, p.last_name].filter(Boolean).join(' ') || p.name || '',
      position: parsePosition(p.position),
      totalToPar: parseToPar(p.score_to_par ?? p.total_to_par),
      todaysScore: parseRoundScore(p.round_score ?? p.today_score),
      thru: parseThru(p.thru ?? p.through),
      roundScores: [
        parseRoundScore(p.rounds?.[0]?.score ?? p.round1),
        parseRoundScore(p.rounds?.[1]?.score ?? p.round2),
        parseRoundScore(p.rounds?.[2]?.score ?? p.round3),
        parseRoundScore(p.rounds?.[3]?.score ?? p.round4),
      ],
      status: mapStatus(p.status),
      totalStrokes: typeof p.strokes === 'number' ? p.strokes : null,
      officialFinishPosition:
        p.status === 'complete' ? (parseInt(String(p.position), 10) || null) : null,
    }));
  }

  async fetchField(providerTournamentId: string): Promise<FieldPlayer[]> {
    const url = `${BASE}/tournaments/${providerTournamentId}/summary.json?api_key=${this.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sportradar field error: ${res.status}`);
    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const players: any[] = data?.tournament?.players ?? data?.players ?? [];
    return players.map(p => ({
      playerId: p.id ?? '',
      playerName: [p.first_name, p.last_name].filter(Boolean).join(' ') || p.name || '',
      countryCode: p.country ?? p.nationality ?? '',
      worldRanking: typeof p.world_ranking === 'number' ? p.world_ranking : undefined,
    }));
  }
}
