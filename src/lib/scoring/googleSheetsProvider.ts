import type { PlayerScore, PlayerStatus } from './types';

const SHEET_CSV_URL =
  import.meta.env.VITE_SCORES_SHEET_URL ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSZOVMyCzGldBusvdr9HCKCTRzh70uZpgNRSJq7JmXAPtUAgI-BBJp2FxYl6b1a9Ro8FyFjaJAdxfbe/pub?gid=0&single=true&output=csv';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert "E", "+3", "-5", "--", "" to a number or null.
 * Non-numeric strings (e.g. "MC", "WD", "CUT") return null — never NaN.
 *
 * NOTE: R1-R4 columns in this sheet store absolute stroke counts (66, 74, 76…),
 * NOT to-par values. This function is used for all numeric parsing; the caller
 * decides how to interpret the result.
 */
function parseScore(raw: string): number | null {
  const s = raw.trim();
  if (!s || s === '--' || s === '-') return null;
  if (s === 'E') return 0;
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
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
// Main fetch + transform (two-pass)
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

  const dataRows = rows.slice(1).filter(row => row[PLAYER]?.trim());

  // -------------------------------------------------------------------------
  // Pass 1: parse every row into raw values.
  //
  // Sheet format:
  //   SCORE — to-par for active/complete players ("−5", "E", "+3");
  //           status text for eliminated players ("MC", "WD", "CUT").
  //   R1-R4 — absolute stroke counts (66, 74, 76…) for played rounds;
  //           blank/null for rounds not yet played.
  //   TOT   — cumulative stroke total for all completed rounds (e.g. 150, 283).
  // -------------------------------------------------------------------------

  type RawRow = {
    pos:          string;
    name:         string;
    thru:         string;
    status:       PlayerStatus;
    scoreRaw:     number | null;   // null for "MC" / "WD"
    todayRaw:     number | null;
    r1:           number | null;   // stroke count or null
    r2:           number | null;
    r3:           number | null;
    r4:           number | null;
    totRaw:       number | null;   // cumulative stroke total
    roundsPlayed: number;
  };

  const rawRows: RawRow[] = dataRows.map(row => {
    const pos  = (row[POS]    ?? '').trim();
    const name = (row[PLAYER] ?? '').trim();
    const thru = (row[THRU]   ?? '').trim();

    const scoreRaw = parseScore(row[SCORE] ?? '');   // null for "MC" / "WD"
    const todayRaw = parseScore(row[TODAY] ?? '');
    const r1       = parseScore(row[R1]    ?? '');   // stroke count (e.g. 74)
    const r2       = parseScore(row[R2]    ?? '');
    const r3       = parseScore(row[R3]    ?? '');
    const r4       = parseScore(row[R4]    ?? '');
    const totRaw   = parseScore(row[TOT]   ?? '');   // cumulative strokes

    // A round was played if the cell has any numeric value.
    // Stroke counts are always > 0; blank/null rounds parse to null.
    const roundsPlayed = [r1, r2, r3, r4].filter(v => v !== null).length;

    return {
      pos, name, thru,
      status: deriveStatus(thru, pos),
      scoreRaw, todayRaw,
      r1, r2, r3, r4, totRaw,
      roundsPlayed,
    };
  });

  // -------------------------------------------------------------------------
  // Infer course par per round from players who have BOTH:
  //   • a valid numeric to-par SCORE (not "MC"/"WD"), and
  //   • a stroke-count TOT (always > 25; to-par values are never that large).
  //
  // For any such player: par_per_round = (TOT_strokes − to_par) / rounds_played
  // e.g. TOT=283, SCORE=−5, 4 rounds → (283 − (−5)) / 4 = 288/4 = 72
  // -------------------------------------------------------------------------

  const parSamples = rawRows
    .filter(p =>
      p.scoreRaw !== null &&
      p.totRaw   !== null &&
      p.totRaw   > 25 &&        // confirms TOT is a stroke count, not a to-par
      p.roundsPlayed > 0
    )
    .map(p => (p.totRaw! - p.scoreRaw!) / p.roundsPlayed);

  const coursePar: number =
    parSamples.length > 0
      ? Math.round(parSamples.reduce((a, b) => a + b, 0) / parSamples.length)
      : 72; // standard fallback for early round 1 before any data exists

  // -------------------------------------------------------------------------
  // Pass 2: build final PlayerScore objects.
  //
  // For MC/WD players SCORE is non-numeric, so we derive totalScore from TOT:
  //   to_par = total_strokes − (par × rounds_played)
  //   e.g. Bryson: 150 − (72 × 2) = +6
  // -------------------------------------------------------------------------

  return rawRows.map(({ pos, name, thru, status,
                        scoreRaw, todayRaw, r1, r2, r3, r4,
                        totRaw, roundsPlayed }): PlayerScore => {
    let totalScore: number;

    if (scoreRaw !== null) {
      // Normal case: SCORE column has a valid to-par value
      totalScore = scoreRaw;
    } else if (totRaw !== null && totRaw > 25 && roundsPlayed > 0) {
      // MC/WD case: derive to-par from stroke total and inferred par
      totalScore = totRaw - (coursePar * roundsPlayed);
    } else if (roundsPlayed > 0) {
      // Last resort: TOT unavailable — sum stroke counts and subtract par
      const strokeSum = (r1 ?? 0) + (r2 ?? 0) + (r3 ?? 0) + (r4 ?? 0);
      totalScore = strokeSum - (coursePar * roundsPlayed);
    } else {
      totalScore = 0;
    }

    return {
      id:             slugify(name),
      name:           name.trim(),
      position:       pos.trim(),
      totalScore,
      todayScore:     todayRaw ?? 0,
      thru:           thru || '-',
      r1,
      r2,
      r3,
      r4,
      totalStrokes:   totRaw,
      status,
      finishPosition: parseFinishPosition(pos),
    };
  });
}
