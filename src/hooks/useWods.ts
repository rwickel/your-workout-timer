import { useState, useEffect, useCallback } from 'react';
import { Wod, WodResult } from '@/types/wod';

const WODS_KEY = 'workout-wods';
const RESULTS_KEY = 'workout-wod-results';

export const useWods = () => {
  const [wods, setWods] = useState<Wod[]>([]);
  const [results, setResults] = useState<WodResult[]>([]);

  useEffect(() => {
    try {
      const storedWods = localStorage.getItem(WODS_KEY);
      if (storedWods) setWods(JSON.parse(storedWods));
      const storedResults = localStorage.getItem(RESULTS_KEY);
      if (storedResults) setResults(JSON.parse(storedResults));
    } catch (e) {
      console.warn('Failed to load WODs:', e);
    }
  }, []);

  const persistWods = useCallback((next: Wod[]) => {
    setWods(next);
    try {
      localStorage.setItem(WODS_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to save WODs:', e);
    }
  }, []);

  const saveWod = useCallback((wod: Wod) => {
    setWods(prev => {
      const next = wod.id
        ? prev.map(w => (w.id === wod.id ? wod : w))
        : [...prev, { ...wod, id: Date.now().toString() }];
      try {
        localStorage.setItem(WODS_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save WODs:', e);
      }
      return next;
    });
  }, []);

  const deleteWod = useCallback((id: string) => {
    setWods(prev => {
      const next = prev.filter(w => w.id !== id);
      try {
        localStorage.setItem(WODS_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save WODs:', e);
      }
      return next;
    });
  }, []);

  const addResult = useCallback((result: WodResult) => {
    setResults(prev => {
      const next = [...prev, result];
      try {
        localStorage.setItem(RESULTS_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save results:', e);
      }
      return next;
    });
  }, []);

  return { wods, results, saveWod, deleteWod, addResult };
};
