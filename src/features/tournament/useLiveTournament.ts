// Superseded by src/hooks/useLeaderboard.ts (Google Sheets provider)
// Kept for reference; no longer used by any route.
import { useQuery } from '@tanstack/react-query';
import { getScoringCache } from '@/lib/firebase/scoringCache';
import { REFRESH_INTERVAL_MS } from '@/utils/constants';
import type { Tournament } from '@/types/tournament';
import type { ScoringCacheDoc } from '@/types/scoring';

export function useLiveTournament(tournament: Tournament | null) {
  return useQuery<ScoringCacheDoc | null, Error>({
    queryKey: ['liveTournament', tournament?.id],
    queryFn: async () => {
      if (!tournament) return null;
      return getScoringCache(tournament.id);
    },
    enabled: !!tournament,
    refetchInterval: tournament?.status === 'active' ? REFRESH_INTERVAL_MS : false,
    staleTime: REFRESH_INTERVAL_MS / 2,
  });
}
