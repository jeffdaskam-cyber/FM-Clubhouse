import { useState } from 'react';
import type { TeamResult } from '@/lib/scoring/fantasyEngine';
import { formatToPar, scoreClass, rankBadgeClass } from '@/utils/scoring';
import { Card } from '@/components/ui/Card';
import { TeamScoreTable } from './TeamScoreTable';
import { cn } from '@/utils/cn';

interface TeamCardProps {
  team: TeamResult;
}

export function TeamCard({ team }: TeamCardProps) {
  const [expanded, setExpanded] = useState(false);
  const rankDisplay = team.isTied ? `T${team.rank}` : String(team.rank);

  return (
    <Card noPad className="overflow-hidden !rounded-none sm:!rounded-xl !border-neutral-300">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <span className={cn(
            'font-pos w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
            rankBadgeClass(team.rank),
          )}>
            {rankDisplay}
          </span>
          <div>
            <p className="font-semibold text-neutral-900 text-sm">{team.teamName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('text-xl font-bold', scoreClass(team.totalScore))}>
            {formatToPar(team.totalScore)}
          </span>
          <svg
            className={cn('w-4 h-4 text-neutral-400 transition-transform', expanded && 'rotate-180')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 border-t border-neutral-100">
          <TeamScoreTable team={team} />
        </div>
      )}
    </Card>
  );
}
