import { useState, useEffect, useCallback, useMemo } from 'react';
import type { CameraFeed, CameraApiResponse, CameraCountry } from '../types/camera';
import type { IntelFeedItem } from '../components/ui/IntelFeed';

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes
const RETRY_BASE = 30_000;
const RETRY_CAP = 120_000;

const COUNTRY_META: Record<string, { name: string; flag: string }> = {
  JO: { name: 'Jordan', flag: '🇯🇴' },
  GB: { name: 'United Kingdom', flag: '🇬🇧' },
  US: { name: 'United States', flag: '🇺🇸' },
  AU: { name: 'Australia', flag: '🇦🇺' },
  JP: { name: 'Japan', flag: '🇯🇵' },
  KR: { name: 'South Korea', flag: '🇰🇷' },
  SE: { name: 'Sweden', flag: '🇸🇪' },
};

export function useCameras(enabled: boolean, countryFilter: string = 'ALL') {
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [feedItems, setFeedItems] = useState<IntelFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchCameras = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (countryFilter !== 'ALL') params.set('country', countryFilter);

      const res = await fetch(`/api/cctv?${params}`);
      if (!res.ok) throw new Error(`CCTV API HTTP ${res.status}`);

      const data: CameraApiResponse = await res.json();
      setCameras(data.cameras);
      setRetryCount(0);

      // Generate intel feed items
      const time = new Date().toISOString().slice(11, 19);
      const newFeed: IntelFeedItem[] = [
        {
          id: `cctv-status-${Date.now()}`,
          time,
          type: 'cctv' as any,
          message: `${data.meta.onlineCameras} cameras online across ${data.meta.countries.length} regions`,
        },
      ];
      setFeedItems(newFeed);
    } catch (err: any) {
      console.error('[CCTV] Fetch error:', err.message);
      setError(err.message);
      setRetryCount((c) => c + 1);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, countryFilter]);

  // Poll on interval with exponential backoff on error.
  // Separates the retry path (setTimeout) from the normal polling path (setInterval)
  // so a failed fetch never fires two rapid successive calls.
  useEffect(() => {
    if (!enabled) {
      setCameras([]);
      setFeedItems([]);
      setRetryCount(0);
      return;
    }

    // On subsequent retries: wait out the backoff delay, then fire once.
    // The next interval is re-established by the effect re-running once retryCount resets to 0.
    if (retryCount > 0) {
      const delay = Math.min(RETRY_BASE * Math.pow(2, retryCount - 1), RETRY_CAP);
      const timer = setTimeout(fetchCameras, delay);
      return () => clearTimeout(timer);
    }

    // Initial load (or after countryFilter change): fetch immediately, then poll.
    fetchCameras();
    const timer = setInterval(fetchCameras, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchCameras, enabled, retryCount]);

  // Derived: country breakdown
  const availableCountries = useMemo<CameraCountry[]>(() => {
    const counts: Record<string, number> = {};
    for (const cam of cameras) {
      counts[cam.country] = (counts[cam.country] || 0) + 1;
    }
    return Object.entries(counts).map(([code, count]) => ({
      code,
      name: COUNTRY_META[code]?.name || code,
      flag: COUNTRY_META[code]?.flag || '🌍',
      count,
    }));
  }, [cameras]);

  const totalOnline = useMemo(() => cameras.filter((c) => c.available !== false).length, [cameras]);

  return {
    cameras,
    feedItems,
    isLoading,
    error,
    totalOnline,
    totalCameras: cameras.length,
    availableCountries,
    refetch: fetchCameras,
  };
}
