import type { Tournament } from '@/types/tournament';
import type { PlayerScore } from '@/lib/scoring';
import { useWeather } from '@/hooks/useWeather';
import { formatToPar, scoreClass, windDirectionLabel } from '@/utils/scoring';

interface LiveStripProps {
  tournament: Tournament | null;
  leader: PlayerScore | null;
  lastUpdated?: Date | null;
}

/**
 * Four-column hairline strip: Round in play · Clubhouse Lead · Cut Projection · Conditions.
 * Columns gracefully degrade when data isn't available.
 */
export function LiveStrip({ tournament, leader, lastUpdated }: LiveStripProps) {
  const { data: weather } = useWeather(tournament?.lat ?? null, tournament?.lon ?? null);

  const round = inferRound(leader);
  const lastUpdatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : null;

  return (
    <section
      className="border-t border-b"
      style={{
        background: 'var(--paper-warm)',
        borderColor: 'var(--hairline)',
      }}
    >
      <div className="max-w-[1280px] mx-auto grid grid-cols-2 lg:grid-cols-4">
        <Cell label="Round in play" divider>
          <span className="font-serif italic" style={{ fontSize: '18px', color: 'var(--ink)' }}>
            {round.label}
          </span>
          {lastUpdatedLabel && (
            <span className="ml-2 text-[12px]" style={{ color: 'var(--muted)' }}>
              — Updated {lastUpdatedLabel}
            </span>
          )}
        </Cell>

        <Cell label="Clubhouse Lead" divider>
          {leader ? (
            <span style={{ color: 'var(--ink)' }}>
              <span className="font-serif italic" style={{ fontSize: '18px' }}>
                {leader.name}
              </span>
              <span className={`ml-2 ${scoreClass(leader.totalScore)}`} style={{ fontWeight: 600 }}>
                {formatToPar(leader.totalScore)}
              </span>
            </span>
          ) : (
            <span className="font-serif italic" style={{ fontSize: '18px', color: 'var(--muted)' }}>
              Awaiting tee times
            </span>
          )}
        </Cell>

        <Cell label="Cut Projection" divider>
          <span className="font-serif italic" style={{ fontSize: '18px', color: 'var(--ink)' }}>
            +3
          </span>
          <span className="ml-2 text-[12px]" style={{ color: 'var(--muted)' }}>
            after R2 · top 70 &amp; ties
          </span>
        </Cell>

        <Cell label="Conditions">
          {weather ? (
            <>
              <span className="font-serif italic" style={{ fontSize: '18px', color: 'var(--ink)' }}>
                {Math.round(weather.temperature)}°F · {weather.description}
              </span>
              <span className="ml-2 text-[12px]" style={{ color: 'var(--muted)' }}>
                {Math.round(weather.windSpeed)} mph {windDirectionLabel(weather.windDirection)}
              </span>
            </>
          ) : (
            <span className="font-serif italic" style={{ fontSize: '18px', color: 'var(--muted)' }}>
              —
            </span>
          )}
        </Cell>
      </div>
    </section>
  );
}

function Cell({
  label,
  children,
  divider,
}: {
  label: string;
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <div
      className={`px-5 py-4 sm:px-6 sm:py-5 ${divider ? 'lg:border-r' : ''}`}
      style={{ borderColor: 'var(--hairline-soft)' }}
    >
      <div className="smallcaps text-[10px]" style={{ color: 'var(--muted)' }}>
        {label}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function inferRound(leader: PlayerScore | null): { label: string; n: number } {
  if (!leader) return { label: 'Round I', n: 1 };
  const rounds = [leader.r1, leader.r2, leader.r3, leader.r4];
  const playedThrough = rounds.findIndex(r => r === null);
  const n = playedThrough === -1 ? 4 : Math.max(1, playedThrough + 1);
  const roman = ['I', 'II', 'III', 'IV'][n - 1] ?? 'I';
  return { label: `Round ${roman}`, n };
}
