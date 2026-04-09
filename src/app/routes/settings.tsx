import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listTournaments, lockTournament } from '@/lib/firebase/tournaments';
import { getLeaguesByTournament, lockLeague } from '@/lib/firebase/leagues';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Link } from 'react-router-dom';
import { formatDate } from '@/utils/date';

export function Settings() {
  const { isAdmin, loading: authLoading, user } = useAuth();
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: listTournaments,
  });

  const { data: leagues = [] } = useQuery({
    queryKey: ['leagues', selectedTournamentId],
    queryFn: () => getLeaguesByTournament(selectedTournamentId),
    enabled: !!selectedTournamentId,
  });

  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId) ?? null;
  const activeLeague = leagues[leagues.length - 1] ?? null;

  async function handleToggleLock() {
    if (!selectedTournament) return;
    setWorking(true);
    try {
      const newLocked = !selectedTournament.isLocked;
      await lockTournament(selectedTournamentId, newLocked);
      if (activeLeague) await lockLeague(activeLeague.id, newLocked);
      await queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      setMessage(newLocked ? 'League locked.' : 'League unlocked.');
    } finally {
      setWorking(false);
    }
  }

  if (authLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  if (!isAdmin) {
    return (
      <PageWrapper>
        <div className="text-center py-16">
          <p className="text-gray-500 mb-3">Admin access required.</p>
          <Link to="/login" className="text-golf-green underline text-sm">Sign in</Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="space-y-4">
        <Card>
          <h2 className="font-semibold text-gray-700 mb-3">Tournament Management</h2>
          {isLoading ? <Spinner /> : (
            <div className="space-y-4">
              <Select
                label="Select Tournament"
                value={selectedTournamentId}
                onChange={e => { setSelectedTournamentId(e.target.value); setMessage(''); }}
              >
                <option value="">Choose tournament...</option>
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>{t.name} {t.year}</option>
                ))}
              </Select>

              {selectedTournament && (
                <div className="space-y-3 pt-2">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Status:</span> {selectedTournament.status}</p>
                    <p><span className="font-medium">Dates:</span> {formatDate(selectedTournament.startDate)} – {formatDate(selectedTournament.endDate)}</p>
                    <p><span className="font-medium">Provider:</span> {selectedTournament.scoringProvider}</p>
                    <p><span className="font-medium">League:</span> {activeLeague ? activeLeague.name : 'No league created'}</p>
                    <p><span className="font-medium">Draft locked:</span> {selectedTournament.isLocked ? 'Yes' : 'No'}</p>
                  </div>
                  <Button
                    variant={selectedTournament.isLocked ? 'secondary' : 'danger'}
                    size="sm"
                    onClick={handleToggleLock}
                    disabled={working}
                  >
                    {working ? 'Working...' : selectedTournament.isLocked ? 'Unlock Draft' : 'Lock Draft'}
                  </Button>
                  {message && <p className="text-sm text-golf-green">{message}</p>}
                </div>
              )}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-gray-700 mb-3">Account</h2>
          <p className="text-sm text-gray-600 mb-3">Signed in as {user?.email}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut(auth)}
          >
            Sign out
          </Button>
        </Card>
      </div>
    </PageWrapper>
  );
}
