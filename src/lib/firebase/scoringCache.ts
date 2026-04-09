import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './config';
import type { ScoringCacheDoc } from '@/types/scoring';

const COL = 'scoringCache';

export async function getScoringCache(tournamentId: string): Promise<ScoringCacheDoc | null> {
  const snap = await getDoc(doc(db, COL, tournamentId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    fetchedAt: (data.fetchedAt as Timestamp).toDate().toISOString(),
  } as ScoringCacheDoc;
}

export async function saveScoringCache(cache: ScoringCacheDoc): Promise<void> {
  await setDoc(doc(db, COL, cache.tournamentId), {
    ...cache,
    fetchedAt: Timestamp.fromDate(new Date(cache.fetchedAt)),
  });
}
