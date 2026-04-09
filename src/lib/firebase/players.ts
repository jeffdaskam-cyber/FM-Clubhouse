import {
  collection, doc, setDoc, getDocs, query, where, writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import type { FieldPlayer } from '@/types/scoring';

const COL = 'players';

export interface PlayerDoc extends FieldPlayer {
  tournamentId: string;
}

export async function getPlayersByTournament(tournamentId: string): Promise<PlayerDoc[]> {
  const q = query(collection(db, COL), where('tournamentId', '==', tournamentId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as PlayerDoc);
}

export async function savePlayersForTournament(
  tournamentId: string,
  players: FieldPlayer[],
): Promise<void> {
  const batch = writeBatch(db);
  for (const p of players) {
    const ref = doc(db, COL, `${tournamentId}_${p.playerId}`);
    batch.set(ref, { ...p, tournamentId });
  }
  await batch.commit();
}

export async function savePlayer(tournamentId: string, player: FieldPlayer): Promise<void> {
  const ref = doc(db, COL, `${tournamentId}_${player.playerId}`);
  await setDoc(ref, { ...player, tournamentId });
}
