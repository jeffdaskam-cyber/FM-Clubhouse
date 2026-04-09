export type PlayerStatus = 'active' | 'cut' | 'wd' | 'dq' | 'complete';

export interface NormalizedPlayer {
  playerId: string;
  playerName: string;
  position: string;           // "T3", "1", "CUT", "WD"
  totalToPar: number;
  todaysScore: number | null;
  thru: string;               // "F", "9", "-"
  roundScores: (number | null)[]; // [r1, r2, r3, r4]
  status: PlayerStatus;
  totalStrokes: number | null;
  officialFinishPosition: number | null; // numeric, null until final
}

export interface FieldPlayer {
  playerId: string;
  playerName: string;
  countryCode: string;
  worldRanking?: number;
}

export interface ScoringCacheDoc {
  tournamentId: string;
  fetchedAt: string; // ISO string
  players: NormalizedPlayer[];
  roundStatus: 'not_started' | 'in_progress' | 'complete';
  currentRound: number;
}
