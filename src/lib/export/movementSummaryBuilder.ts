import type { TeamResult } from '@/lib/scoring/fantasyEngine';
import type { ExportMeta, AgentExportMovementSummary } from './types';

interface BuildInput {
  fantasyStandings: TeamResult[];
  priorMeta: ExportMeta | null;
}

export function buildFantasyMovementSummary({ fantasyStandings, priorMeta }: BuildInput): AgentExportMovementSummary {
  if (!priorMeta) {
    return {
      priorExportAt: null,
      rankChanges: fantasyStandings.map(t => ({
        teamName: t.teamName,
        priorRank: null,
        currentRank: t.rank,
        delta: null,
      })),
      biggestImprover: null,
      biggestDecline: null,
    };
  }

  const rankChanges = fantasyStandings.map(t => {
    const priorRank = priorMeta.fantasyRanks[t.teamName] ?? null;
    const delta = priorRank != null ? priorRank - t.rank : null;
    return {
      teamName: t.teamName,
      priorRank,
      currentRank: t.rank,
      delta,
    };
  });

  let biggestImprover: string | null = null;
  let biggestDecline: string | null = null;
  let maxUp = 0;
  let maxDown = 0;

  for (const rc of rankChanges) {
    if (rc.delta == null) continue;
    if (rc.delta > maxUp) {
      maxUp = rc.delta;
      biggestImprover = rc.teamName;
    }
    if (rc.delta < maxDown) {
      maxDown = rc.delta;
      biggestDecline = rc.teamName;
    }
  }

  return {
    priorExportAt: priorMeta.lastExportAt,
    rankChanges,
    biggestImprover,
    biggestDecline,
  };
}
