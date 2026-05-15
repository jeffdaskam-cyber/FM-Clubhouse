import type { TeamResult } from '@/lib/scoring/fantasyEngine';
import type { PlayerScore } from '@/lib/scoring';
import { formatToPar, scoreClass } from '@/utils/scoring';
import { StatusBadge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

interface TeamScoreTableProps {
  team: TeamResult;
}

/**
 * Expanded detail under a StandingsRow: one card per golfer in a 3-column row.
 */
export function TeamScoreTable({ team }: TeamScoreTableProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {team.golfers.map(g => (
        <DetailCard key={g.id} g={g} />
      ))}
    </div>
  );
}

function DetailCard({ g }: { g: PlayerScore }) {
  const isActive = g.status === 'active';

  return (
    <div
      className="relative border p-4"
      style={{ borderColor: 'var(--hairline)', background: 'var(--surface)' }}
    >
      {/* Position, top-right */}
      <div
        className="absolute top-3 right-4 font-serif italic"
        style={{ fontSize: '15px', color: 'var(--brass)' }}
      >
        {g.position}
      </div>

      <div
        className="font-serif pr-12"
        style={{ fontSize: '19px', color: 'var(--ink)', lineHeight: 1.1 }}
      >
        {g.name}
      </div>

      <div
        className="smallcaps text-[10px] mt-1.5 flex items-center gap-2"
        style={{ color: 'var(--muted)' }}
      >
        {!isActive ? (
          <StatusBadge status={g.status} />
        ) : (
          <span>{g.thru === 'F' ? 'Round Complete' : `Through ${g.thru}`}</span>
        )}
      </div>

      <div
        className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t"
        style={{ borderColor: 'var(--hairline-soft)' }}
      >
        <Cell label="Total" value={formatToPar(g.totalScore)} cls={scoreClass(g.totalScore)} />
        <Cell label="Today" value={formatToPar(g.todayScore)} cls={scoreClass(g.todayScore)} />
        <Cell label="R1" value={g.r1 === null ? '—' : String(g.r1)} cls="" plain />
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  cls,
  plain,
}: {
  label: string;
  value: string;
  cls: string;
  plain?: boolean;
}) {
  return (
    <div>
      <div className="smallcaps text-[9px]" style={{ color: 'var(--muted)' }}>
        {label}
      </div>
      <div
        className={cn(
          'text-[15px] mt-0.5 font-semibold',
          plain ? 'font-score' : cls,
        )}
        style={plain ? { color: 'var(--ink)' } : undefined}
      >
        {value}
      </div>
    </div>
  );
}
