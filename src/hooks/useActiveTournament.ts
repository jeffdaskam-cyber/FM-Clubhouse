import { useTournamentContext } from '@/context/TournamentContext';

export function useActiveTournament() {
  return useTournamentContext();
}
