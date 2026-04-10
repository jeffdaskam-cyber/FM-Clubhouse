import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, writeBatch, serverTimestamp, type DocumentData,
} from 'firebase/firestore';
import { db } from './config';
import type { FantasyTeam } from '@/types/fantasy';

const COL = 'teams';

function fromDoc(data: Record<string, unknown>, id: string): FantasyTeam {
  return {
    id,
    leagueId: data.leagueId as string,
    tournamentId: data.tournamentId as string,
    name: data.name as string,
    ownerUid: (data.ownerUid as string | null) ?? null,
    golferIds: data.golferIds as [string, string, string],
    computedTotalToPar: (data.computedTotalToPar as number) ?? 0,
    computedRank: (data.computedRank as number) ?? 0,
    frozenGolferIds: (data.frozenGolferIds as string[]) ?? [],
    frozenScores: (data.frozenScores as Record<string, number>) ?? {},
    updatedAt: data.updatedAt
      ? new Date((data.updatedAt as { toDate(): Date }).toDate()).toISOString()
      : new Date().toISOString(),
  };
}

export async function getTeam(id: string): Promise<FantasyTeam | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return fromDoc(snap.data() as Record<string, unknown>, snap.id);
}

export async function getTeamsByLeague(leagueId: string): Promise<FantasyTeam[]> {
  const q = query(collection(db, COL), where('leagueId', '==', leagueId));
  const snap = await getDocs(q);
  return snap.docs.map(d => fromDoc(d.data() as Record<string, unknown>, d.id));
}

export async function getTeamsByTournament(tournamentId: string): Promise<FantasyTeam[]> {
  const q = query(collection(db, COL), where('tournamentId', '==', tournamentId));
  const snap = await getDocs(q);
  return snap.docs.map(d => fromDoc(d.data() as Record<string, unknown>, d.id));
}

export async function createTeam(
  data: Omit<FantasyTeam, 'id' | 'updatedAt' | 'computedTotalToPar' | 'computedRank'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    computedTotalToPar: 0,
    computedRank: 0,
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function saveTeamsBatch(
  teams: Omit<FantasyTeam, 'id' | 'updatedAt' | 'computedTotalToPar' | 'computedRank'>[],
): Promise<string[]> {
  const batch = writeBatch(db);
  const refs = teams.map(() => doc(collection(db, COL)));
  refs.forEach((ref, i) => {
    batch.set(ref, {
      ...teams[i],
      computedTotalToPar: 0,
      computedRank: 0,
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
  return refs.map(r => r.id);
}

export async function updateTeam(
  id: string,
  updates: { name?: string; golferIds?: [string, string, string] },
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...(updates as DocumentData),
    updatedAt: serverTimestamp(),
  });
}

export async function claimTeam(id: string, ownerUid: string): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ownerUid,
    updatedAt: serverTimestamp(),
  });
}

export async function updateTeamScores(
  id: string,
  computedTotalToPar: number,
  computedRank: number,
  frozenGolferIds: string[],
  frozenScores: Record<string, number>,
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    computedTotalToPar,
    computedRank,
    frozenGolferIds,
    frozenScores,
    updatedAt: serverTimestamp(),
  });
}
