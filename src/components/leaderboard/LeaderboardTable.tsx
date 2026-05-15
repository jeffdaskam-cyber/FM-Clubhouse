import type { PlayerScore } from '@/lib/scoring';
import { LeaderboardHeader } from './LeaderboardHeader';
import { LeaderboardRow } from './LeaderboardRow';

interface LeaderboardTableProps {
  players: PlayerScore[];
  /** Any golfer on any fantasy roster — gets a green dot indicator. */
  rosteredPlayerIds?: Set<string>;
  /** Golfers on the current user's team — gets a green left rail + tint. */
  yourGolferIds?: Set<string>;
  /** Projected cut line; rendered as a hairline divider after the row that crosses it. */
  cutLine?: number;
  cutDescription?: string;
}

export function LeaderboardTable({
  players,
  rosteredPlayerIds,
  yourGolferIds,
  cutLine,
  cutDescription = 'top 70 & ties advance',
}: LeaderboardTableProps) {
  // Cutline insertion point — index of the first player whose total exceeds the cut.
  const cutIndex =
    cutLine === undefined
      ? -1
      : players.findIndex(p => p.totalScore > cutLine);

  return (
    <section
      className="border"
      style={{ borderColor: 'var(--hairline)', background: 'var(--surface)' }}
    >
      <LeaderboardHeader />
      {players.map((player, i) => {
        const isLeader = i === 0;
        const isRostered = rosteredPlayerIds?.has(player.id) ?? false;
        const isYours = yourGolferIds?.has(player.id) ?? false;
        return (
          <div key={player.id}>
            {cutIndex >= 0 && i === cutIndex && (
              <CutlineDivider cutLine={cutLine!} description={cutDescription} />
            )}
            <LeaderboardRow
              player={player}
              isLeader={isLeader}
              isRostered={isRostered}
              isYours={isYours}
              zebra={i % 2 === 1}
            />
          </div>
        );
      })}
    </section>
  );
}

function CutlineDivider({ cutLine, description }: { cutLine: number; description: string }) {
  const formatted = cutLine === 0 ? 'E' : cutLine > 0 ? `+${cutLine}` : String(cutLine);
  return (
    <div
      className="flex items-center gap-4 px-4 sm:px-6 py-3"
      style={{ background: 'var(--paper-warm)' }}
    >
      <div className="flex-1 h-px" style={{ background: 'var(--brass)' }} />
      <div className="flex items-center gap-3 smallcaps text-[10px]" style={{ color: 'var(--brass)' }}>
        <span className="brass-diamond" />
        Projected Cut Line · {formatted} · {description}
        <span className="brass-diamond" />
      </div>
      <div className="flex-1 h-px" style={{ background: 'var(--brass)' }} />
    </div>
  );
}
