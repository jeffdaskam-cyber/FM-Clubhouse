import { useQuery } from '@tanstack/react-query';
import { listTournaments } from '@/lib/firebase/tournaments';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useFantasyLeague } from '@/features/fantasy/useFantasyLeague';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { ScoreboardHeader } from '@/components/scoreboard/ScoreboardHeader';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Select } from '@/components/ui/Select';
import { useState } from 'react';

export function Leaderboard() {
  const [selectedId, setSelectedId] = useState('');

  const { data: tournaments = [], isLoading: loadingT } = useQuery({
    queryKey: ['tournaments'],
    queryFn: listTournaments,
  });

  const activeTournament =
    tournaments.find(t => t.id === selectedId) ??
    tournaments.find(t => t.status === 'active') ??
    null;

  const tournamentId = activeTournament?.id ?? '';

  const { players, loading: loadingLive, error, lastUpdated, refresh } = useLeaderboard(tournamentId);
  const { data: leagueData } = useFantasyLeague(tournamentId || null);

  const highlightedIds = new Set(
    leagueData?.teams.flatMap(t => t.golferIds) ?? []
  );

  const isLoading = loadingT || loadingLive;

  return (
    <PageWrapper>
      <div className="mb-4 px-3 sm:px-0">
        <Select
          label="Tournament"
          value={selectedId || activeTournament?.id || ''}
          onChange={e => setSelectedId(e.target.value)}
          disabled={loadingT}
        >
          <option value="">Select tournament...</option>
          {tournaments.map(t => (
            <option key={t.id} value={t.id}>{t.name} {t.year}</option>
          ))}
        </Select>
      </div>

      <ScoreboardHeader
        tournament={activeTournament}
        lastUpdated={lastUpdated?.toISOString()}
      />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner className="text-golf-green w-8 h-8" />
        </div>
      )}

      {!isLoading && error && (
        <ErrorState message="Failed to load leaderboard." onRetry={refresh} />
      )}

      {!isLoading && !error && players.length === 0 && (
        <EmptyState
          title="No leaderboard data"
          description="Scoring data will appear once the tournament begins."
        />
      )}

      {!isLoading && !error && players.length > 0 && (
        <LeaderboardTable
          players={players}
          highlightedPlayerIds={highlightedIds}
        />
      )}
    </PageWrapper>
  );
}
