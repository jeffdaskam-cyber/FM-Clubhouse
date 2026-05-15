import { useState } from 'react';
import type { TeamResult } from '@/lib/scoring/fantasyEngine';
import { formatToPar, scoreClass } from '@/utils/scoring';
import { TeamScoreTable } from './TeamScoreTable';
import { cn } from '@/utils/cn';

interface TeamCardProps {
  team: TeamResult;
  isCurrentUser?: boolean;
}

/**
 * Editorial "StandingsRow" — five-column grid with leader/your-team rails
 * and click-to-expand detail cards.
 */
export function TeamCard({ team, isCurrentUser = false }: TeamCardProps) {
  const [expanded, setExpanded] = useState(false);
  const rankDisplay = team.isTied ? `T${team.rank}` : String(team.rank);
  const isLeader = team.rank === 1;

  const todayTotal = team.golfers.reduce(
    (s, g) => s + (Number.isFinite(g.todayScore) ? g.todayScore : 0),
    0,
  );

  return (
    <div
      className={cn(
        'relative border-b last:border-b-0 transition-colors cursor-pointer',
        'hover:bg-[var(--surface-2)]',
        isLeader && 'bg-[var(--gold-tint)]',
        !isLeader && isCurrentUser && 'bg-[linear-gradient(90deg,rgba(176,138,30,0.06),transparent_40%)]',
      )}
      style={{ borderColor: 'var(--hairline-soft)' }}
      onClick={() => setExpanded(v => !v)}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setExpanded(v => !v);
        }
      }}
    >
      {/* Leader / your-team left rail */}
      {isLeader && (
        <span
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{
            background:
              'linear-gradient(180deg, var(--brass-bright), var(--brass))',
          }}
        />
      )}
      {!isLeader && isCurrentUser && (
        <span
          className="absolute left-0 top-0 bottom-0 w-[2px]"
          style={{ background: 'var(--green-mid)' }}
        />
      )}

      {/* Row */}
      <div
        className={cn(
          'grid items-center gap-3 px-4 sm:px-6 py-4',
          // mobile: 3 columns; desktop: 5 columns with explicit widths
          'grid-cols-[48px_1fr_auto] sm:grid-cols-[56px_1fr_220px_90px_110px]',
        )}
      >
        {/* Rank */}
        <div
          className={cn(
            'font-serif italic font-light text-center',
            'text-[24px] sm:text-[30px]',
          )}
          style={{ color: isLeader ? 'var(--brass)' : 'var(--ink)' }}
        >
          {rankDisplay}
        </div>

        {/* Team name + badges */}
        <div className="min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <span
              className="font-serif"
              style={{ fontSize: '20px', color: 'var(--ink)', letterSpacing: '-0.01em' }}
            >
              {team.teamName}
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
                Leader
              </span>
            )}
            {isCurrentUser && !isLeader && (
              <span
                className="smallcaps text-[9px] px-2 py-0.5 rounded-full border"
                style={{
                  borderColor: 'var(--green-mid)',
                  color: 'var(--green-mid)',
                }}
              >
                Your Team
              </span>
            )}
          </div>
          <div
            className="smallcaps text-[10px] mt-1"
            style={{ color: 'var(--muted)' }}
          >
            {team.golfers.length} Golfers
          </div>
        </div>

        {/* Golfer pips — hidden on mobile */}
        <div className="hidden sm:flex items-stretch gap-1.5">
          {team.golfers.map(g => (
            <div
              key={g.id}
              className="flex-1 px-2 py-1.5 border text-center"
              style={{
                borderColor: 'var(--hairline)',
                background: 'var(--paper-warm)',
                minWidth: 0,
              }}
              title={g.name}
            >
              <div
                className="text-[11px] font-medium truncate"
                style={{ color: 'var(--ink)' }}
              >
                {lastName(g.name)}
              </div>
              <div
                className={cn('text-[12px] font-semibold mt-0.5', scoreClass(g.totalScore))}
              >
                {formatToPar(g.totalScore)}
              </div>
            </div>
          ))}
        </div>

        {/* Today — hidden on mobile */}
        <div className="hidden sm:block">
          <div
            className="smallcaps text-[10px]"
            style={{ color: 'var(--muted)' }}
          >
            Today
          </div>
          <div className={cn('text-[15px] font-semibold mt-0.5', scoreClass(todayTotal))}>
            {formatToPar(todayTotal)}
          </div>
        </div>

        {/* Total */}
        <div
          className={cn(
            'font-serif italic text-right',
            'text-[26px] sm:text-[36px]',
            scoreClass(team.totalScore),
          )}
          style={{ letterSpacing: '-0.02em', fontWeight: 300 }}
        >
          {formatToPar(team.totalScore)}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div
          className="px-4 sm:px-6 pb-5 pt-1"
          style={{ background: 'var(--paper-warm)', borderTop: '1px solid var(--hairline-soft)' }}
          onClick={e => e.stopPropagation()}
        >
          <TeamScoreTable team={team} />
        </div>
      )}
    </div>
  );
}

function lastName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? name : parts[parts.length - 1];
}
