import type { Tournament } from '@/types/tournament';
import { WeatherStrip } from '@/components/weather/WeatherStrip';
import { formatDate } from '@/utils/date';

interface ScoreboardHeaderProps {
  tournament: Tournament | null;
  lastUpdated?: string;
}

export function ScoreboardHeader({ tournament, lastUpdated }: ScoreboardHeaderProps) {
  if (!tournament) return null;

  return (
    <div className="bg-green-800 text-white rounded-xl p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-gold-400">{tournament.name}</h1>
          <p className="text-sm text-green-200">{tournament.venue} &bull; {tournament.location}</p>
          <p className="text-xs text-green-300 mt-0.5">
            {formatDate(tournament.startDate)} &ndash; {formatDate(tournament.endDate)}
          </p>
          {lastUpdated && (
            <p className="text-xs text-green-400 mt-1">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <WeatherStrip lat={tournament.lat} lon={tournament.lon} />
      </div>
    </div>
  );
}
