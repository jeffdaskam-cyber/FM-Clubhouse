import { useState } from 'react';
import {
  lockTournamentScores,
  buildFantasySnapshot,
  type LockResult,
} from '@/lib/scoring/tournamentLockService';
import type { TeamResult } from '@/lib/scoring/fantasyEngine';
import { Button } from '@/components/ui/Button';

interface Props {
  tournamentId: string;
  tournamentName: string;
  fantasyStandings: TeamResult[];
  isAlreadyLocked: boolean;
  onLocked?: () => void;
}

export function LockTournamentButton({
  tournamentId,
  tournamentName,
  fantasyStandings,
  isAlreadyLocked,
  onLocked,
}: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [result, setResult] = useState<LockResult | null>(null);

  async function handleConfirmLock() {
    setIsLocking(true);
    const snapshot = buildFantasySnapshot(fantasyStandings);
    const res = await lockTournamentScores(tournamentId, snapshot);
    setResult(res);
    setIsLocking(false);
    setShowConfirm(false);
    if (res.success) onLocked?.();
  }

  if (isAlreadyLocked) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
        <span>✓</span>
        <span>Tournament scores locked</span>
      </div>
    );
  }

  return (
    <div>
      {!showConfirm && !result && (
        <Button variant="danger" size="sm" onClick={() => setShowConfirm(true)}>
          Lock Final Scores
        </Button>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-neutral-900 mb-2">
              Lock Final Scores?
            </h2>
            <p className="text-neutral-600 text-sm mb-4">
              This will permanently save the current leaderboard for{' '}
              <strong>{tournamentName}</strong> to Firestore and mark the
              tournament as complete.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-sm text-amber-800">
              ⚠️ This action cannot be undone. Make sure the tournament is
              fully complete before locking.
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirm(false)}
                disabled={isLocking}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmLock}
                disabled={isLocking}
              >
                {isLocking ? 'Locking…' : 'Yes, Lock Scores'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {result && result.success && (
        <div className="text-sm text-green-600 font-medium">
          ✓ Scores locked — {result.rowCount} players saved.
        </div>
      )}
      {result && !result.success && (
        <div className="text-sm text-red-600">
          ✗ Lock failed: {result.error}
        </div>
      )}
    </div>
  );
}
