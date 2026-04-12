import type { PlayerScore } from './types';

export interface TeamResult {
  teamId:      string;
  teamName:    string;
  golferIds:   string[];
  golfers:     PlayerScore[];
  totalScore:  number;
  rank:        number;
  isTied:      boolean;
}

/** Resolve golfer IDs against live leaderboard data */
export function resolveTeamGolfers(
  golferIds: string[],
  players: PlayerScore[]
): PlayerScore[] {
  const byId = new Map(players.map(p => [p.id, p]));
  return golferIds.map(id => byId.get(id) ?? {
    id,
    name:           id,
    position:       '-',
    totalScore:     0,
    todayScore:     0,
    thru:           '-',
    r1: null, r2: null, r3: null, r4: null,
    totalStrokes:   null,
    status:         'active' as const,
    finishPosition: 9999,
  });
}

/** Team total = sum of all 3 golfer scores.
 *  Guards against NaN in case a golfer's totalScore was not cleanly parsed
 *  (e.g. a MC/WD player whose sheet cell contained non-numeric text). */
export function calcTeamTotal(golfers: PlayerScore[]): number {
  return golfers.reduce((sum, g) => {
    const score = Number.isFinite(g.totalScore) ? g.totalScore : 0;
    return sum + score;
  }, 0);
}

/**
 * Rank teams with tiebreaker rules:
 *   1. Lowest total score wins
 *   2. Tie → best single finishing position (lowest number)
 *   3. Tie → compare next-best finisher
 *   4. Still tied → teams remain tied
 */
export function rankTeams(teams: Omit<TeamResult, 'rank' | 'isTied'>[]): TeamResult[] {
  const sorted = [...teams].sort((a, b) => {
    if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore;

    const aPos = a.golfers.map(g => g.finishPosition).sort((x, y) => x - y);
    const bPos = b.golfers.map(g => g.finishPosition).sort((x, y) => x - y);
    for (let i = 0; i < Math.min(aPos.length, bPos.length); i++) {
      if (aPos[i] !== bPos[i]) return aPos[i] - bPos[i];
    }
    return 0;
  });

  const ranked: TeamResult[] = [];
  let rank = 1;
  for (let i = 0; i < sorted.length; i++) {
    const prev = ranked[i - 1];
    const cur  = sorted[i];
    const tied = prev
      ? prev.totalScore === cur.totalScore &&
        JSON.stringify(prev.golfers.map(g => g.finishPosition).sort()) ===
        JSON.stringify(cur.golfers.map(g => g.finishPosition).sort())
      : false;

    const assignedRank = tied ? prev!.rank : rank;
    ranked.push({ ...cur, rank: assignedRank, isTied: tied });
    if (!tied) rank = i + 2;
  }

  // Back-fill isTied for the first in each tied group
  for (let i = 0; i < ranked.length - 1; i++) {
    if (ranked[i].rank === ranked[i + 1].rank) {
      ranked[i] = { ...ranked[i], isTied: true };
    }
  }

  return ranked;
}

export interface RawTeam {
  teamId:    string;
  teamName:  string;
  golferIds: string[];
}

/** Master helper: raw team records + live players → fully ranked results */
export function buildFantasyStandings(
  rawTeams: RawTeam[],
  players:  PlayerScore[]
): TeamResult[] {
  const withScores = rawTeams.map(t => {
    const golfers    = resolveTeamGolfers(t.golferIds, players);
    const totalScore = calcTeamTotal(golfers);
    return { ...t, golfers, totalScore };
  });
  return rankTeams(withScores);
}
