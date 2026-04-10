import { useEffect, useRef, useState, useCallback } from 'react';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { fetchLeaderboard } from '@/lib/scoring';
import type { PlayerScore } from '@/lib/scoring';

const POLL_INTERVAL_MS = 90_000; // 90 seconds
const CACHE_TTL_MS     = 60_000; // treat Firestore cache as stale after 60s

export interface UseLeaderboardResult {
  players:     PlayerScore[];
  lastUpdated: Date | null;
  loading:     boolean;
  error:       string | null;
  refresh:     () => void;
}

export function useLeaderboard(tournamentId: string): UseLeaderboardResult {
  const [players,     setPlayers]     = useState<PlayerScore[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadFromCache = useCallback(async (): Promise<boolean> => {
    try {
      const snap = await getDoc(doc(db, 'scoringCache', tournamentId));
      if (!snap.exists()) return false;
      const data = snap.data();
      const age  = Date.now() - (data.lastUpdated?.toMillis?.() ?? 0);
      if (age > CACHE_TTL_MS) return false;
      setPlayers(data.entries ?? []);
      setLastUpdated(data.lastUpdated?.toDate?.() ?? null);
      return true;
    } catch {
      return false;
    }
  }, [tournamentId]);

  const fetchLive = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboard();
      const now  = Timestamp.now();
      setPlayers(data);
      setLastUpdated(now.toDate());
      // Write to Firestore cache (best-effort)
      setDoc(doc(db, 'scoringCache', tournamentId), { entries: data, lastUpdated: now }, { merge: true }).catch(() => {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load leaderboard';
      setError(msg);
      await loadFromCache(); // fall back to stale cache on error
    } finally {
      setLoading(false);
    }
  }, [tournamentId, loadFromCache]);

  useEffect(() => {
    if (!tournamentId) {
      setLoading(false);
      setPlayers([]);
      return;
    }

    let cancelled = false;

    (async () => {
      const cacheHit = await loadFromCache();
      if (cacheHit && !cancelled) setLoading(false);
      if (!cancelled) await fetchLive(cacheHit);
    })();

    intervalRef.current = setInterval(() => fetchLive(true), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tournamentId, loadFromCache, fetchLive]);

  return { players, lastUpdated, loading, error, refresh: () => fetchLive(false) };
}
