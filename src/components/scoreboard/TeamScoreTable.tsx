import type { RankedTeam } from '@/types/fantasy';
import type { NormalizedPlayer } from '@/types/scoring';
import { GolferRow } from './GolferRow';

interface TeamScoreTableProps {
  team: RankedTeam;
  players: NormalizedPlayer[];
}

export function TeamScoreTable({ team, players }: TeamScoreTableProps) {
  const playerMap = new Map(players.map(p => [p.playerId, p]));

  return (
    <div className="divide-y divide-gray-50">
      {team.golferIds.map(id => {
        const player = playerMap.get(id) ?? null;
        const isFrozen = team.frozenGolferIds.includes(id);
        const frozenScore = team.frozenScores[id];
        return (
          <GolferRow
            key={id}
            player={player}
            isFrozen={isFrozen}
            frozenScore={frozenScore}
          />
        );
      })}
    </div>
  );
}
