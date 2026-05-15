import { useQuery } from '@tanstack/react-query';
import { listTournaments } from '@/lib/firebase/tournaments';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useFantasyLeague } from '@/features/fantasy/useFantasyLeague';
import { buildFantasyStandings } from '@/lib/scoring/fantasyEngine';
import { Masthead } from '@/components/layout/Masthead';
import { LiveStrip } from '@/components/layout/LiveStrip';
import { TeamCard } from '@/components/scoreboard/TeamCard';
import { FeaturedTeam } from '@/components/scoreboard/FeaturedTeam';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Select } from '@/components/ui/Select';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function Home() {
  const { userProfile } = useAuth();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');

  const { data: tournaments = [], isLoading: loadingTournaments } = useQuery({
    queryKey: ['tournaments'],
    queryFn: listTournaments,
  });

  // Auto-select the active tournament on first load
  useEffect(() => {
    if (!selectedTournamentId && tournaments.length > 0) {
      const active = tournaments.find(t => t.status === 'active');
      setSelectedTournamentId(active ? active.id : tournaments[0].id);
    }
  }, [tournaments, selectedTournamentId]);

  const activeTournament = tournaments.find(t => t.id === selectedTournamentId) ?? null;

  const { players, loading: loadingLive, error: liveError, lastUpdated, refresh } =
    useLeaderboard(selectedTournamentId);

  const { data: leagueData, isLoading: loadingLeague } = useFantasyLeague(activeTournament?.id ?? null);

  const standings = leagueData
    ? buildFantasyStandings(
        leagueData.teams.map(t => ({ teamId: t.id, teamName: t.name, golferIds: t.golferIds, ownerUid: t.ownerUid })),
        players,
        activeTournament?.status === 'completed',
      )
    : [];

  // Only block on live/league loading once a tournament is actually selected
  const isLoading = loadingTournaments || (!!selectedTournamentId && (loadingLive || loadingLeague));

  const leader = players.length > 0
    ? [...players].sort((a, b) => a.totalScore - b.totalScore)[0]
    : null;

  return (
    <PageWrapper>
      <Masthead tournament={activeTournament} />
      <LiveStrip tournament={activeTournament} leader={leader} lastUpdated={lastUpdated} />

      <div className="my-6 max-w-md">
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

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner className="text-golf-green w-8 h-8" />
        </div>
      )}

      {!loadingTournaments && tournaments.length === 0 && (
        <EmptyState
          title="No tournaments yet"
          description="Sign in as admin and go to Settings → Create Tournament to get started."
        />
      )}

      {!isLoading && liveError && (
        <ErrorState message="Failed to load live scores." onRetry={refresh} />
      )}

      {!isLoading && !liveError && selectedTournamentId && standings.length === 0 && (
        <EmptyState
          title="No fantasy teams yet"
          description="An admin can create teams on the Draft page."
        />
      )}

      {!isLoading && standings.length > 0 && (() => {
        const yourTeam = standings.find(t => t.teamId === userProfile?.teamId) ?? null;
        return (
          <>
            {yourTeam && <FeaturedTeam team={yourTeam} />}

            <div className="border" style={{ borderColor: 'var(--hairline)', background: 'var(--surface)' }}>
              <div
                className="flex items-baseline justify-between px-4 sm:px-6 py-4 border-b"
                style={{ borderColor: 'var(--hairline)' }}
              >
                <h2 className="font-serif italic" style={{ fontSize: '26px', color: 'var(--ink)' }}>
                  The Standings
                </h2>
                <div className="smallcaps text-[10px]" style={{ color: 'var(--muted)' }}>
                  {standings.length} Teams · {standings.length * 3} Golfers in Field
                </div>
              </div>
              {standings.map(team => (
                <TeamCard
                  key={team.teamId}
                  team={team}
                  isCurrentUser={team.teamId === userProfile?.teamId}
                />
              ))}
            </div>
          </>
        );
      })()}
    </PageWrapper>
  );
}
