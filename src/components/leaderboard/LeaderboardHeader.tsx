/**
 * Editorial leaderboard header — 10-column hairline strip.
 * Columns: Pos · Player · To Par · Today · Thru · R1 · R2 · R3 · R4 · Strokes.
 */
export function LeaderboardHeader() {
  return (
    <div
      className="hidden md:grid grid-cols-[48px_1fr_70px_64px_56px_48px_48px_48px_48px_64px] gap-2 px-4 sm:px-6 py-3 border-b smallcaps text-[10px]"
      style={{
        background: 'var(--paper-warm)',
        borderColor: 'var(--hairline)',
        color: 'var(--muted)',
      }}
    >
      <span className="text-right">Pos</span>
      <span>Player</span>
      <span className="text-right">To Par</span>
      <span className="text-right">Today</span>
      <span className="text-right">Thru</span>
      <span className="text-right">R1</span>
      <span className="text-right">R2</span>
      <span className="text-right">R3</span>
      <span className="text-right">R4</span>
      <span className="text-right">Strokes</span>
    </div>
  );
}
