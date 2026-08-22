import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trash2, Plus, Pencil, Share2 } from 'lucide-react';
import { Wod, SCHEME_LABELS, formatWodTime } from '@/types/wod';
import { WodBuilder } from './WodBuilder';
import { PRESET_WODS } from '@/data/presetWods';
import { ShareModal } from './ShareModal';

interface WodPanelProps {
  wods: Wod[];
  onStart: (wod: Wod) => void;
  onSave: (wod: Wod) => void;
  onDelete: (id: string) => void;
}

type WodTab = 'mine' | 'famous';

export const WodPanel: React.FC<WodPanelProps> = ({ wods, onStart, onSave, onDelete }) => {
  const [editing, setEditing] = useState<Wod | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [tab, setTab] = useState<WodTab>('mine');
  const [sharing, setSharing] = useState<Wod | null>(null);

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
      {/* Tab menu */}
      <div className="flex gap-6">
        {(['mine', 'famous'] as WodTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm font-medium uppercase tracking-widest transition-colors ${
              tab === t
                ? 'border-b border-white text-white'
                : 'border-b border-transparent text-neutral-600 hover:text-neutral-400'
            }`}
          >
            {t === 'mine' ? 'My WODs' : 'Famous'}
          </button>
        ))}
        {tab === 'mine' && (
          <button
            onClick={() => { setEditing(null); setShowBuilder(true); }}
            className="ml-auto flex items-center self-start gap-1 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            <Plus className="h-4 w-4" />
            New WOD
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'mine' ? (
          /* ---------- My WODs ---------- */
          <motion.div
            key="mine"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {wods.length === 0 ? (
              <p className="py-2 text-sm text-neutral-600">
                No WODs yet. Create one or add a famous WOD.
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
                        onClick={() => setSharing(wod)}
                        className="p-2 text-neutral-400 transition-colors hover:text-white"
                        title="Share WOD"
                      >
                        <Share2 className="h-4 w-4" />
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
          </motion.div>
        ) : (
          /* ---------- Famous WODs ---------- */
          <motion.div
            key="famous"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-1"
          >
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
                    onClick={() => setSharing(wod)}
                    className="p-2 text-neutral-400 transition-colors hover:text-white"
                    title="Share preset"
                  >
                    <Share2 className="h-4 w-4" />
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
          </motion.div>
        )}
      </AnimatePresence>

      {sharing && <ShareModal wod={sharing} onClose={() => setSharing(null)} />}
    </motion.div>
  );
};
