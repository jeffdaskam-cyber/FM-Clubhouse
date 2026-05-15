import type { PlayerScore } from '@/lib/scoring';
import { formatToPar, scoreClass } from '@/utils/scoring';
import { StatusBadge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

interface LeaderboardRowProps {
  player: PlayerScore;
  isLeader?: boolean;
  isRostered?: boolean;
  isYours?: boolean;
  zebra?: boolean;
}

function RoundCell({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="text-right font-score text-[14px]" style={{ color: 'var(--hairline)' }}>
        —
      </span>
    );
  }
  return (
    <span
      className="text-right font-score text-[14px]"
      style={{ color: 'var(--ink)' }}
    >
      {score}
    </span>
  );
}

export function LeaderboardRow({
  player,
  isLeader,
  isRostered,
  isYours,
  zebra,
}: LeaderboardRowProps) {
  const isActive = player.status === 'active';

  // Background priority: leader > yours > rostered > zebra
  const rowBg = isLeader
    ? 'var(--gold-tint)'
    : isYours
    ? 'var(--green-tint)'
    : isRostered
    ? 'var(--green-tint)'
    : zebra
    ? 'var(--surface-2)'
    : 'var(--surface)';

  return (
    <>
      {/* Desktop row */}
      <div
        className="hidden md:grid relative grid-cols-[48px_1fr_70px_64px_56px_48px_48px_48px_48px_64px] gap-2 px-4 sm:px-6 py-3 border-b items-center text-[14px]"
        style={{
          background: rowBg,
          borderColor: 'var(--hairline-soft)',
        }}
      >
        {/* Leader brass rail */}
        {isLeader && (
          <span
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{
              background:
                'linear-gradient(180deg, var(--brass-bright), var(--brass))',
            }}
          />
        )}
        {/* Your-team green rail */}
        {!isLeader && isYours && (
          <span
            className="absolute left-0 top-0 bottom-0 w-[2px]"
            style={{ background: 'var(--green-mid)' }}
          />
        )}

        {/* Pos */}
        <span
          className="text-right font-serif italic text-[19px]"
          style={{ color: isLeader ? 'var(--brass)' : 'var(--ink)' }}
        >
          {player.position}
        </span>

        {/* Player */}
        <div className="flex items-center gap-2 min-w-0">
          {isRostered && !isYours && (
            <span
              className="shrink-0 inline-block w-[6px] h-[6px] rounded-full"
              style={{
                background: 'var(--green-mid)',
                boxShadow: '0 0 0 2px var(--green-tint)',
              }}
              aria-label="Rostered"
              title="Rostered"
            />
          )}
          <span
            className="font-serif truncate"
            style={{ fontSize: '17px', color: 'var(--ink)' }}
            title={player.name}
          >
            {player.name}
          </span>
          {isLeader && (
            <span
              className="smallcaps text-[9px] px-2 py-0.5 rounded-full"
              style={{
                background:
                  'linear-gradient(135deg, var(--brass-bright), var(--brass))',
                color: '#1B2A22',
              }}
            >
              Lead
            </span>
          )}
          {!isActive && <StatusBadge status={player.status} />}
        </div>

        {/* To Par */}
        <span className={cn('text-right font-score font-semibold text-[16px]', scoreClass(player.totalScore))}>
          {formatToPar(player.totalScore)}
        </span>

        {/* Today */}
        <span className={cn('text-right font-score', scoreClass(player.todayScore))}>
          {formatToPar(player.todayScore)}
        </span>

        {/* Thru */}
        <span className="text-right font-score" style={{ color: 'var(--muted)' }}>
          {player.thru}
        </span>

        <RoundCell score={player.r1} />
        <RoundCell score={player.r2} />
        <RoundCell score={player.r3} />
        <RoundCell score={player.r4} />

        {/* Strokes */}
        <span className="text-right font-score text-[14px]" style={{ color: 'var(--muted)' }}>
          {player.totalStrokes ?? '—'}
        </span>
      </div>

      {/* Mobile row */}
      <div
        className="md:hidden relative flex items-center justify-between px-4 py-3 border-b"
        style={{
          background: rowBg,
          borderColor: 'var(--hairline-soft)',
        }}
      >
        {isLeader && (
          <span
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{
              background:
                'linear-gradient(180deg, var(--brass-bright), var(--brass))',
            }}
          />
        )}
        {!isLeader && isYours && (
          <span
            className="absolute left-0 top-0 bottom-0 w-[2px]"
            style={{ background: 'var(--green-mid)' }}
          />
        )}
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="font-serif italic text-[17px] w-8 text-right shrink-0"
            style={{ color: isLeader ? 'var(--brass)' : 'var(--ink)' }}
          >
            {player.position}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {isRostered && !isYours && (
                <span
                  className="shrink-0 inline-block w-[6px] h-[6px] rounded-full"
                  style={{ background: 'var(--green-mid)' }}
                />
              )}
              <span
                className="font-serif text-[15px] truncate"
                style={{ color: 'var(--ink)' }}
              >
                {player.name}
              </span>
              {!isActive && <StatusBadge status={player.status} />}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Thru {player.thru} ·{' '}
              <span className={cn('font-score', scoreClass(player.todayScore))}>
                {formatToPar(player.todayScore)}
              </span>{' '}
              today
            </div>
          </div>
        </div>
        <span
          className={cn(
            'font-score text-[18px] font-semibold shrink-0 ml-2',
            scoreClass(player.totalScore),
          )}
        >
          {formatToPar(player.totalScore)}
        </span>
      </div>
    </>
  );
}
