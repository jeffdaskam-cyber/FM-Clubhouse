import type { NormalizedPlayer } from '@/types/scoring';
import type { FantasyTeam, RankedTeam } from '@/types/fantasy';

export function calculateTeamScore(
  team: FantasyTeam,
  cache: NormalizedPlayer[],
): number {
  const playerMap = new Map(cache.map(p => [p.playerId, p]));

  return team.golferIds.reduce((sum, golferId) => {
    // Use frozen score if available
    if (golferId in team.frozenScores) {
      return sum + team.frozenScores[golferId];
    }
    const player = playerMap.get(golferId);
    return sum + (player?.totalToPar ?? 0);
  }, 0);
}

export function shouldFreezeScore(player: NormalizedPlayer): boolean {
  return player.status === 'cut' || player.status === 'wd' || player.status === 'dq';
}

export interface FreezePatch {
  teamId: string;
  playerId: string;
  frozenScore: number;
}

export function applyFreezeUpdates(
  teams: FantasyTeam[],
  cache: NormalizedPlayer[],
): FreezePatch[] {
  const playerMap = new Map(cache.map(p => [p.playerId, p]));
  const patches: FreezePatch[] = [];

  for (const team of teams) {
    for (const golferId of team.golferIds) {
      // Already frozen - skip
      if (golferId in team.frozenScores) continue;
      const player = playerMap.get(golferId);
      if (player && shouldFreezeScore(player)) {
        patches.push({
          teamId: team.id,
          playerId: golferId,
          frozenScore: player.totalToPar,
        });
      }
    }
  }
  return patches;
}

function getBestFinishers(
  team: FantasyTeam,
  cache: NormalizedPlayer[],
): (number | null)[] {
  const playerMap = new Map(cache.map(p => [p.playerId, p]));
  const positions: (number | null)[] = team.golferIds.map(id => {
    const player = playerMap.get(id);
    return player?.officialFinishPosition ?? null;
  });
  // Sort ascending (lower position = better), nulls last
  return positions.sort((a, b) => {
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    return a - b;
  });
}

export function rankTeams(
  teams: FantasyTeam[],
  cache: NormalizedPlayer[],
): RankedTeam[] {
  if (teams.length === 0) return [];

  // Compute scores
  const scored = teams.map(team => ({
    team,
    score: calculateTeamScore(team, cache),
    bestFinishers: getBestFinishers(team, cache),
  }));

  // Sort: lower score wins; tiebreaker by finisher positions
  scored.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    // Tiebreaker: compare best, then 2nd, then 3rd finisher
    for (let i = 0; i < 3; i++) {
      const af = a.bestFinishers[i] ?? Infinity;
      const bf = b.bestFinishers[i] ?? Infinity;
      if (af !== bf) return af - bf;
    }
    return 0;
  });

  // Assign ranks (tied teams get same rank)
  const ranked: RankedTeam[] = [];
  let currentRank = 1;

  for (let i = 0; i < scored.length; i++) {
    const isTied = i > 0 && scored[i].score === scored[i - 1].score &&
      scored[i].bestFinishers.every((f, k) => f === scored[i - 1].bestFinishers[k]);

    if (!isTied && i > 0) currentRank = i + 1;

    const tiedCount = scored.filter(
      (s, j) => j !== i && s.score === scored[i].score &&
        s.bestFinishers.every((f, k) => f === scored[i].bestFinishers[k])
    ).length;

    const hasTie = tiedCount > 0;

    ranked.push({
      ...scored[i].team,
      computedTotalToPar: scored[i].score,
      computedRank: currentRank,
      rank: currentRank,
      rankDisplay: hasTie ? `T${currentRank}` : String(currentRank),
    });
  }

  return ranked;
}
