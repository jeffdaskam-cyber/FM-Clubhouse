import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTeamsByTournament, updateTeam } from '@/lib/firebase/teams';
import { fetchLeaderboard } from '@/lib/scoring';
import { GolferSearch } from '@/components/draft/GolferSearch';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { GOLFERS_PER_TEAM } from '@/utils/constants';
import type { FantasyTeam } from '@/types/fantasy';

interface TeamRowState {
  name: string;
  golferIds: (string | null)[];
}

interface EditTeamsCardProps {
  tournamentId: string;
}

export function EditTeamsCard({ tournamentId }: EditTeamsCardProps) {
  const queryClient = useQueryClient();
  const [rowState, setRowState] = useState<Record<string, TeamRowState>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  const { data: teams = [], isLoading: loadingTeams } = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => getTeamsByTournament(tournamentId),
    enabled: !!tournamentId,
  });

  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ['leaderboard-field'],
    queryFn: fetchLeaderboard,
    staleTime: 5 * 60 * 1000,
  });

  // Seed local state when teams load; preserve any unsaved edits
  useEffect(() => {
    if (teams.length === 0) return;
    setRowState(prev => {
      const next = { ...prev };
      teams.forEach((team: FantasyTeam) => {
        if (!next[team.id]) {
          next[team.id] = {
            name: team.name,
            golferIds: [...team.golferIds] as (string | null)[],
          };
        }
      });
      return next;
    });
  }, [teams]);

  function getAllSelectedExcept(excludeTeamId: string): string[] {
    return Object.entries(rowState)
      .filter(([id]) => id !== excludeTeamId)
      .flatMap(([, row]) => row.golferIds.filter((id): id is string => id !== null));
  }

  function updateRow(teamId: string, patch: Partial<TeamRowState>) {
    setRowState(s => ({ ...s, [teamId]: { ...s[teamId], ...patch } }));
    setRowErrors(e => ({ ...e, [teamId]: '' }));
  }

  async function handleSave(team: FantasyTeam) {
    const row = rowState[team.id];
    if (!row) return;

    if (!row.name.trim()) {
      setRowErrors(e => ({ ...e, [team.id]: 'Team name is required.' }));
      return;
    }
    const filled = row.golferIds.filter((id): id is string => id !== null);
    if (filled.length < GOLFERS_PER_TEAM) {
      setRowErrors(e => ({ ...e, [team.id]: `All ${GOLFERS_PER_TEAM} golfer slots must be filled.` }));
      return;
    }

    setSavingId(team.id);
    setSavedId(null);
    try {
      await updateTeam(team.id, {
        name: row.name.trim(),
        golferIds: filled as [string, string, string],
      });
      await queryClient.invalidateQueries({ queryKey: ['teams', tournamentId] });
      await queryClient.invalidateQueries({ queryKey: ['fantasyLeague', tournamentId] });
      setSavedId(team.id);
      setTimeout(() => setSavedId(null), 2500);
    } catch {
      setRowErrors(e => ({ ...e, [team.id]: 'Save failed — please try again.' }));
    } finally {
      setSavingId(null);
    }
  }

  if (loadingTeams || loadingPlayers) {
    return (
      <Card>
        <h2 className="font-semibold text-neutral-700 mb-3">Edit Teams</h2>
        <div className="flex justify-center py-4"><Spinner /></div>
      </Card>
    );
  }

  if (teams.length === 0) {
    return (
      <Card>
        <h2 className="font-semibold text-neutral-700 mb-2">Edit Teams</h2>
        <p className="text-sm text-neutral-500">
          No teams found for this tournament. Use the Draft page to create them.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-semibold text-neutral-700 mb-4">Edit Teams</h2>
      <div className="space-y-5">
        {teams.map(team => {
          const row = rowState[team.id];
          if (!row) return null;
          const disabledIds = getAllSelectedExcept(team.id);

          return (
            <div
              key={team.id}
              className="border border-neutral-200 rounded-lg p-4 space-y-3"
            >
              {/* Header: name input + save button */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Input
                    label="Team Name"
                    value={row.name}
                    onChange={e => updateRow(team.id, { name: e.target.value })}
                    placeholder="Enter team name"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSave(team)}
                  disabled={savingId === team.id}
                  className="mb-0.5"
                >
                  {savingId === team.id
                    ? 'Saving…'
                    : savedId === team.id
                      ? '✓ Saved'
                      : 'Save'}
                </Button>
              </div>

              {/* Golfer slots */}
              {Array.from({ length: GOLFERS_PER_TEAM }).map((_, gi) => (
                <GolferSearch
                  key={gi}
                  label={`Golfer ${gi + 1}`}
                  players={players}
                  value={row.golferIds[gi] ?? null}
                  disabledPlayerIds={disabledIds}
                  onChange={id => {
                    const updated = [...row.golferIds];
                    updated[gi] = id;
                    updateRow(team.id, { golferIds: updated });
                  }}
                />
              ))}

              {/* Owner info */}
              {team.ownerUid && (
                <p className="text-xs text-neutral-400">
                  Claimed by a user (uid: {team.ownerUid.slice(0, 8)}…)
                </p>
              )}

              {rowErrors[team.id] && (
                <p className="text-xs text-red-600">{rowErrors[team.id]}</p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
