import { useMemo } from 'react';
import { rankTeams } from '@/features/scoring/engine';
import type { FantasyTeam, RankedTeam } from '@/types/fantasy';
import type { NormalizedPlayer } from '@/types/scoring';

export function useTeamRankings(
  teams: FantasyTeam[] | undefined,
  players: NormalizedPlayer[] | undefined,
): RankedTeam[] {
  return useMemo(() => {
    if (!teams || !players) return [];
    return rankTeams(teams, players);
  }, [teams, players]);
}
