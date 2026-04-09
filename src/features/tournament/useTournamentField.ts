import { useQuery } from '@tanstack/react-query';
import { getPlayersByTournament } from '@/lib/firebase/players';
import { getScoringProvider } from '@/lib/scoring';
import { savePlayersForTournament } from '@/lib/firebase/players';
import type { Tournament } from '@/types/tournament';
import type { FieldPlayer } from '@/types/scoring';

export function useTournamentField(tournament: Tournament | null) {
  return useQuery<FieldPlayer[], Error>({
    queryKey: ['field', tournament?.id],
    queryFn: async () => {
      if (!tournament) return [];
      // Try Firestore cache first
      const cached = await getPlayersByTournament(tournament.id);
      if (cached.length > 0) return cached;
      // Fetch from provider and cache
      const provider = getScoringProvider(tournament.scoringProvider);
      const players = await provider.fetchField(tournament.providerTournamentId);
      await savePlayersForTournament(tournament.id, players);
      return players;
    },
    enabled: !!tournament,
    staleTime: 60 * 60 * 1000, // 1 hour - field rarely changes
  });
}
