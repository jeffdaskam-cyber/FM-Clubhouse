import type { PlayerScore, PlayerStatus } from './types';

const SHEET_CSV_URL =
  import.meta.env.VITE_SCORES_SHEET_URL ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSZOVMyCzGldBusvdr9HCKCTRzh70uZpgNRSJq7JmXAPtUAgI-BBJp2FxYl6b1a9Ro8FyFjaJAdxfbe/pub?gid=0&single=true&output=csv';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert "E", "+3", "-5", "--", "" to a number or null.
 *  Non-numeric strings (e.g. "MC", "WD", "CUT") return null — never NaN. */
function parseScore(raw: string): number | null {
  const s = raw.trim();
  if (!s || s === '--' || s === '-') return null;
  if (s === 'E') return 0;
  const n = parseInt(s, 10);
  // parseInt("MC",10) → NaN. NaN is NOT null, so `?? 0` would pass it through.
  // Normalise to null here so callers can safely use `?? 0`.
  return isNaN(n) ? null : n;
}

/** Convert "E", "+3", "-5" to a number (defaults to 0 for unparseable) */
function parseScoreRequired(raw: string): number {
  return parseScore(raw) ?? 0;
}

/**
 * Parse a single-round to-par score. Returns null if the value is
 * non-numeric OR outside ±25 — the latter catches total-stroke counts
 * (e.g. 72, 148) that some sheets write into R3/R4 cells for MC/WD
 * players instead of leaving them blank.
 *
 * A legitimate to-par round score at a PGA Tour major is never outside
 * roughly ±20. Absolute stroke totals (68–90) always exceed this ceiling.
 */
function parseRoundScore(raw: string): number | null {
  const n = parseScore(raw);
  if (n === null) return null;
  if (Math.abs(n) > 25) return null;  // reject stroke-count bleed-over
  return n;
}

/** Slugify a player name into a stable ID: "Rory McIlroy" → "rory-mcilroy" */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Derive status from thru / pos columns */
function deriveStatus(thru: string, pos: string): PlayerStatus {
  const t = thru.trim().toUpperCase();
  const p = pos.trim().toUpperCase();
  if (p === 'CUT' || p === 'MC') return 'cut';
  if (p === 'WD' || p === 'DQ') return 'wd';
  if (t === 'F') return 'complete';
  return 'active';
}

/** Strip "T" prefix and parse finishing position for tiebreaker comparisons */
function parseFinishPosition(pos: string): number {
  const s = pos.trim().toUpperCase();
  if (s === 'CUT' || s === 'MC' || s === 'WD' || s === 'DQ') return 9999;
  return parseInt(s.replace(/^T/, ''), 10) || 9999;
}

// ---------------------------------------------------------------------------
// CSV parser — handles simple RFC 4180 CSV (no multiline cell support needed)
// ---------------------------------------------------------------------------

function parseCSV(text: string): string[][] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const cols: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          cols.push(cur.trim());
          cur = '';
        } else {
          cur += ch;
        }
      }
      cols.push(cur.trim());
      return cols;
    });
}

// ---------------------------------------------------------------------------
// Main fetch + transform
// ---------------------------------------------------------------------------

export async function fetchLeaderboard(): Promise<PlayerScore[]> {
  const res = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch leaderboard sheet: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  const rows = parseCSV(text);

  if (rows.length < 2) return [];

  // Map header row to column indices (case-insensitive)
  const headers = rows[0].map(h => h.toUpperCase());
  const col = (name: string) => headers.indexOf(name);

  const POS    = col('POS');
  const PLAYER = col('PLAYER');
  const SCORE  = col('SCORE');
  const TODAY  = col('TODAY');
  const THRU   = col('THRU');
  const R1     = col('R1');
  const R2     = col('R2');
  const R3     = col('R3');
  const R4     = col('R4');
  const TOT    = col('TOT');

  const dataRows = rows.slice(1); // skip header

  return dataRows
    .filter(row => row[PLAYER]?.trim())
    .map((row): PlayerScore => {
      const pos  = row[POS]    ?? '';
      const name = row[PLAYER] ?? '';
      const thru = row[THRU]   ?? '';

      // Parse round scores first — needed for totalScore fallback below.
      // parseRoundScore rejects implausibly large values (stroke totals)
      // that some sheets write into R3/R4 cells for MC/WD players.
      const r1 = parseRoundScore(row[R1] ?? '');
      const r2 = parseRoundScore(row[R2] ?? '');
      const r3 = parseRoundScore(row[R3] ?? '');
      const r4 = parseRoundScore(row[R4] ?? '');

      // The SCORE cell for MC/WD players often contains the status text ("MC",
      // "WD", "CUT") instead of a number. When that happens parseScore returns
      // null, and we derive the total by summing available round scores so that
      // a player who shot +3/+3 and missed the cut still contributes +6, not 0.
      const rawTotal = parseScore(row[SCORE] ?? '');
      const totalScore = rawTotal !== null
        ? rawTotal
        : (r1 ?? 0) + (r2 ?? 0) + (r3 ?? 0) + (r4 ?? 0);

      return {
        id:             slugify(name),
        name:           name.trim(),
        position:       pos.trim(),
        totalScore,
        todayScore:     parseScoreRequired(row[TODAY] ?? ''),
        thru:           thru.trim() || '-',
        r1,
        r2,
        r3,
        r4,
        totalStrokes:   parseScore(row[TOT] ?? ''),
        status:         deriveStatus(thru, pos),
        finishPosition: parseFinishPosition(pos),
      };
    });
}
