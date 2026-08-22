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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-t border-neutral-900 pt-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-label">Favorites</h3>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-white"
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
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Workout name..."
                className="flex-1 rounded-md border border-neutral-900 bg-transparent px-3 py-2 text-white placeholder:text-neutral-600 focus:border-neutral-400 focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
              />
              <button
                onClick={handleSave}
                className="rounded-md bg-white px-4 py-2 font-medium text-black transition-colors hover:bg-neutral-200"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="rounded-md border border-neutral-900 p-2 text-neutral-400 transition-colors hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {favorites.length === 0 ? (
        <p className="py-4 text-sm text-neutral-600">
          No saved workouts yet.
        </p>
      ) : (
        <div className="space-y-1">
          {favorites.map((fav) => (
            <motion.div
              key={fav.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border-b border-neutral-900"
            >
              <div
                className="flex cursor-pointer items-center gap-3 py-3"
                onClick={() => toggleExpand(fav.id)}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{fav.name}</p>
                  <p className="text-xs text-neutral-400 tabular">
                    {formatTime(fav.config.workTime)} work · {formatTime(fav.config.pauseTime)} rest · {fav.config.rounds} rounds
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect(fav.config); }}
                  className="p-2 text-neutral-400 transition-colors hover:text-white"
                  title="Load workout"
                >
                  <Play className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(fav.id); }}
                  className="p-2 text-neutral-600 transition-colors hover:text-white"
                  title="Delete workout"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <span className="text-neutral-600">
                  {expandedId === fav.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
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
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pb-3 text-sm">
                      <div><span className="text-neutral-400">Prep:</span> <span className="ml-1 font-mono text-white tabular">{formatTime(fav.config.preparationTime)}</span></div>
                      <div><span className="text-neutral-400">Rounds:</span> <span className="ml-1 font-mono text-white tabular">{fav.config.rounds}</span></div>
                      <div><span className="text-neutral-400">Work Adj:</span> <span className="ml-1 font-mono text-white tabular">{fav.config.workAdjustment}s</span></div>
                      <div><span className="text-neutral-400">Rest Adj:</span> <span className="ml-1 font-mono text-white tabular">{fav.config.restAdjustment}s</span></div>
                      <div><span className="text-neutral-400">Prep Adj:</span> <span className="ml-1 font-mono text-white tabular">{fav.config.preparationAdjustment}s</span></div>
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
