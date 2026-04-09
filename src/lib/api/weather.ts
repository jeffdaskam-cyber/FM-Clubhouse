import type { WeatherData } from '@/types/weather';
import { weatherCodeToDescription } from '@/utils/scoring';

const BASE = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,wind_speed_10m,wind_direction_10m,weather_code',
    wind_speed_unit: 'kmh',
    forecast_days: '1',
  });
  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
  const data = await res.json();
  const c = data.current;
  return {
    temperature: c.temperature_2m,
    windSpeed: c.wind_speed_10m,
    windDirection: c.wind_direction_10m,
    weatherCode: c.weather_code,
    description: weatherCodeToDescription(c.weather_code),
  };
}
