import type { TeamResult } from '@/lib/scoring/fantasyEngine';
import { GolferRow } from './GolferRow';

interface TeamScoreTableProps {
  team: TeamResult;
}

export function TeamScoreTable({ team }: TeamScoreTableProps) {
  return (
    <div className="divide-y divide-gray-50">
      {team.golfers.map(player => (
        <GolferRow key={player.id} player={player} />
      ))}
    </div>
  );
}
