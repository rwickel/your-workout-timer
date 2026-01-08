import { useState, useEffect, useCallback } from 'react';
import { TimerConfig } from '@/types/timer';

export interface FavoriteWorkout {
  id: string;
  name: string;
  config: TimerConfig;
  createdAt: number;
}

const STORAGE_KEY = 'workout-favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteWorkout[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load favorites:', e);
    }
  }, []);

  const saveFavorites = useCallback((newFavorites: FavoriteWorkout[]) => {
    setFavorites(newFavorites);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (e) {
      console.warn('Failed to save favorites:', e);
    }
  }, []);

  const addFavorite = useCallback((name: string, config: TimerConfig) => {
    const newFavorite: FavoriteWorkout = {
      id: Date.now().toString(),
      name,
      config,
      createdAt: Date.now(),
    };
    saveFavorites([...favorites, newFavorite]);
    return newFavorite;
  }, [favorites, saveFavorites]);

  const removeFavorite = useCallback((id: string) => {
    saveFavorites(favorites.filter(f => f.id !== id));
  }, [favorites, saveFavorites]);

  const updateFavorite = useCallback((id: string, name: string, config: TimerConfig) => {
    saveFavorites(favorites.map(f => 
      f.id === id ? { ...f, name, config } : f
    ));
  }, [favorites, saveFavorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    updateFavorite,
  };
};
