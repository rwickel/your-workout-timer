import { useState, useEffect, useCallback } from 'react';

export interface HistoryEntry {
  id: string;
  source: 'wod' | 'interval';
  title: string;
  scheme: string; // wod scheme or 'interval'
  finishedAt: number;
  timeSeconds: number;
  roundsCompleted: number;
}

const HISTORY_KEY = 'workout-history';
const LEGACY_RESULTS_KEY = 'workout-wod-results';

export const useHistory = () => {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      // Migrate legacy wod results once
      const legacy = localStorage.getItem(LEGACY_RESULTS_KEY);
      const stored = localStorage.getItem(HISTORY_KEY);
      if (!stored && legacy) {
        const migrated = (JSON.parse(legacy) || []).map((r: any) => ({
          id: `legacy-${r.finishedAt}`,
          source: 'wod' as const,
          title: r.wodName || 'WOD',
          scheme: r.scheme,
          finishedAt: r.finishedAt,
          timeSeconds: r.timeSeconds ?? 0,
          roundsCompleted: r.roundsCompleted ?? 0,
        }));
        localStorage.setItem(HISTORY_KEY, JSON.stringify(migrated));
        setEntries(migrated);
        return;
      }
      if (stored) setEntries(JSON.parse(stored));
    } catch (e) {
      console.warn('Failed to load history:', e);
    }
  }, []);

  const persist = useCallback((next: HistoryEntry[]) => {
    setEntries(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to save history:', e);
    }
  }, []);

  const addEntry = useCallback((entry: Omit<HistoryEntry, 'id'>) => {
    setEntries(prev => {
      const next = [...prev, { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }];
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save history:', e);
      }
      return next;
    });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save history:', e);
      }
      return next;
    });
  }, []);

  return { entries, addEntry, deleteEntry };
};
