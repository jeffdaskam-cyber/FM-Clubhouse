export interface AgentExportWeather {
  fetchedAt: string;
  temperatureF: number;
  windSpeedMph: number;
  windDirection: string;
  conditionDescription: string;
  precipitationInches: number;
  humidity: number;
}

export interface AgentExportGolfer {
  playerId: string;
  playerName: string;
  totalScore: number;
  scoreDisplay: string;
  todayScore: number;
  todayScoreDisplay: string;
  thru: string;
  position: string;
  positionNumeric: number | null;
  roundScores: (number | null)[];
  status: 'active' | 'cut' | 'wd' | 'complete';
}

export interface AgentExportFantasyTeam {
  rank: number;
  teamName: string;
  totalScore: number;
  scoreDisplay: string;
  movementToday: number;
  movementDisplay: string;
  isTied: boolean;
  golfers: AgentExportGolfer[];
}

export interface AgentExportLeaderboardEntry {
  position: string;
  positionNumeric: number | null;
  playerId: string;
  playerName: string;
  totalScore: number;
  scoreDisplay: string;
  todayScore: number;
  todayScoreDisplay: string;
  thru: string;
  roundScores: (number | null)[];
  status: 'active' | 'cut' | 'wd' | 'complete';
}

export interface AgentExportNotableMoment {
  type:
    | 'leaderboard_change'
    | 'big_mover_up'
    | 'big_mover_down'
    | 'cut_made'
    | 'missed_cut'
    | 'withdrawal'
    | 'eagle'
    | 'fantasy_leader_change';
  playerId: string | null;
  playerName: string | null;
  teamName: string | null;
  description: string;
  round: number | null;
}

export interface AgentExportRankChange {
  teamName: string;
  priorRank: number | null;
  currentRank: number;
  delta: number | null;
}

export interface AgentExportMovementSummary {
  priorExportAt: string | null;
  rankChanges: AgentExportRankChange[];
  biggestImprover: string | null;
  biggestDecline: string | null;
}

export interface AgentExportPayload {
  exportedAt: string;
  summaryType: 'daily' | 'final';
  appVersion: string;
  tournament: {
    id: string;
    name: string;
    course: string;
    location: string;
    currentRound: number;
    roundsComplete: number;
    status: 'pre' | 'active' | 'complete';
    parScore: number;
    startDate: string;
    endDate: string;
  };
  weather: AgentExportWeather | null;
  fantasyStandings: AgentExportFantasyTeam[];
  leaderboard: AgentExportLeaderboardEntry[];
  notableMoments: AgentExportNotableMoment[];
  fantasyMovementSummary: AgentExportMovementSummary;
}

export interface ExportMeta {
  lastExportAt: string;
  fantasyRanks: Record<string, number>;
  leaderboardPositions: Record<string, number>;
  leaderboardLeader: string | null;
  fantasyLeader: string | null;
  playerStatuses: Record<string, string>;
}
