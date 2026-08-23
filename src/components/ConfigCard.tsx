import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { TimerConfig } from '@/types/timer';
import { TimeInput } from './TimeInput';
import { NumberInput } from './NumberInput';

interface ConfigCardProps {
  config: TimerConfig;
  onChange: (config: TimerConfig) => void;
}

export const ConfigCard: React.FC<ConfigCardProps> = ({ config, onChange }) => {
  const updateField = <K extends keyof TimerConfig>(field: K, value: TimerConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const exercises = config.exercises ?? [];

  // Ladder preview: e.g. "R1 2/2 · R2 4/4 · R3 6/6"
  const formatSec = (s: number) => `${Math.max(0, s)}s`;
  const ladderPreview = (work: number, rest: number, workAdj: number, restAdj: number, maxRound: number) => {
    const roundsToShow = Math.min(3, maxRound);
    const parts = Array.from({ length: roundsToShow }, (_, i) => {
      const r = i + 1;
      return `R${r} ${formatSec(work + workAdj * (r - 1))}/${formatSec(rest + restAdj * (r - 1))}`;
    });
    if (maxRound > roundsToShow) parts.push('…');
    return parts.join(' · ');
  };

  const addExercise = () => {
    updateField('exercises', [
      ...exercises,
      { id: `ex-${Date.now()}`, name: '', workTime: config.workTime },
    ]);
  };

  const updateExercise = (id: string, field: 'name' | 'workTime' | 'pauseTime' | 'workAdjustment' | 'restAdjustment', value: string) => {
    updateField('exercises', exercises.map(ex => {
      if (ex.id !== id) return ex;
      if (field === 'name') return { ...ex, name: value };
      return { ...ex, [field]: Number(value) || 0 };
    }));
  };

  const removeExercise = (id: string) => {
    updateField('exercises', exercises.filter(ex => ex.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Exercise Sequence */}
      <div className="space-y-4">
        <p className="section-label">Exercises</p>
        {exercises.length === 0 ? (
          <>
            <input
              type="text"
              value={config.exerciseName ?? ''}
              onChange={(e) => updateField('exerciseName', e.target.value)}
              placeholder="Exercise (optional)..."
              className="w-full rounded-lg border border-neutral-800 bg-transparent px-3 py-3 text-white placeholder:text-neutral-600 transition-colors focus:border-neutral-400 focus:outline-none"
            />
            <TimeInput
              label="Work Time"
              value={config.workTime}
              onChange={(v) => updateField('workTime', v)}
            />
          </>
        ) : (
          <div className="space-y-4">
            {exercises.map((ex, i) => (
              <div key={ex.id} className="space-y-4 rounded-xl border border-neutral-900 p-4">
                <div className="flex items-center gap-2">
                  <span className="section-label flex-1">Exercise {i + 1}</span>
                  <button
                    onClick={() => removeExercise(ex.id)}
                    className="flex h-11 w-11 items-center justify-center text-neutral-600 transition-colors hover:text-white active:scale-95"
                    aria-label={`Remove exercise ${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={ex.name}
                  onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
                  placeholder="Exercise name..."
                  className="w-full rounded-lg border border-neutral-800 bg-transparent px-3 py-2.5 text-white placeholder:text-neutral-600 transition-colors focus:border-neutral-400 focus:outline-none"
                />
                <NumberInput
                  label="Rounds"
                  value={ex.rounds ?? config.rounds}
                  onChange={(v) => updateExercise(ex.id, 'rounds', String(Math.max(1, v)))}
                  min={1}
                  max={99}
                />
                <TimeInput
                  label="Work Time"
                  value={ex.workTime}
                  onChange={(v) => updateExercise(ex.id, 'workTime', String(v))}
                />
                <TimeInput
                  label="Rest Time"
                  value={ex.pauseTime ?? config.pauseTime}
                  onChange={(v) => updateExercise(ex.id, 'pauseTime', String(v))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <NumberInput
                    label="Work Adj. (+s/Round)"
                    value={ex.workAdjustment ?? config.workAdjustment}
                    onChange={(v) => updateExercise(ex.id, 'workAdjustment', String(v))}
                    min={-30}
                    max={30}
                    suffix="s"
                    showSign
                  />
                  <NumberInput
                    label="Rest Adj. (+s/Round)"
                    value={ex.restAdjustment ?? config.restAdjustment}
                    onChange={(v) => updateExercise(ex.id, 'restAdjustment', String(v))}
                    min={-30}
                    max={30}
                    suffix="s"
                    showSign
                  />
                </div>
                <p className="text-xs text-neutral-500 tabular">
                  {ladderPreview(
                    ex.workTime,
                    ex.pauseTime ?? config.pauseTime,
                    ex.workAdjustment ?? config.workAdjustment,
                    ex.restAdjustment ?? config.restAdjustment,
                    ex.rounds ?? config.rounds
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
        {exercises.length > 0 && (
          <p className="text-xs text-neutral-600">
            Each round runs all exercises with their own settings.
          </p>
        )}
        <button
          onClick={addExercise}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-800 text-sm text-neutral-400 transition-colors duration-150 hover:border-neutral-400 hover:text-white active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Exercise
        </button>
      </div>

      {/* Rest between exercises / rounds — fallback for exercises without own value */}
      {exercises.length > 0 && (
        <TimeInput
          label="Rest Time (between exercises)"
          value={config.pauseTime}
          onChange={(v) => updateField('pauseTime', v)}
        />
      )}
    </motion.div>
  );
};
