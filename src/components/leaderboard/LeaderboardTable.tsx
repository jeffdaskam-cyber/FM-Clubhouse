import type { PlayerScore } from '@/lib/scoring';
import { LeaderboardHeader } from './LeaderboardHeader';
import { LeaderboardRow } from './LeaderboardRow';

interface LeaderboardTableProps {
  players: PlayerScore[];
  highlightedPlayerIds?: Set<string>;
}

export function LeaderboardTable({ players, highlightedPlayerIds }: LeaderboardTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <LeaderboardHeader />
      {players.map(player => (
        <LeaderboardRow
          key={player.id}
          player={player}
          isHighlighted={highlightedPlayerIds?.has(player.id)}
        />
      ))}
    </div>
  );
}
