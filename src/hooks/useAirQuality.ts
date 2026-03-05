import { useState, useEffect, useCallback } from 'react';

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

export interface AirQualityStation {
  id: number;
  name: string;
  lat: number;
  lon: number;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  aqi: number;
  updatedAt: string;
}

export function useAirQuality(enabled: boolean) {
  const [stations, setStations] = useState<AirQualityStation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAirQuality = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/airquality');
      if (!res.ok) throw new Error(`AQ API HTTP ${res.status}`);
      const data: AirQualityStation[] = await res.json();
      setStations(data);
    } catch (err: any) {
      console.error('[AIRQUALITY] Fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setStations([]);
      return;
    }
    fetchAirQuality();
    const timer = setInterval(fetchAirQuality, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchAirQuality, enabled]);

  return { stations, isLoading };
}
