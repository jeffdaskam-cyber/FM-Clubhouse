import type { NormalizedPlayer } from '@/types/scoring';
import { LeaderboardHeader } from './LeaderboardHeader';
import { LeaderboardRow } from './LeaderboardRow';

interface LeaderboardTableProps {
  players: NormalizedPlayer[];
  highlightedPlayerIds?: Set<string>;
}

export function LeaderboardTable({ players, highlightedPlayerIds }: LeaderboardTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <LeaderboardHeader />
      {players.map(player => (
        <LeaderboardRow
          key={player.playerId}
          player={player}
          isHighlighted={highlightedPlayerIds?.has(player.playerId)}
        />
      ))}
    </div>
  );
}
