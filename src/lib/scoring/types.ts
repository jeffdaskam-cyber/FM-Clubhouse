import type { FieldPlayer, NormalizedPlayer } from '@/types/scoring';

export interface ScoringProvider {
  readonly name: string;
  fetchLeaderboard(providerTournamentId: string): Promise<NormalizedPlayer[]>;
  fetchField(providerTournamentId: string): Promise<FieldPlayer[]>;
}
