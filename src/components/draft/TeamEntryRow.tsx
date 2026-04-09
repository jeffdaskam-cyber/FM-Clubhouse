import type { FieldPlayer } from '@/types/scoring';
import type { TeamDraft } from '@/types/fantasy';
import { GolferSearch } from './GolferSearch';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GOLFERS_PER_TEAM } from '@/utils/constants';

interface TeamEntryRowProps {
  index: number;
  team: TeamDraft;
  players: FieldPlayer[];
  disabledPlayerIds: string[];
  onChange: (team: TeamDraft) => void;
  onRemove: () => void;
  canRemove: boolean;
  errors?: Record<string, string>;
}

export function TeamEntryRow({
  index,
  team,
  players,
  disabledPlayerIds,
  onChange,
  onRemove,
  canRemove,
  errors = {},
}: TeamEntryRowProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700 text-sm">Team {index + 1}</h3>
        {canRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700">
            Remove
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <Input
          label="Team Name"
          value={team.name}
          onChange={e => onChange({ ...team, name: e.target.value })}
          placeholder="Enter team name"
          error={errors.name}
        />

        {Array.from({ length: GOLFERS_PER_TEAM }).map((_, gi) => (
          <GolferSearch
            key={gi}
            label={`Golfer ${gi + 1}`}
            players={players}
            value={team.golferIds[gi] ?? null}
            disabledPlayerIds={disabledPlayerIds}
            onChange={id => {
              const updated = [...team.golferIds];
              updated[gi] = id;
              onChange({ ...team, golferIds: updated });
            }}
          />
        ))}
        {errors.golfers && (
          <p className="text-xs text-red-600">{errors.golfers}</p>
        )}
      </div>
    </div>
  );
}
