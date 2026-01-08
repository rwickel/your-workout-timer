import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, Play, Plus, X } from 'lucide-react';
import { TimerConfig, formatTime } from '@/types/timer';
import { FavoriteWorkout } from '@/hooks/useFavorites';

interface FavoritesPanelProps {
  favorites: FavoriteWorkout[];
  currentConfig: TimerConfig;
  onSelect: (config: TimerConfig) => void;
  onSave: (name: string, config: TimerConfig) => void;
  onDelete: (id: string) => void;
}

export const FavoritesPanel: React.FC<FavoritesPanelProps> = ({
  favorites,
  currentConfig,
  onSelect,
  onSave,
  onDelete,
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSave = () => {
    if (newName.trim()) {
      onSave(newName.trim(), currentConfig);
      setNewName('');
      setShowSaveDialog(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card p-4"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Heart className="h-5 w-5 text-primary" />
          Favorites
        </h3>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center gap-1 rounded-lg bg-primary/20 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/30"
        >
          <Plus className="h-4 w-4" />
          Save Current
        </button>
      </div>

      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex gap-2 rounded-lg bg-muted p-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Workout name..."
                className="flex-1 rounded-md bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
              />
              <button
                onClick={handleSave}
                className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:brightness-110"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="rounded-md bg-muted-foreground/20 p-2 text-muted-foreground transition-colors hover:bg-muted-foreground/30"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {favorites.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No saved workouts yet. Save your current configuration to access it quickly!
        </p>
      ) : (
        <div className="space-y-2">
          {favorites.map((fav) => (
            <motion.div
              key={fav.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-foreground">{fav.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(fav.config.workTime)} work • {formatTime(fav.config.pauseTime)} rest • {fav.config.rounds} rounds
                </p>
              </div>
              <button
                onClick={() => onSelect(fav.config)}
                className="rounded-md bg-primary/20 p-2 text-primary transition-colors hover:bg-primary/30"
                title="Load workout"
              >
                <Play className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(fav.id)}
                className="rounded-md bg-destructive/20 p-2 text-destructive transition-colors hover:bg-destructive/30"
                title="Delete workout"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
