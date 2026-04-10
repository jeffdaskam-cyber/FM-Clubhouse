import { cn } from '@/utils/cn';
import type { PlayerStatus } from '@/lib/scoring';

interface BadgeProps {
  status: PlayerStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  const map: Record<string, string> = {
    cut:      'bg-neutral-200 text-neutral-600',
    wd:       'bg-neutral-200 text-neutral-500',
    dq:       'bg-red-100 text-red-700',
    active:   'bg-green-50 text-green-500',
    complete: 'bg-navy-50 text-navy-400',
  };

  const label: Record<string, string> = {
    cut:      'CUT',
    wd:       'WD',
    dq:       'DQ',
    active:   'Active',
    complete: 'F',
  };

  return (
    <span
      className={cn(
        'inline-block text-2xs font-semibold px-1.5 py-0.5 rounded-sm uppercase tracking-wider',
        map[status] ?? 'bg-neutral-100 text-neutral-500',
        className,
      )}
    >
      {label[status] ?? status}
    </span>
  );
}
