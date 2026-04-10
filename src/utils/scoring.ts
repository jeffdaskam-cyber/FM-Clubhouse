export function formatToPar(score: number): string {
  if (score === 0) return 'E';
  if (score > 0) return `+${score}`;
  return String(score);
}

export function formatPosition(pos: string | null | undefined): string {
  if (!pos) return '-';
  return pos;
}

export function scoreClass(score: number): string {
  if (score < 0) return 'score-under';
  if (score > 0) return 'score-over';
  return 'score-even';
}

/** Returns Tailwind bg + text classes for a rank position badge */
export function rankBadgeClass(rank: number): string {
  if (rank === 1) return 'bg-gold-300 text-neutral-900';
  if (rank === 2) return 'bg-neutral-300 text-neutral-800';
  if (rank === 3) return 'bg-gold-700 text-white';
  return 'bg-neutral-100 text-neutral-600';
}

export function weatherCodeToDescription(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export function windDirectionLabel(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(degrees / 45) % 8];
}
