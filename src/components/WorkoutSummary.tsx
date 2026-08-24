import React from 'react';
import { TimerConfig, IntervalExercise, formatTime, getExerciseDuration } from '@/types/timer';

interface WorkoutSummaryProps {
  config: TimerConfig;
}

export const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({ config }) => {
  // Calculate total workout time, mirroring useWorkoutTimer's phase machine
  const calculateTotalTime = () => {
    const exercises: IntervalExercise[] =
      config.exercises && config.exercises.length > 0
        ? config.exercises
        : [{ id: 'single', name: '', workTime: config.workTime }];

    let total = Math.max(0, config.preparationTime);
    let totalWork = 0;

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const exRounds = ex.rounds ?? config.rounds;
      const rAdj = ex.restAdjustment ?? config.restAdjustment;
      const baseRest = ex.pauseTime ?? config.pauseTime;

      for (let round = 1; round <= exRounds; round++) {
        const isFinalPhase = i === exercises.length - 1 && round === exRounds;
        const work = getExerciseDuration(ex, config, round);
        total += work;
        totalWork += work;

        // Rest follows every phase except the very last one
        if (!isFinalPhase) {
          const rest = Math.max(0, baseRest + rAdj * (round - 1));
          // Runner skips zero/negative rest entirely
          total += rest;
        }
      }
    }

    return { total: Math.max(0, total), totalWork };
  };

  const { total: totalSeconds, totalWork } = calculateTotalTime();

  return (
    <div className="flex items-center justify-between border-y border-neutral-900 py-5">
      <div>
        <p className="section-label">Total</p>
        <p className="mt-1 font-mono text-xl font-bold text-white tabular">
          {formatTime(totalSeconds)}
        </p>
      </div>
      <div className="text-right">
        <p className="section-label">Work</p>
        <p className="mt-1 font-mono text-xl font-bold text-neutral-400 tabular">
          {formatTime(totalWork)}
        </p>
      </div>
    </div>
  );
};
