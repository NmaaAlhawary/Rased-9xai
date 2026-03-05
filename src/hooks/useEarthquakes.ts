import { useState, useEffect, useCallback } from 'react';
import type { IntelFeedItem } from '../components/ui/IntelFeed';

export interface Earthquake {
  id: string;
  mag: number;
  place: string;
  time: number;
  longitude: number;
  latitude: number;
  depth: number;
}

// Routed through backend proxy — shares the 60-second server-side cache,
// avoids direct browser→USGS dependency, and respects the architecture.
const USGS_URL = '/api/earthquakes';
const POLL_INTERVAL = 60_000; // 60 seconds

export function useEarthquakes(enabled: boolean) {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [feedItems, setFeedItems] = useState<IntelFeedItem[]>([]);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      const res = await fetch(USGS_URL);
      if (!res.ok) throw new Error(`USGS HTTP ${res.status}`);
      const data = await res.json();

      const quakes: Earthquake[] = data.features.map((f: any) => ({
        id: f.id,
        mag: f.properties.mag,
        place: (f.properties.place || '').replace(/\bIsrael\b/gi, 'Palestine'),
        time: f.properties.time,
        longitude: f.geometry.coordinates[0],
        latitude: f.geometry.coordinates[1],
        depth: f.geometry.coordinates[2],
      }));

      setEarthquakes(quakes);

      // Jordan bounding box — Dead Sea Transform Fault region
      const JORDAN_BBOX = { south: 29.1, north: 33.4, west: 34.9, east: 39.3 };
      const isInJordan = (q: Earthquake) =>
        q.latitude >= JORDAN_BBOX.south && q.latitude <= JORDAN_BBOX.north &&
        q.longitude >= JORDAN_BBOX.west && q.longitude <= JORDAN_BBOX.east;

      // Generate intel feed for significant recent earthquakes (M3.0+ for Jordan, M5+ globally)
      const significant = quakes.filter((q) => {
        const isJordan = isInJordan(q);
        return isJordan ? q.mag >= 3.0 : q.mag >= 5.0;
      }).slice(0, 8);
      const newFeed: IntelFeedItem[] = significant.map((q) => {
        const jordanTag = isInJordan(q) ? ' 🇯🇴 JORDAN REGION' : '';
        return {
          id: `eq-${q.id}`,
          time: new Date(q.time).toISOString().slice(11, 19),
          type: 'seismic' as const,
          message: `M${q.mag.toFixed(1)} — ${q.place}${jordanTag}`,
        };
      });
      setFeedItems(newFeed);
    } catch (err) {
      console.error('USGS fetch error:', err);
    }
  }, [enabled]);

  useEffect(() => {
    fetchData();
    if (!enabled) return;
    const timer = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchData, enabled]);

  return { earthquakes, feedItems };
}
