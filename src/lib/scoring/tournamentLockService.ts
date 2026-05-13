import {
  doc, collection, getDocs, writeBatch, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { fetchLeaderboard } from './googleSheetsProvider';
import type { PlayerScore } from './types';
import type { TeamResult } from './fantasyEngine';

export interface FantasySnapshotEntry {
  teamId: string;
  teamName: string;
  totalScore: number;
  rank: number;
  ownerUid: string | null;
  golfers: {
    id: string;
    name: string;
    score: number;
    pos: string;
  }[];
  snapshotIndex: number;
}

export interface LeaderboardSnapshotEntry extends PlayerScore {
  snapshotIndex: number;
}

export interface LockResult {
  success: boolean;
  rowCount: number;
  error?: string;
}

export function buildFantasySnapshot(standings: TeamResult[]): FantasySnapshotEntry[] {
  return standings.map((t, i) => ({
    teamId: t.teamId,
    teamName: t.teamName,
    totalScore: t.totalScore,
    rank: t.rank,
    ownerUid: t.ownerUid,
    golfers: t.golfers.map(g => ({
      id: g.id,
      name: g.name,
      score: Number.isFinite(g.totalScore) ? g.totalScore : 0,
      pos: g.position || '-',
    })),
    snapshotIndex: i,
  }));
}

export async function lockTournamentScores(
  tournamentId: string,
  fantasyTeams: FantasySnapshotEntry[],
): Promise<LockResult> {
  try {
    const rows = await fetchLeaderboard();
    if (!rows || rows.length === 0) {
      return { success: false, rowCount: 0, error: 'No leaderboard data found in Sheet.' };
    }

    const batch = writeBatch(db);

    const tournamentRef = doc(db, 'tournaments', tournamentId);
    batch.update(tournamentRef, {
      status: 'completed',
      scoresLockedAt: serverTimestamp(),
    });

    rows.forEach((row, index) => {
      const entryRef = doc(db, 'tournaments', tournamentId, 'leaderboardSnapshot', row.id || `row-${index}`);
      batch.set(entryRef, { ...row, snapshotIndex: index });
    });

    fantasyTeams.forEach((team) => {
      const teamRef = doc(db, 'tournaments', tournamentId, 'fantasySnapshot', team.teamId);
      batch.set(teamRef, team);
    });

    await batch.commit();
    return { success: true, rowCount: rows.length };
  } catch (err) {
    console.error('lockTournamentScores failed:', err);
    return {
      success: false,
      rowCount: 0,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function fetchLeaderboardSnapshot(tournamentId: string): Promise<PlayerScore[]> {
  const q = query(
    collection(db, 'tournaments', tournamentId, 'leaderboardSnapshot'),
    orderBy('snapshotIndex', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data() as LeaderboardSnapshotEntry;
    // Strip snapshotIndex; remainder matches PlayerScore shape
    const { snapshotIndex: _omit, ...player } = data;
    void _omit;
    return player as PlayerScore;
  });
}

export async function fetchFantasySnapshot(tournamentId: string): Promise<FantasySnapshotEntry[]> {
  const q = query(
    collection(db, 'tournaments', tournamentId, 'fantasySnapshot'),
    orderBy('snapshotIndex', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as FantasySnapshotEntry);
}
