import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import type { UserProfile } from '@/types/fantasy';

const COL = 'userProfiles';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, COL, uid));
  if (!snap.exists()) return null;
  const data = snap.data() as Record<string, unknown>;
  return {
    uid,
    email: data.email as string,
    teamId: data.teamId as string,
    tournamentId: data.tournamentId as string,
    createdAt: data.createdAt
      ? new Date((data.createdAt as { toDate(): Date }).toDate()).toISOString()
      : new Date().toISOString(),
  };
}

export async function saveUserProfile(
  profile: Omit<UserProfile, 'createdAt'>,
): Promise<void> {
  await setDoc(doc(db, COL, profile.uid), {
    email: profile.email,
    teamId: profile.teamId,
    tournamentId: profile.tournamentId,
    createdAt: serverTimestamp(),
  });
}
