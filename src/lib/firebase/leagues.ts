import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { FantasyLeague } from '@/types/fantasy';

const COL = 'fantasyLeagues';

function fromDoc(data: Record<string, unknown>, id: string): FantasyLeague {
  return {
    id,
    tournamentId: data.tournamentId as string,
    name: data.name as string,
    createdAt: data.createdAt ? new Date((data.createdAt as { toDate(): Date }).toDate()).toISOString() : new Date().toISOString(),
    isLocked: data.isLocked as boolean,
    teamCount: data.teamCount as number,
  };
}

export async function getLeague(id: string): Promise<FantasyLeague | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return fromDoc(snap.data() as Record<string, unknown>, snap.id);
}

export async function getLeaguesByTournament(tournamentId: string): Promise<FantasyLeague[]> {
  const q = query(collection(db, COL), where('tournamentId', '==', tournamentId));
  const snap = await getDocs(q);
  return snap.docs.map(d => fromDoc(d.data() as Record<string, unknown>, d.id));
}

export async function createLeague(
  data: Omit<FantasyLeague, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateLeague(id: string, data: Partial<FantasyLeague>): Promise<void> {
  await updateDoc(doc(db, COL, id), data as Record<string, unknown>);
}

export async function lockLeague(id: string, isLocked: boolean): Promise<void> {
  await updateDoc(doc(db, COL, id), { isLocked });
}
