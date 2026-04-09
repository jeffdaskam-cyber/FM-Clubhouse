import { useState } from 'react';
import type { RankedTeam } from '@/types/fantasy';
import type { NormalizedPlayer } from '@/types/scoring';
import { formatToPar, scoreClass } from '@/utils/scoring';
import { Card } from '@/components/ui/Card';
import { TeamScoreTable } from './TeamScoreTable';
import { cn } from '@/utils/cn';

interface TeamCardProps {
  team: RankedTeam;
  players: NormalizedPlayer[];
}

export function TeamCard({ team, players }: TeamCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card noPad className="overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <span className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
            team.rank === 1 ? 'bg-flag-yellow text-gray-900' : 'bg-gray-100 text-gray-600',
          )}>
            {team.rank}
          </span>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{team.name}</p>
            <p className="text-xs text-gray-500">{team.rankDisplay}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('text-xl font-bold', scoreClass(team.computedTotalToPar))}>
            {formatToPar(team.computedTotalToPar)}
          </span>
          <svg
            className={cn('w-4 h-4 text-gray-400 transition-transform', expanded && 'rotate-180')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 border-t border-gray-50">
          <TeamScoreTable team={team} players={players} />
        </div>
      )}
    </Card>
  );
}
