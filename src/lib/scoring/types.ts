export type PlayerStatus = 'active' | 'cut' | 'wd' | 'complete';

export interface PlayerScore {
  id: string;           // slugified player name used as stable key
  name: string;
  position: string;     // e.g. "T1", "T3", "89"
  totalScore: number;   // numeric, relative to par (e.g. -5, 0, +3)
  todayScore: number;
  thru: string;         // "F", "17", "-"
  r1: number | null;
  r2: number | null;
  r3: number | null;
  r4: number | null;
  totalStrokes: number | null;
  status: PlayerStatus;
  // Numeric finishing position for tiebreaker logic (strips "T", parses int)
  finishPosition: number;
}
