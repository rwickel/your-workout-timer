import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, Play, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSave = () => {
    if (newName.trim()) {
      onSave(newName.trim(), currentConfig);
      setNewName('');
      setShowSaveDialog(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
              className="rounded-lg bg-muted/50 transition-colors hover:bg-muted overflow-hidden"
            >
              <div 
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() => toggleExpand(fav.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-foreground">{fav.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(fav.config.workTime)} work • {formatTime(fav.config.pauseTime)} rest • {fav.config.rounds} rounds
                  </p>
                </div>
                <button
                  className="rounded-md bg-background/50 p-2 text-muted-foreground transition-colors hover:bg-background"
                  title="Toggle details"
                >
                  {expandedId === fav.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect(fav.config); }}
                  className="rounded-md bg-primary/20 p-2 text-primary transition-colors hover:bg-primary/30"
                  title="Load workout"
                >
                  <Play className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(fav.id); }}
                  className="rounded-md bg-destructive/20 p-2 text-destructive transition-colors hover:bg-destructive/30"
                  title="Delete workout"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <AnimatePresence>
                {expandedId === fav.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-2 px-3 pb-3 text-sm">
                      <div className="rounded-md bg-background/50 p-2">
                        <span className="text-work">Work:</span>
                        <span className="ml-2 font-mono text-foreground">{formatTime(fav.config.workTime)}</span>
                      </div>
                      <div className="rounded-md bg-background/50 p-2">
                        <span className="text-pause">Pause:</span>
                        <span className="ml-2 font-mono text-foreground">{formatTime(fav.config.pauseTime)}</span>
                      </div>
                      <div className="rounded-md bg-background/50 p-2">
                        <span className="text-preparation">Prep:</span>
                        <span className="ml-2 font-mono text-foreground">{formatTime(fav.config.preparationTime)}</span>
                      </div>
                      <div className="rounded-md bg-background/50 p-2">
                        <span className="text-muted-foreground">Rounds:</span>
                        <span className="ml-2 font-mono text-foreground">{fav.config.rounds}</span>
                      </div>
                      <div className="rounded-md bg-background/50 p-2">
                        <span className="text-muted-foreground">Work Adj:</span>
                        <span className="ml-2 font-mono text-foreground">{fav.config.workAdjustment}s</span>
                      </div>
                      <div className="rounded-md bg-background/50 p-2">
                        <span className="text-muted-foreground">Rest Adj:</span>
                        <span className="ml-2 font-mono text-foreground">{fav.config.restAdjustment}s</span>
                      </div>
                      <div className="col-span-2 rounded-md bg-background/50 p-2">
                        <span className="text-muted-foreground">Prep Adj:</span>
                        <span className="ml-2 font-mono text-foreground">{fav.config.preparationAdjustment}s</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
