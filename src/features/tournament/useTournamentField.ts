// Superseded by DraftForm fetching directly via fetchLeaderboard() (Google Sheets provider)
// Kept for reference; no longer used by any route.
import { useQuery } from '@tanstack/react-query';
import { getPlayersByTournament } from '@/lib/firebase/players';
import type { Tournament } from '@/types/tournament';
import type { FieldPlayer } from '@/types/scoring';

export function useTournamentField(tournament: Tournament | null) {
  return useQuery<FieldPlayer[], Error>({
    queryKey: ['field', tournament?.id],
    queryFn: async () => {
      if (!tournament) return [];
      return getPlayersByTournament(tournament.id);
    },
    enabled: !!tournament,
    staleTime: 60 * 60 * 1000,
  });
}
