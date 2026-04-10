import { useWeather } from '@/hooks/useWeather';
import { windDirectionLabel } from '@/utils/scoring';

interface WeatherStripProps {
  lat: number | null;
  lon: number | null;
}

export function WeatherStrip({ lat, lon }: WeatherStripProps) {
  const { data, isLoading, isError } = useWeather(lat, lon);

  if (isLoading || isError || !data) return null;

  return (
    <div className="flex items-center gap-3 text-xs text-green-100 bg-green-900/40 rounded-lg px-3 py-1.5">
      <span>{data.description}</span>
      <span>{Math.round(data.temperature)}°C</span>
      <span>
        {Math.round(data.windSpeed)} km/h {windDirectionLabel(data.windDirection)}
      </span>
    </div>
  );
}
