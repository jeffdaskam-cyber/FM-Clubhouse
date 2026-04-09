import type { NormalizedPlayer } from '@/types/scoring';
import { formatToPar, scoreClass } from '@/utils/scoring';
import { StatusBadge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

interface GolferRowProps {
  player: NormalizedPlayer | null;
  isFrozen?: boolean;
  frozenScore?: number;
}

export function GolferRow({ player, isFrozen, frozenScore }: GolferRowProps) {
  if (!player) {
    return (
      <div className="flex items-center justify-between py-1.5 text-sm text-gray-400">
        <span>Unknown player</span>
        <span>-</span>
      </div>
    );
  }

  const displayScore = isFrozen && frozenScore !== undefined ? frozenScore : player.totalToPar;

  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-gray-500 text-xs w-6 text-right shrink-0">{player.position}</span>
        <span className="truncate font-medium text-gray-800">{player.playerName}</span>
        {(isFrozen || player.status !== 'active') && (
          <StatusBadge status={isFrozen ? (player.status) : player.status} />
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-2">
        <span className="text-xs text-gray-500">{player.thru}</span>
        <span className={cn('font-semibold w-8 text-right', scoreClass(displayScore))}>
          {formatToPar(displayScore)}
        </span>
      </div>
    </div>
  );
}
