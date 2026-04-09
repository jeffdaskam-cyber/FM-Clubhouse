export type TournamentSlug =
  | 'players'
  | 'masters'
  | 'pga'
  | 'us-open'
  | 'open-championship';

export type TournamentStatus = 'upcoming' | 'active' | 'completed';
export type ScoringProviderName = 'sportradar' | 'sportsDataIo';

export interface Tournament {
  id: string;
  name: string;
  year: number;
  slug: TournamentSlug;
  startDate: string; // ISO string
  endDate: string;
  venue: string;
  location: string;
  lat: number;
  lon: number;
  status: TournamentStatus;
  scoringProvider: ScoringProviderName;
  providerTournamentId: string;
  par: number;
  isLocked: boolean;
}

export const SUPPORTED_TOURNAMENTS: { slug: TournamentSlug; name: string }[] = [
  { slug: 'players', name: 'The Players Championship' },
  { slug: 'masters', name: 'The Masters' },
  { slug: 'pga', name: 'The PGA Championship' },
  { slug: 'us-open', name: 'The U.S. Open' },
  { slug: 'open-championship', name: 'The Open Championship' },
];
