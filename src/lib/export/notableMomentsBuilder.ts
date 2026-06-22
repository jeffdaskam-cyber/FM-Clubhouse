import type { PlayerScore } from '@/lib/scoring/types';
import type { TeamResult } from '@/lib/scoring/fantasyEngine';
import type { ExportMeta, AgentExportNotableMoment } from './types';

interface BuildInput {
  leaderboard: PlayerScore[];
  fantasyStandings: TeamResult[];
  priorMeta: ExportMeta | null;
}

export function buildNotableMoments({ leaderboard, fantasyStandings, priorMeta }: BuildInput): AgentExportNotableMoment[] {
  const moments: AgentExportNotableMoment[] = [];

  const currentLeader = leaderboard.find(p => p.position === '1' || p.position === 'T1');
  if (currentLeader && priorMeta && priorMeta.leaderboardLeader !== currentLeader.id) {
    moments.push({
      type: 'leaderboard_change',
      playerId: currentLeader.id,
      playerName: currentLeader.name,
      teamName: null,
      description: `${currentLeader.name} moved to ${formatScore(currentLeader.totalScore)}, taking the lead`,
      round: null,
    });
  }

  const fantasyLeader = fantasyStandings.find(t => t.rank === 1);
  if (fantasyLeader && priorMeta && priorMeta.fantasyLeader !== fantasyLeader.teamName) {
    moments.push({
      type: 'fantasy_leader_change',
      playerId: null,
      playerName: null,
      teamName: fantasyLeader.teamName,
      description: `${fantasyLeader.teamName} took the fantasy lead at ${formatScore(fantasyLeader.totalScore)}`,
      round: null,
    });
  }

  if (priorMeta) {
    for (const player of leaderboard) {
      const priorPos = priorMeta.leaderboardPositions[player.id];
      if (priorPos == null) continue;
      const currentPos = player.finishPosition;
      const delta = priorPos - currentPos;

      if (delta >= 5) {
        moments.push({
          type: 'big_mover_up',
          playerId: player.id,
          playerName: player.name,
          teamName: null,
          description: `${player.name} rose ${delta} positions to ${player.position}`,
          round: null,
        });
      } else if (delta <= -5) {
        moments.push({
          type: 'big_mover_down',
          playerId: player.id,
          playerName: player.name,
          teamName: null,
          description: `${player.name} fell ${Math.abs(delta)} positions to ${player.position}`,
          round: null,
        });
      }
    }

    for (const player of leaderboard) {
      const priorStatus = priorMeta.playerStatuses[player.id];
      if (priorStatus === player.status) continue;

      if (player.status === 'cut' && priorStatus && priorStatus !== 'cut') {
        moments.push({
          type: 'missed_cut',
          playerId: player.id,
          playerName: player.name,
          teamName: null,
          description: `${player.name} missed the cut at ${formatScore(player.totalScore)}`,
          round: null,
        });
      }

      if (player.status === 'wd' && priorStatus && priorStatus !== 'wd') {
        moments.push({
          type: 'withdrawal',
          playerId: player.id,
          playerName: player.name,
          teamName: null,
          description: `${player.name} withdrew from the tournament`,
          round: null,
        });
      }
    }
  }

  return moments;
}

function formatScore(score: number): string {
  if (score === 0) return 'E';
  if (score > 0) return `+${score}`;
  return String(score);
}
