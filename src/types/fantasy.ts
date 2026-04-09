export interface FantasyTeam {
  id: string;
  leagueId: string;
  tournamentId: string;
  name: string;
  golferIds: [string, string, string];
  computedTotalToPar: number;
  computedRank: number;
  frozenGolferIds: string[];
  frozenScores: Record<string, number>;
  updatedAt: string; // ISO string
}

export interface FantasyLeague {
  id: string;
  tournamentId: string;
  name: string;
  createdAt: string;
  isLocked: boolean;
  teamCount: number;
}

export interface RankedTeam extends FantasyTeam {
  rank: number;
  rankDisplay: string; // "1", "T2"
}

export interface TeamDraft {
  name: string;
  golferIds: (string | null)[];
}
