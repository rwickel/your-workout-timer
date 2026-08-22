import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import { Wod, WodScheme, SCHEME_LABELS, DEFAULT_WOD } from '@/types/wod';

interface WodBuilderProps {
  onSave: (wod: Wod) => void;
  onCancel: () => void;
  initial?: Wod | null;
}

const SCHEMES: WodScheme[] = ['amrap', 'fortime', 'emom', 'rounds'];

/* Stepper with −/+ buttons and a directly editable value */
const EditableStepper: React.FC<{
  value: number;
  onChange: (v: number) => void;
  min: number;
  step: number;
  size?: 'lg' | 'sm';
}> = ({ value, onChange, min, step, size = 'lg' }) => {
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? String(value);

  const commit = () => {
    if (draft !== null) {
      const n = parseInt(draft, 10);
      if (!isNaN(n)) onChange(Math.max(min, n));
      setDraft(null);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="text-neutral-400 transition-colors hover:text-white"
        aria-label="Decrease"
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9-]/g, ''))}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
        className={`w-16 bg-transparent text-center font-mono font-bold text-white tabular focus:outline-none focus:text-neutral-300 ${
          size === 'lg' ? 'text-3xl' : 'text-xl'
        }`}
        aria-label="Value"
      />
      <button
        onClick={() => onChange(value + step)}
        className="text-neutral-400 transition-colors hover:text-white"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
};

export const WodBuilder: React.FC<WodBuilderProps> = ({ onSave, onCancel, initial }) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [scheme, setScheme] = useState<WodScheme>(initial?.scheme ?? DEFAULT_WOD.scheme);
  const [timeCapMinutes, setTimeCapMinutes] = useState(
    Math.round((initial?.timeCapSeconds ?? DEFAULT_WOD.timeCapSeconds) / 60)
  );
  const [rounds, setRounds] = useState(initial?.rounds ?? DEFAULT_WOD.rounds);
  const [roundSeconds, setRoundSeconds] = useState(initial?.roundSeconds ?? DEFAULT_WOD.roundSeconds ?? 60);
  const [exerciseRest, setExerciseRest] = useState(initial?.exerciseRestSeconds ?? 30);
  const [movements, setMovements] = useState(initial?.movements ?? DEFAULT_WOD.movements);

  const updateMovement = (id: string, field: 'name' | 'reps', value: string) => {
    setMovements(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: field === 'reps' ? Math.max(1, Number(value) || 1) : value } : m))
    );
  };

  const addMovement = () => {
    setMovements(prev => [...prev, { id: `m${Date.now()}`, name: '', reps: 10 }]);
  };

  const removeMovement = (id: string) => {
    setMovements(prev => prev.filter(m => m.id !== id));
  };

  const handleSave = () => {
    const cleaned = movements.filter(m => m.name.trim());
    if (cleaned.length === 0) return;
    onSave({
      ...(initial ?? { id: '' }),
      id: initial?.id ?? '',
      name: name.trim(),
      scheme,
      timeCapSeconds: Math.max(1, timeCapMinutes) * 60,
      roundSeconds,
      exerciseRestSeconds: exerciseRest,
      rounds,
      movements: cleaned,
    });
  };

  const showTimeCap = scheme === 'amrap' || scheme === 'fortime' || scheme === 'rounds';
  const showRounds = scheme === 'emom' || scheme === 'rounds';
  const showRoundSeconds = scheme === 'emom';
  const showExerciseRest = scheme === 'rounds';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="section-label">{initial ? 'Edit WOD' : 'New WOD'}</h3>
        <button onClick={onCancel} className="text-neutral-600 transition-colors hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Name */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="WOD name..."
        className="w-full rounded-md border border-neutral-900 bg-transparent px-3 py-2 text-white placeholder:text-neutral-600 focus:border-neutral-400 focus:outline-none"
        autoFocus
      />

      {/* Scheme selector */}
      <div className="flex flex-wrap gap-2">
        {SCHEMES.map(s => (
          <button
            key={s}
            onClick={() => setScheme(s)}
            className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-widest transition-colors ${
              scheme === s
                ? 'border-white bg-white text-black'
                : 'border-neutral-900 text-neutral-400 hover:border-neutral-400 hover:text-white'
            }`}
          >
            {SCHEME_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Time cap / Rounds */}
      <div className="flex gap-8">
        {showTimeCap && (
          <div>
            <p className="section-label">{scheme === 'fortime' ? 'Time Cap (min)' : 'Duration (min)'}</p>
            <div className="mt-2">
              <EditableStepper value={timeCapMinutes} onChange={setTimeCapMinutes} min={1} step={1} />
            </div>
          </div>
        )}
        {showRounds && (
          <div>
            <p className="section-label">Rounds</p>
            <div className="mt-2">
              <EditableStepper value={rounds} onChange={setRounds} min={1} step={1} />
            </div>
          </div>
        )}
        {showRoundSeconds && (
          <div>
            <p className="section-label">Round Time (s)</p>
            <div className="mt-2">
              <EditableStepper value={roundSeconds} onChange={v => setRoundSeconds(Math.max(10, v))} min={10} step={5} />
            </div>
          </div>
        )}
        {showExerciseRest && (
          <div>
            <p className="section-label">Rest Between Exercises (s)</p>
            <div className="mt-2">
              <EditableStepper value={exerciseRest} onChange={setExerciseRest} min={0} step={5} />
            </div>
          </div>
        )}
      </div>

      {/* Movements */}
      <div className="space-y-2">
        <p className="section-label">Movements</p>
        {movements.map(m => (
          <div key={m.id} className="flex items-center gap-2">
            <input
              type="text"
              value={m.name}
              onChange={(e) => updateMovement(m.id, 'name', e.target.value)}
              placeholder="Movement..."
              className="min-w-0 flex-1 rounded-md border border-neutral-900 bg-transparent px-3 py-2 text-white placeholder:text-neutral-600 focus:border-neutral-400 focus:outline-none"
            />
            <div className="rounded-md border border-neutral-900 px-1 py-0.5">
              <EditableStepper
                value={m.reps}
                onChange={(v) => updateMovement(m.id, 'reps', String(v))}
                min={1}
                step={1}
                size="sm"
              />
            </div>
            <button
              onClick={() => removeMovement(m.id)}
              className="p-2 text-neutral-600 transition-colors hover:text-white"
              aria-label="Remove movement"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          onClick={addMovement}
          className="flex items-center gap-1 pt-1 text-sm text-neutral-400 transition-colors hover:text-white"
        >
          <Plus className="h-4 w-4" />
          Add Movement
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={movements.filter(m => m.name.trim()).length === 0}
        className="w-full rounded-lg bg-white py-4 text-sm font-semibold uppercase tracking-widest text-black transition-colors hover:bg-neutral-200 disabled:bg-neutral-900 disabled:text-neutral-600"
      >
        Save WOD
      </button>
    </motion.div>
  );
};
