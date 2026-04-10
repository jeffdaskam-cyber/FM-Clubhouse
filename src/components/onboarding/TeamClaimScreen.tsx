import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { listActiveTournaments } from '@/lib/firebase/tournaments';
import { getTeamsByTournament } from '@/lib/firebase/teams';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';

/** Convert a slugified player ID back to a readable name. */
function deslugify(id: string): string {
  return id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function TeamClaimScreen() {
  const { user } = useAuth();
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data: activeTournaments = [], isLoading: loadingTournaments } = useQuery({
    queryKey: ['active-tournaments'],
    queryFn: listActiveTournaments,
  });

  const activeTournament = activeTournaments[0] ?? null;

  const { data: teams = [], isLoading: loadingTeams } = useQuery({
    queryKey: ['teams', activeTournament?.id],
    queryFn: () => getTeamsByTournament(activeTournament!.id),
    enabled: !!activeTournament,
  });

  const unclaimedTeams = teams.filter(t => t.ownerUid === null);

  async function handleClaim(teamId: string) {
    if (!user || !activeTournament) return;
    setClaiming(teamId);
    setError('');
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'teams', teamId), {
        ownerUid: user.uid,
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, 'userProfiles', user.uid), {
        email: user.email ?? '',
        teamId,
        tournamentId: activeTournament.id,
        createdAt: serverTimestamp(),
      });
      await batch.commit();
      // Reload so AuthContext re-fetches the new userProfile
      window.location.reload();
    } catch {
      setError('Failed to claim team. Please try again.');
      setClaiming(null);
    }
  }

  if (loadingTournaments || loadingTeams) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!activeTournament) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] px-4">
        <Card className="w-full max-w-md text-center space-y-2">
          <p className="text-2xl mb-2">⛳</p>
          <p className="font-semibold text-neutral-800">No active tournament</p>
          <p className="text-sm text-neutral-500">
            Check back when a tournament is in progress.
          </p>
        </Card>
      </div>
    );
  }

  if (unclaimedTeams.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] px-4">
        <Card className="w-full max-w-md text-center space-y-2">
          <p className="text-2xl mb-2">🏌️</p>
          <p className="font-semibold text-neutral-800">All teams are taken</p>
          <p className="text-sm text-neutral-500">
            Contact the commissioner to get access.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] px-4 py-8">
      <div className="w-full max-w-lg space-y-5">
        <div className="text-center">
          <img
            src="/icons/Logo_192.png"
            alt="FM Clubhouse"
            className="w-16 h-16 rounded-xl object-contain mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-neutral-900">Welcome to FM Clubhouse!</h1>
          <p className="text-neutral-500 mt-1 text-sm">
            Select your team for{' '}
            <span className="font-medium text-neutral-700">
              {activeTournament.name} {activeTournament.year}
            </span>
          </p>
        </div>

        <div className="space-y-3">
          {unclaimedTeams.map(team => (
            <Card key={team.id} noPad className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-semibold text-neutral-900 text-base">{team.name}</p>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {team.golferIds.map(deslugify).join(' · ')}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleClaim(team.id)}
                disabled={!!claiming}
                className="shrink-0 mt-0.5"
              >
                {claiming === team.id ? 'Claiming…' : 'This is my team'}
              </Button>
            </Card>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
}
