import type { PlayerScore } from '@/lib/scoring';
import { formatToPar, scoreClass } from '@/utils/scoring';
import { StatusBadge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

interface LeaderboardRowProps {
  player: PlayerScore;
  isHighlighted?: boolean;
}

function RoundCell({ score }: { score: number | null }) {
  if (score === null) return <span className="text-right text-neutral-300">-</span>;
  return <span className={cn('text-right font-score', scoreClass(score))}>{score}</span>;
}

export function LeaderboardRow({ player, isHighlighted }: LeaderboardRowProps) {
  const isActive = player.status === 'active';

  return (
    <>
      {/* Desktop row */}
      <div
        className={cn(
          'hidden md:grid grid-cols-[3rem_1fr_5rem_5rem_5rem_4rem_4rem_4rem_4rem_5rem] gap-2 px-4 py-2.5 text-sm border-b border-neutral-100 last:border-0 transition-colors',
          isHighlighted ? 'bg-green-50' : 'hover:bg-neutral-50',
        )}
      >
        <span className="font-pos text-right font-semibold text-neutral-500">{player.position}</span>
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate font-medium text-neutral-900">{player.name}</span>
          {!isActive && <StatusBadge status={player.status} />}
        </div>
        <span className={cn('text-right font-bold', scoreClass(player.totalScore))}>
          {formatToPar(player.totalScore)}
        </span>
        <span className={cn('text-right font-score', scoreClass(player.todayScore))}>
          {formatToPar(player.todayScore)}
        </span>
        <span className="text-right text-neutral-500">{player.thru}</span>
        <RoundCell score={player.r1} />
        <RoundCell score={player.r2} />
        <RoundCell score={player.r3} />
        <RoundCell score={player.r4} />
        <span className="text-right font-score text-neutral-500">
          {player.totalStrokes ?? '-'}
        </span>
      </div>

      {/* Mobile row */}
      <div
        className={cn(
          'md:hidden flex items-center justify-between px-4 py-2.5 border-b border-neutral-100 last:border-0',
          isHighlighted && 'bg-green-50',
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-pos text-sm font-semibold text-neutral-500 w-8 text-right shrink-0">{player.position}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-neutral-900 truncate">{player.name}</span>
              {!isActive && <StatusBadge status={player.status} />}
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              Thru {player.thru}
              {' '}&bull; Today: <span className={cn('font-score', scoreClass(player.todayScore))}>{formatToPar(player.todayScore)}</span>
            </div>
          </div>
        </div>
        <span className={cn('text-base font-bold shrink-0 ml-2', scoreClass(player.totalScore))}>
          {formatToPar(player.totalScore)}
        </span>
      </div>
    </>
  );
}
