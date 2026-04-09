import { useQuery } from '@tanstack/react-query';
import { getLeaguesByTournament } from '@/lib/firebase/leagues';
import { getTeamsByLeague } from '@/lib/firebase/teams';
import type { FantasyLeague, FantasyTeam } from '@/types/fantasy';

export interface LeagueWithTeams {
  league: FantasyLeague;
  teams: FantasyTeam[];
}

export function useFantasyLeague(tournamentId: string | null) {
  return useQuery<LeagueWithTeams | null, Error>({
    queryKey: ['fantasyLeague', tournamentId],
    queryFn: async () => {
      if (!tournamentId) return null;
      const leagues = await getLeaguesByTournament(tournamentId);
      if (leagues.length === 0) return null;
      // Use the most recently created league
      const league = leagues[leagues.length - 1];
      const teams = await getTeamsByLeague(league.id);
      return { league, teams };
    },
    enabled: !!tournamentId,
  });
}
