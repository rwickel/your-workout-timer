import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trash2, Plus, Pencil } from 'lucide-react';
import { Wod, SCHEME_LABELS, formatWodTime } from '@/types/wod';
import { WodBuilder } from './WodBuilder';
import { PRESET_WODS } from '@/data/presetWods';

interface WodPanelProps {
  wods: Wod[];
  onStart: (wod: Wod) => void;
  onSave: (wod: Wod) => void;
  onDelete: (id: string) => void;
}

export const WodPanel: React.FC<WodPanelProps> = ({ wods, onStart, onSave, onDelete }) => {
  const [editing, setEditing] = useState<Wod | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  if (showBuilder) {
    return (
      <WodBuilder
        initial={editing}
        onSave={(wod) => { onSave(wod); setShowBuilder(false); setEditing(null); }}
        onCancel={() => { setShowBuilder(false); setEditing(null); }}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="section-label">My WODs</h3>
        <button
          onClick={() => { setEditing(null); setShowBuilder(true); }}
          className="flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-white"
        >
          <Plus className="h-4 w-4" />
          New WOD
        </button>
      </div>

      {wods.length === 0 ? (
        <p className="py-2 text-sm text-neutral-600">
          No WODs yet. Create your first one!
        </p>
      ) : (
        <div className="space-y-1">
          <AnimatePresence>
            {wods.map(wod => (
              <motion.div
                key={wod.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 border-b border-neutral-900 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{wod.name || 'Unnamed WOD'}</p>
                  <p className="text-xs text-neutral-400 tabular">
                    {SCHEME_LABELS[wod.scheme]}
                    {wod.scheme !== 'rounds' && ` · ${formatWodTime(wod.timeCapSeconds)}`}
                    {(wod.scheme === 'emom' || wod.scheme === 'rounds') && ` · ${wod.rounds} rounds`}
                    {' · '}
                    {wod.movements.map(m => `${m.reps} ${m.name}`).join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => onStart(wod)}
                  className="p-2 text-neutral-400 transition-colors hover:text-white"
                  title="Start WOD"
                >
                  <Play className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { setEditing(wod); setShowBuilder(true); }}
                  className="p-2 text-neutral-400 transition-colors hover:text-white"
                  title="Edit WOD"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(wod.id)}
                  className="p-2 text-neutral-600 transition-colors hover:text-white"
                  title="Delete WOD"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Presets: famous bodyweight WODs */}
      <div className="border-t border-neutral-900 pt-6">
        <h3 className="section-label mb-3">Famous WODs</h3>
        <div className="space-y-1">
          {PRESET_WODS.map(wod => {
            const saved = wods.some(w => w.name === wod.name);
            return (
              <div key={wod.id} className="flex items-center gap-3 border-b border-neutral-900 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{wod.name}</p>
                  <p className="text-xs text-neutral-400 tabular">
                    {SCHEME_LABELS[wod.scheme]}
                    {wod.scheme === 'amrap' && ` · ${formatWodTime(wod.timeCapSeconds)}`}
                    {(wod.scheme === 'emom' || wod.scheme === 'rounds') && ` · ${wod.rounds} rounds`}
                    {' · '}
                    {wod.movements.slice(0, 3).map(m => `${m.reps} ${m.name}`).join(', ')}
                    {wod.movements.length > 3 && ' …'}
                  </p>
                </div>
                <button
                  onClick={() => onStart({ ...wod, id: '' })}
                  className="p-2 text-neutral-400 transition-colors hover:text-white"
                  title="Start preset"
                >
                  <Play className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onSave({ ...wod, id: '' })}
                  disabled={saved}
                  className="p-2 text-neutral-400 transition-colors hover:text-white disabled:text-neutral-700"
                  title={saved ? 'Already in My WODs' : 'Add to My WODs'}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
