import { useQuery } from '@tanstack/react-query';
import { listTournaments } from '@/lib/firebase/tournaments';
import { useLiveTournament } from '@/features/tournament/useLiveTournament';
import { useFantasyLeague } from '@/features/fantasy/useFantasyLeague';
import { useTeamRankings } from '@/features/fantasy/useTeamRankings';
import { ScoreboardHeader } from '@/components/scoreboard/ScoreboardHeader';
import { TeamCard } from '@/components/scoreboard/TeamCard';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Select } from '@/components/ui/Select';
import { useState, useEffect } from 'react';

export function Home() {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');

  const { data: tournaments = [], isLoading: loadingTournaments } = useQuery({
    queryKey: ['tournaments'],
    queryFn: listTournaments,
  });

  // Auto-select the active tournament on first load
  useEffect(() => {
    if (!selectedTournamentId && tournaments.length > 0) {
      const active = tournaments.find(t => t.status === 'active');
      if (active) setSelectedTournamentId(active.id);
      else setSelectedTournamentId(tournaments[0].id);
    }
  }, [tournaments, selectedTournamentId]);

  const activeTournament = tournaments.find(t => t.id === selectedTournamentId) ?? null;

  const { data: liveData, isLoading: loadingLive, isError: liveError, refetch } = useLiveTournament(activeTournament);
  const { data: leagueData, isLoading: loadingLeague } = useFantasyLeague(activeTournament?.id ?? null);

  const rankedTeams = useTeamRankings(leagueData?.teams, liveData?.players);

  const isLoading = loadingTournaments || loadingLive || loadingLeague;

  return (
    <PageWrapper>
      <div className="mb-4">
        <Select
          label="Tournament"
          value={selectedTournamentId}
          onChange={e => setSelectedTournamentId(e.target.value)}
          disabled={loadingTournaments}
        >
          <option value="">Select tournament...</option>
          {tournaments.map(t => (
            <option key={t.id} value={t.id}>{t.name} {t.year}</option>
          ))}
        </Select>
      </div>

      <ScoreboardHeader
        tournament={activeTournament}
        lastUpdated={liveData?.fetchedAt}
      />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner className="text-golf-green w-8 h-8" />
        </div>
      )}

      {!isLoading && liveError && (
        <ErrorState
          message="Failed to load live scores."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !liveError && rankedTeams.length === 0 && (
        <EmptyState
          title="No fantasy teams yet"
          description="An admin can create teams on the Draft page."
        />
      )}

      {!isLoading && rankedTeams.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Fantasy Standings
          </h2>
          {rankedTeams.map(team => (
            <TeamCard
              key={team.id}
              team={team}
              players={liveData?.players ?? []}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
