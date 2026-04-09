import type { PlayerStatus } from '@/types/scoring';

export function parsePosition(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined || raw === '') return '-';
  const s = String(raw).trim().toUpperCase();
  if (s === 'CUT' || s === 'MC') return 'CUT';
  if (s === 'WD' || s === 'W/D') return 'WD';
  if (s === 'DQ') return 'DQ';
  return s;
}

export function parseToPar(raw: string | number | null | undefined): number {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === 'number') return raw;
  const s = raw.trim();
  if (s === 'E' || s === '') return 0;
  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
}

export function mapStatus(raw: string | null | undefined): PlayerStatus {
  if (!raw) return 'active';
  const s = raw.toUpperCase();
  if (s === 'CUT' || s === 'MC') return 'cut';
  if (s === 'WD' || s === 'W/D' || s === 'WITHDRAWN') return 'wd';
  if (s === 'DQ' || s === 'DISQUALIFIED') return 'dq';
  if (s === 'COMPLETE' || s === 'F' || s === 'FINISHED') return 'complete';
  return 'active';
}

export function parseThru(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined || raw === '') return '-';
  const s = String(raw).toUpperCase();
  if (s === 'F' || s === 'FINAL') return 'F';
  return s;
}

export function parseRoundScore(raw: number | string | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
  return isNaN(n) ? null : n;
}
