import type { TeamResult } from '@/lib/scoring/fantasyEngine';
import { GolferRow } from './GolferRow';

interface TeamScoreTableProps {
  team: TeamResult;
}

export function TeamScoreTable({ team }: TeamScoreTableProps) {
  return (
    <div className="divide-y divide-neutral-100">
      {team.golfers.map(player => (
        <GolferRow key={player.id} player={player} />
      ))}
    </div>
  );
}
