import type { ScoringProvider } from './types';
import { SportradarProvider } from './sportradar';
import { SportsDataIOProvider } from './sportsDataIo';
import type { ScoringProviderName } from '@/types/tournament';

export function getScoringProvider(name: ScoringProviderName): ScoringProvider {
  switch (name) {
    case 'sportradar':
      return new SportradarProvider();
    case 'sportsDataIo':
      return new SportsDataIOProvider();
    default:
      throw new Error(`Unknown scoring provider: ${name}`);
  }
}

export type { ScoringProvider } from './types';
