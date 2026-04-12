import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listTournaments, lockTournament, saveTournament } from '@/lib/firebase/tournaments';
import { getLeaguesByTournament, lockLeague } from '@/lib/firebase/leagues';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { EditTeamsCard } from '@/components/settings/EditTeamsCard';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Link } from 'react-router-dom';
import { formatDate } from '@/utils/date';
import { SUPPORTED_TOURNAMENTS } from '@/utils/constants';
import type { TournamentSlug, TournamentStatus } from '@/types/tournament';

// Known venue data for fixed-location majors
const VENUE_PRESETS: Partial<Record<TournamentSlug, { venue: string; location: string; lat: number; lon: number; par: number }>> = {
  players: { venue: 'TPC Sawgrass',               location: 'Ponte Vedra Beach, FL', lat: 30.1975, lon: -81.3962, par: 72 },
  masters: { venue: 'Augusta National Golf Club',  location: 'Augusta, GA',           lat: 33.5022, lon: -82.0200, par: 72 },
};

interface TournamentFormState {
  slug:      TournamentSlug | '';
  year:      string;
  startDate: string;
  endDate:   string;
  status:    TournamentStatus;
  venue:     string;
  location:  string;
  lat:       string;
  lon:       string;
  par:       string;
}

const EMPTY_FORM: TournamentFormState = {
  slug: '', year: String(new Date().getFullYear()),
  startDate: '', endDate: '',
  status: 'upcoming',
  venue: '', location: '', lat: '', lon: '', par: '72',
};

function CreateTournamentCard({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState<TournamentFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function setField<K extends keyof TournamentFormState>(key: K, value: TournamentFormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
    setError('');
    setSuccess('');
  }

  function handleSlugChange(slug: TournamentSlug | '') {
    const preset = slug ? VENUE_PRESETS[slug] : undefined;
    setForm(f => ({
      ...f,
      slug,
      venue:    preset?.venue    ?? f.venue,
      location: preset?.location ?? f.location,
      lat:      preset ? String(preset.lat) : f.lat,
      lon:      preset ? String(preset.lon) : f.lon,
      par:      preset ? String(preset.par) : f.par,
    }));
    setError('');
    setSuccess('');
  }

  async function handleCreate() {
    if (!form.slug || !form.year || !form.startDate || !form.endDate) {
      setError('Tournament, year, start date, and end date are required.');
      return;
    }
    const year = parseInt(form.year, 10);
    if (isNaN(year)) { setError('Invalid year.'); return; }

    const name = SUPPORTED_TOURNAMENTS.find(t => t.slug === form.slug)!.name;
    const id   = `${form.slug}-${year}`;

    setSaving(true);
    setError('');
    try {
      await saveTournament({
        id, name, year,
        slug:                form.slug as TournamentSlug,
        startDate:           new Date(form.startDate).toISOString(),
        endDate:             new Date(form.endDate).toISOString(),
        status:              form.status,
        venue:               form.venue || name,
        location:            form.location,
        lat:                 parseFloat(form.lat) || 0,
        lon:                 parseFloat(form.lon) || 0,
        par:                 parseInt(form.par, 10) || 72,
        scoringProvider:     'sportradar',
        providerTournamentId: '',
        isLocked:            false,
      });
      setSuccess(`"${name} ${year}" created! (ID: ${id})`);
      setForm(EMPTY_FORM);
      onCreated();
    } catch (e) {
      setError('Failed to save tournament. Check console for details.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <h2 className="font-semibold text-neutral-700 mb-4">Create Tournament</h2>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Tournament"
            value={form.slug}
            onChange={e => handleSlugChange(e.target.value as TournamentSlug | '')}
          >
            <option value="">Select…</option>
            {SUPPORTED_TOURNAMENTS.map(t => (
              <option key={t.slug} value={t.slug}>{t.name}</option>
            ))}
          </Select>
          <Input
            label="Year"
            type="number"
            value={form.year}
            onChange={e => setField('year', e.target.value)}
            min={2020} max={2040}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Start Date" type="date" value={form.startDate} onChange={e => setField('startDate', e.target.value)} />
          <Input label="End Date"   type="date" value={form.endDate}   onChange={e => setField('endDate',   e.target.value)} />
        </div>

        <Select
          label="Status"
          value={form.status}
          onChange={e => setField('status', e.target.value as TournamentStatus)}
        >
          <option value="upcoming">Upcoming</option>
          <option value="active">Active (in progress)</option>
          <option value="completed">Completed</option>
        </Select>

        <Input label="Venue"    value={form.venue}    onChange={e => setField('venue',    e.target.value)} placeholder="e.g. Augusta National Golf Club" />
        <Input label="Location" value={form.location} onChange={e => setField('location', e.target.value)} placeholder="e.g. Augusta, GA" />

        <div className="grid grid-cols-3 gap-3">
          <Input label="Latitude"  value={form.lat} onChange={e => setField('lat', e.target.value)} placeholder="30.1975" />
          <Input label="Longitude" value={form.lon} onChange={e => setField('lon', e.target.value)} placeholder="-81.3962" />
          <Input label="Par"       value={form.par} onChange={e => setField('par', e.target.value)} type="number" />
        </div>

        {error   && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600 font-medium">{success}</p>}

        <div className="flex justify-end pt-1">
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? 'Creating…' : 'Create Tournament'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

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
          <p className="text-neutral-500 mb-3">Admin access required.</p>
          <Link to="/login" className="text-green-600 underline text-sm">Sign in</Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h1 className="text-xl font-bold text-neutral-900 mb-6 px-3 sm:px-0">Settings</h1>

      <div className="space-y-4">
        <CreateTournamentCard
          onCreated={() => queryClient.invalidateQueries({ queryKey: ['tournaments'] })}
        />

        <Card>
          <h2 className="font-semibold text-neutral-700 mb-3">Manage Tournament</h2>
          {isLoading ? <Spinner /> : (
            <div className="space-y-4">
              <Select
                label="Select Tournament"
                value={selectedTournamentId}
                onChange={e => { setSelectedTournamentId(e.target.value); setMessage(''); }}
              >
                <option value="">Choose tournament…</option>
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>{t.name} {t.year}</option>
                ))}
              </Select>

              {selectedTournament && (
                <div className="space-y-3 pt-2">
                  <div className="text-sm text-neutral-600 space-y-1">
                    <p><span className="font-medium">Status:</span> {selectedTournament.status}</p>
                    <p><span className="font-medium">Dates:</span> {formatDate(selectedTournament.startDate)} – {formatDate(selectedTournament.endDate)}</p>
                    <p><span className="font-medium">Venue:</span> {selectedTournament.venue}</p>
                    <p><span className="font-medium">League:</span> {activeLeague ? activeLeague.name : 'No league created yet'}</p>
                    <p><span className="font-medium">Draft locked:</span> {selectedTournament.isLocked ? 'Yes' : 'No'}</p>
                  </div>
                  <Button
                    variant={selectedTournament.isLocked ? 'secondary' : 'danger'}
                    size="sm"
                    onClick={handleToggleLock}
                    disabled={working}
                  >
                    {working ? 'Working…' : selectedTournament.isLocked ? 'Unlock Draft' : 'Lock Draft'}
                  </Button>
                  {message && <p className="text-sm text-green-600">{message}</p>}
                </div>
              )}
            </div>
          )}
        </Card>

        {selectedTournamentId && (
          <EditTeamsCard tournamentId={selectedTournamentId} />
        )}

        <Card>
          <h2 className="font-semibold text-neutral-700 mb-3">Account</h2>
          <p className="text-sm text-neutral-600 mb-3">Signed in as {user?.email}</p>
          <Button variant="ghost" size="sm" onClick={() => signOut(auth)}>
            Sign out
          </Button>
        </Card>
      </div>
    </PageWrapper>
  );
}
