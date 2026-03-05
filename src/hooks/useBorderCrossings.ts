import { useState, useEffect, useCallback } from 'react';
import type { IntelFeedItem } from '../components/ui/IntelFeed';

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

export interface BorderCrossing {
  id: string;
  nameEn: string;
  nameAr: string;
  shortName: string;
  lat: number;
  lon: number;
  partner: string;
  partnerAr: string;
  status: 'open' | 'limited' | 'closed';
  waitMinutes: number;
  throughput: 'high' | 'medium' | 'low';
  type: string;
  hours: string;
  notes: string;
}

export function useBorderCrossings(enabled: boolean) {
  const [crossings, setCrossings] = useState<BorderCrossing[]>([]);
  const [feedItems, setFeedItems] = useState<IntelFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCrossings = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/borders');
      if (!res.ok) throw new Error(`Borders API HTTP ${res.status}`);
      const data: BorderCrossing[] = await res.json();
      setCrossings(data);

      const time = new Date().toISOString().slice(11, 19);
      const limited = data.filter((c) => c.status === 'limited');
      const closed = data.filter((c) => c.status === 'closed');

      const newFeed: IntelFeedItem[] = [];
      if (closed.length > 0) {
        newFeed.push({
          id: `border-closed-${Date.now()}`,
          time,
          type: 'alert' as any,
          message: `Border closed: ${closed.map((c) => c.shortName).join(', ')}`,
        });
      }
      if (limited.length > 0) {
        newFeed.push({
          id: `border-limited-${Date.now()}`,
          time,
          type: 'traffic' as any,
          message: `Limited capacity: ${limited.map((c) => c.shortName).join(', ')}`,
        });
      }
      setFeedItems(newFeed);
    } catch (err: any) {
      console.error('[BORDERS] Fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setCrossings([]);
      setFeedItems([]);
      return;
    }
    fetchCrossings();
    const timer = setInterval(fetchCrossings, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchCrossings, enabled]);

  return { crossings, feedItems, isLoading };
}
