import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '@/lib/api/weather';
import type { WeatherData } from '@/types/weather';

export function useWeather(lat: number | null, lon: number | null) {
  return useQuery<WeatherData, Error>({
    queryKey: ['weather', lat, lon],
    queryFn: () => fetchWeather(lat!, lon!),
    enabled: lat !== null && lon !== null,
    staleTime: 10 * 60 * 1000, // 10 min
    refetchInterval: 15 * 60 * 1000, // 15 min
  });
}
