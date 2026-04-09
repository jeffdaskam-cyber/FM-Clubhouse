import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc,
  query, where, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Tournament } from '@/types/tournament';

const COL = 'tournaments';

function fromFirestore(data: Record<string, unknown>, id: string): Tournament {
  return {
    id,
    name: data.name as string,
    year: data.year as number,
    slug: data.slug as Tournament['slug'],
    startDate: (data.startDate as Timestamp).toDate().toISOString(),
    endDate: (data.endDate as Timestamp).toDate().toISOString(),
    venue: data.venue as string,
    location: data.location as string,
    lat: data.lat as number,
    lon: data.lon as number,
    status: data.status as Tournament['status'],
    scoringProvider: data.scoringProvider as Tournament['scoringProvider'],
    providerTournamentId: data.providerTournamentId as string,
    par: data.par as number,
    isLocked: data.isLocked as boolean,
  };
}

export async function getTournament(id: string): Promise<Tournament | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return fromFirestore(snap.data() as Record<string, unknown>, snap.id);
}

export async function listTournaments(): Promise<Tournament[]> {
  const q = query(collection(db, COL), orderBy('startDate', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => fromFirestore(d.data() as Record<string, unknown>, d.id));
}

export async function listActiveTournaments(): Promise<Tournament[]> {
  const q = query(collection(db, COL), where('status', '==', 'active'));
  const snap = await getDocs(q);
  return snap.docs.map(d => fromFirestore(d.data() as Record<string, unknown>, d.id));
}

export async function saveTournament(t: Tournament): Promise<void> {
  const ref = doc(db, COL, t.id);
  await setDoc(ref, {
    ...t,
    startDate: Timestamp.fromDate(new Date(t.startDate)),
    endDate: Timestamp.fromDate(new Date(t.endDate)),
  });
}

export async function updateTournamentStatus(
  id: string,
  status: Tournament['status'],
): Promise<void> {
  await updateDoc(doc(db, COL, id), { status });
}

export async function lockTournament(id: string, isLocked: boolean): Promise<void> {
  await updateDoc(doc(db, COL, id), { isLocked });
}
