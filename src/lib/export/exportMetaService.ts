import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { ExportMeta } from './types';

const COLLECTION = 'exportMeta';

export async function getPriorExportMeta(tournamentId: string): Promise<ExportMeta | null> {
  const snap = await getDoc(doc(db, COLLECTION, tournamentId));
  if (!snap.exists()) return null;
  return snap.data() as ExportMeta;
}

export async function saveExportMeta(tournamentId: string, meta: ExportMeta): Promise<void> {
  await setDoc(doc(db, COLLECTION, tournamentId), meta);
}
