import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { TeamDraft } from '@/types/fantasy';
import type { Tournament } from '@/types/tournament';
import { fetchLeaderboard } from '@/lib/scoring';
import { TeamEntryRow } from './TeamEntryRow';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { createLeague } from '@/lib/firebase/leagues';
import { saveTeamsBatch } from '@/lib/firebase/teams';
import { MIN_TEAMS, MAX_TEAMS, GOLFERS_PER_TEAM } from '@/utils/constants';

interface DraftFormProps {
  tournament: Tournament;
  isLocked?: boolean;
}

function emptyTeam(): TeamDraft {
  return { name: '', golferIds: Array(GOLFERS_PER_TEAM).fill(null) };
}

export function DraftForm({ tournament, isLocked }: DraftFormProps) {
  const [teams, setTeams] = useState<TeamDraft[]>([emptyTeam(), emptyTeam(), emptyTeam(), emptyTeam()]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  const [globalError, setGlobalError] = useState('');
  const queryClient = useQueryClient();

  // Source players from the live Google Sheet so IDs are slugified names
  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ['leaderboard-field'],
    queryFn: fetchLeaderboard,
    staleTime: 5 * 60 * 1000,
  });

  const allSelectedIds = teams.flatMap(t =>
    t.golferIds.filter((id): id is string => id !== null)
  );

  function validate(): boolean {
    const newErrors: Record<number, Record<string, string>> = {};
    let valid = true;
    teams.forEach((team, i) => {
      const teamErrors: Record<string, string> = {};
      if (!team.name.trim()) { teamErrors.name = 'Team name is required'; valid = false; }
      const filled = team.golferIds.filter((id): id is string => id !== null);
      if (filled.length < GOLFERS_PER_TEAM) {
        teamErrors.golfers = `Select all ${GOLFERS_PER_TEAM} golfers`;
        valid = false;
      }
      if (Object.keys(teamErrors).length > 0) newErrors[i] = teamErrors;
    });
    setErrors(newErrors);
    return valid;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setGlobalError('');
    try {
      const leagueId = await createLeague({
        tournamentId: tournament.id,
        name: `${tournament.name} ${tournament.year}`,
        isLocked: false,
        teamCount: teams.length,
      });

      await saveTeamsBatch(teams.map(t => ({
        leagueId,
        tournamentId: tournament.id,
        name: t.name,
        ownerUid: null,
        golferIds: t.golferIds as [string, string, string],
        frozenGolferIds: [],
        frozenScores: {},
      })));

      await queryClient.invalidateQueries({ queryKey: ['fantasyLeague', tournament.id] });
      setSaved(true);
    } catch (e) {
      setGlobalError('Failed to save. Please try again.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  if (isLocked) {
    return (
      <div className="text-center py-8 text-gray-500">
        This league is locked and cannot be edited.
      </div>
    );
  }

  if (saved) {
    return (
      <div className="text-center py-8">
        <p className="text-golf-green font-semibold text-lg">Teams saved!</p>
        <p className="text-gray-500 text-sm mt-1">The league has been created successfully.</p>
        <Button className="mt-4" onClick={() => { setSaved(false); setTeams([emptyTeam(), emptyTeam(), emptyTeam(), emptyTeam()]); }}>
          Create another league
        </Button>
      </div>
    );
  }

  if (loadingPlayers) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="text-golf-green" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{teams.length} teams ({MIN_TEAMS}–{MAX_TEAMS} allowed)</p>
        <div className="flex gap-2">
          {teams.length < MAX_TEAMS && (
            <Button variant="secondary" size="sm" onClick={() => setTeams(t => [...t, emptyTeam()])}>
              + Add Team
            </Button>
          )}
        </div>
      </div>

      {teams.map((team, i) => (
        <TeamEntryRow
          key={i}
          index={i}
          team={team}
          players={players}
          disabledPlayerIds={allSelectedIds.filter(id => {
            const teamOwner = teams.findIndex(t => t.golferIds.includes(id));
            return teamOwner !== i;
          })}
          onChange={updated => setTeams(ts => ts.map((t, j) => j === i ? updated : t))}
          onRemove={() => setTeams(ts => ts.filter((_, j) => j !== i))}
          canRemove={teams.length > MIN_TEAMS}
          errors={errors[i]}
        />
      ))}

      {globalError && (
        <p className="text-sm text-red-600 text-center">{globalError}</p>
      )}

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save All Teams'}
        </Button>
      </div>
    </div>
  );
}
