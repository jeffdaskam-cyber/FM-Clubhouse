import type { TournamentSlug } from '@/types/tournament';

export const SUPPORTED_TOURNAMENTS: { slug: TournamentSlug; name: string }[] = [
  { slug: 'players', name: 'The Players Championship' },
  { slug: 'masters', name: 'The Masters' },
  { slug: 'pga', name: 'The PGA Championship' },
  { slug: 'us-open', name: 'The U.S. Open' },
  { slug: 'open-championship', name: 'The Open Championship' },
];

export const REFRESH_INTERVAL_MS = 90_000; // 90 seconds

export const MIN_TEAMS = 4;
export const MAX_TEAMS = 6;
export const GOLFERS_PER_TEAM = 3;
