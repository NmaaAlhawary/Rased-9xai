import { useState, useEffect, useCallback } from 'react';

const POLL_INTERVAL = 10 * 60 * 1000; // 10 minutes

export interface WeatherStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  temperature: number | null;
  weatherCode: number;
  windSpeed: number | null;
  humidity: number | null;
  updatedAt: string;
}

export function useWeather(enabled: boolean) {
  const [stations, setStations] = useState<WeatherStation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWeather = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/weather');
      if (!res.ok) throw new Error(`Weather API HTTP ${res.status}`);
      const data: WeatherStation[] = await res.json();
      setStations(data);
    } catch (err: any) {
      console.error('[WEATHER] Fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setStations([]);
      return;
    }
    fetchWeather();
    const timer = setInterval(fetchWeather, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchWeather, enabled]);

  return { stations, isLoading };
}
