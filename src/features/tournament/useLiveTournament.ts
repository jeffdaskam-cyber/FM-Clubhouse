import { useQuery } from '@tanstack/react-query';
import { getScoringCache, saveScoringCache } from '@/lib/firebase/scoringCache';
import { getScoringProvider } from '@/lib/scoring';
import { REFRESH_INTERVAL_MS } from '@/utils/constants';
import type { Tournament } from '@/types/tournament';
import type { ScoringCacheDoc } from '@/types/scoring';

export function useLiveTournament(tournament: Tournament | null) {
  return useQuery<ScoringCacheDoc | null, Error>({
    queryKey: ['liveTournament', tournament?.id],
    queryFn: async () => {
      if (!tournament) return null;

      // Use cached data if tournament is not active
      if (tournament.status !== 'active') {
        return getScoringCache(tournament.id);
      }

      try {
        const provider = getScoringProvider(tournament.scoringProvider);
        const players = await provider.fetchLeaderboard(tournament.providerTournamentId);
        const cache: ScoringCacheDoc = {
          tournamentId: tournament.id,
          fetchedAt: new Date().toISOString(),
          players,
          roundStatus: 'in_progress',
          currentRound: 1, // provider adapters can enhance this
        };
        await saveScoringCache(cache);
        return cache;
      } catch {
        // Fallback to last known good cache on error
        return getScoringCache(tournament.id);
      }
    },
    enabled: !!tournament,
    refetchInterval: tournament?.status === 'active' ? REFRESH_INTERVAL_MS : false,
    staleTime: REFRESH_INTERVAL_MS / 2,
  });
}
