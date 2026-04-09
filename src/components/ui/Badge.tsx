import { cn } from '@/utils/cn';
import type { PlayerStatus } from '@/types/scoring';

interface BadgeProps {
  status: PlayerStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  const map: Record<string, string> = {
    cut: 'bg-orange-100 text-orange-700',
    wd: 'bg-gray-100 text-gray-600',
    dq: 'bg-red-100 text-red-700',
    active: 'bg-green-100 text-green-700',
    complete: 'bg-blue-100 text-blue-700',
  };

  const label: Record<string, string> = {
    cut: 'CUT',
    wd: 'WD',
    dq: 'DQ',
    active: 'Active',
    complete: 'F',
  };

  return (
    <span
      className={cn(
        'inline-block text-xs font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide',
        map[status] ?? 'bg-gray-100 text-gray-500',
        className,
      )}
    >
      {label[status] ?? status}
    </span>
  );
}
