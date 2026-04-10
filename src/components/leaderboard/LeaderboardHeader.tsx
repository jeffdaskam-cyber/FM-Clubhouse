export function LeaderboardHeader() {
  return (
    <div className="hidden md:grid grid-cols-[3rem_1fr_5rem_5rem_5rem_4rem_4rem_4rem_4rem_5rem] gap-2 px-4 py-2 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wide rounded-t-xl">
      <span className="text-right">Pos</span>
      <span>Player</span>
      <span className="text-right">Total</span>
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
