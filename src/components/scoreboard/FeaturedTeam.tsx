import type { TeamResult } from '@/lib/scoring/fantasyEngine';
import { formatToPar, scoreClass } from '@/utils/scoring';
import { cn } from '@/utils/cn';

interface FeaturedTeamProps {
  team: TeamResult;
}

/**
 * "Your Card" hero block above the standings list.
 * Two-column grid: team name / stats on the left, three-row roster on the right.
 */
export function FeaturedTeam({ team }: FeaturedTeamProps) {
  const todayTotal = team.golfers.reduce(
    (s, g) => s + (Number.isFinite(g.todayScore) ? g.todayScore : 0),
    0,
  );
  const rankDisplay = team.isTied ? `T${team.rank}` : String(team.rank);

  return (
    <section
      className="relative border my-6"
      style={{
        borderColor: 'var(--hairline)',
        background: 'var(--surface)',
      }}
    >
      <CornerFlourish className="top-2 left-2 rotate-0" />
      <CornerFlourish className="top-2 right-2 rotate-90" />
      <CornerFlourish className="bottom-2 left-2 -rotate-90" />
      <CornerFlourish className="bottom-2 right-2 rotate-180" />

      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1.4fr]">
        {/* Left — team stats */}
        <div className="relative p-6 sm:p-9 overflow-hidden">
          <HoleSilhouette />
          <div className="relative">
            <div
              className="smallcaps text-[10px] flex items-center gap-2"
              style={{ color: 'var(--brass)' }}
            >
              <span className="brass-diamond" />
              Your Card
            </div>

            <h2
              className="font-serif italic mt-3"
              style={{
                fontSize: 'clamp(32px, 5vw, 46px)',
                fontWeight: 300,
                lineHeight: 1.0,
                letterSpacing: '-0.025em',
                color: 'var(--ink)',
              }}
            >
              {team.teamName}
            </h2>

            <div
              className="grid grid-cols-3 gap-4 mt-7 pt-5 border-t"
              style={{ borderColor: 'var(--hairline-soft)' }}
            >
              <Stat label="Position">
                <span
                  className="font-serif italic"
                  style={{ fontSize: 'clamp(28px, 4vw, 38px)', color: 'var(--ink)', fontWeight: 300 }}
                >
                  {rankDisplay}
                </span>
              </Stat>
              <Stat label="Total">
                <span
                  className={cn('font-serif italic', scoreClass(team.totalScore))}
                  style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 300 }}
                >
                  {formatToPar(team.totalScore)}
                </span>
              </Stat>
              <Stat label="Today">
                <span
                  className={cn('font-serif italic', scoreClass(todayTotal))}
                  style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 300 }}
                >
                  {formatToPar(todayTotal)}
                </span>
              </Stat>
            </div>
          </div>
        </div>

        {/* Right — the roster */}
        <div
          className="p-6 sm:p-9 border-t md:border-t-0 md:border-l"
          style={{
            background: 'var(--surface-2)',
            borderColor: 'var(--hairline-soft)',
          }}
        >
          <div className="flex items-baseline justify-between">
            <span className="smallcaps text-[10px]" style={{ color: 'var(--muted)' }}>
              The Roster
            </span>
            <span
              className="font-serif italic text-[12px]"
              style={{ color: 'var(--muted)' }}
            >
              three golfers · cumulative
            </span>
          </div>

          <div className="mt-3">
            {team.golfers.map((g, i) => (
              <div
                key={g.id}
                className={cn(
                  'grid items-center gap-3 py-3',
                  'grid-cols-[28px_1fr_auto_auto] sm:grid-cols-[36px_1fr_64px_64px_70px]',
                  i > 0 && 'border-t',
                )}
                style={{ borderColor: 'var(--hairline-soft)' }}
              >
                {/* Position */}
                <div
                  className="font-serif italic text-center"
                  style={{ fontSize: '16px', color: 'var(--brass)' }}
                >
                  {g.position}
                </div>
                {/* Name + status */}
                <div className="min-w-0">
                  <div
                    className="font-serif truncate"
                    style={{ fontSize: '16px', color: 'var(--ink)' }}
                  >
                    {g.name}
                  </div>
                  {g.status !== 'active' && (
                    <div
                      className="smallcaps text-[9px] mt-0.5"
                      style={{ color: 'var(--muted)' }}
                    >
                      {g.status.toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Today */}
                <div className={cn('text-right text-[13px]', scoreClass(g.todayScore))}>
                  {formatToPar(g.todayScore)}
                  <span className="ml-1 text-[10px]" style={{ color: 'var(--muted)' }}>td</span>
                </div>
                {/* Total */}
                <div
                  className={cn('text-right text-[18px] font-semibold', scoreClass(g.totalScore))}
                >
                  {formatToPar(g.totalScore)}
                </div>
                {/* Thru — desktop only */}
                <div
                  className="hidden sm:block text-right font-score text-[12px]"
                  style={{ color: 'var(--muted)' }}
                >
                  {g.thru === 'F' ? `R1 ${g.r1 ?? '—'}` : `thru ${g.thru}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="smallcaps text-[10px]" style={{ color: 'var(--muted)' }}>
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function CornerFlourish({ className }: { className?: string }) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      className={cn('absolute pointer-events-none', className)}
      style={{ color: 'var(--brass)', opacity: 0.55 }}
    >
      <path
        d="M2 2 L 14 2 M 2 2 L 2 14"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="2" cy="2" r="1.6" fill="currentColor" />
      <path
        d="M5 5 Q 8 5 8 8"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}

function HoleSilhouette() {
  return (
    <svg
      viewBox="0 0 600 280"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ color: 'var(--ink)', opacity: 0.07 }}
      aria-hidden="true"
    >
      <path
        d="M0 220 Q 150 170 320 195 Q 480 220 600 188 L 600 280 L 0 280 Z"
        fill="currentColor"
      />
      <ellipse cx="430" cy="205" rx="105" ry="22" fill="currentColor" opacity="0.5" />
      <path
        d="M50 280 Q 220 240 430 215 L 600 230 L 600 280 L 50 280 Z"
        fill="currentColor"
        opacity="0.35"
      />
      <ellipse cx="350" cy="220" rx="32" ry="6" fill="currentColor" opacity="0.18" />
      <line x1="430" y1="160" x2="430" y2="208" stroke="currentColor" strokeWidth="1.5" />
      <path d="M430 162 L 452 168 L 430 178 Z" fill="currentColor" />
      <g opacity="0.45">
        <ellipse cx="60" cy="195" rx="20" ry="32" fill="currentColor" />
        <ellipse cx="100" cy="200" rx="14" ry="22" fill="currentColor" />
        <ellipse cx="540" cy="175" rx="22" ry="36" fill="currentColor" />
        <ellipse cx="580" cy="182" rx="14" ry="22" fill="currentColor" />
      </g>
    </svg>
  );
}
