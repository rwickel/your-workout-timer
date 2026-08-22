import React from 'react';
import { TimerConfig, formatTime } from '@/types/timer';

interface WorkoutSummaryProps {
  config: TimerConfig;
}

export const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({ config }) => {
  // Calculate total workout time
  const calculateTotalTime = () => {
    let total = 0;

    for (let round = 1; round <= config.rounds; round++) {
      total += config.workTime;

      // Rest time between rounds (not after the last round)
      if (round < config.rounds) {
        const adjustedPause = Math.max(0, config.pauseTime + config.restAdjustment * (round - 1));
        total += adjustedPause;
      }
    }

    return Math.max(0, total);
  };

  const totalSeconds = calculateTotalTime();
  const totalWorkTime = config.workTime * config.rounds;

  return (
    <div className="flex items-center justify-between border-t border-b border-neutral-900 py-4">
      <div>
        <p className="section-label">Total</p>
        <p className="mt-1 font-mono text-xl font-bold text-white tabular">
          {formatTime(totalSeconds)}
        </p>
      </div>
      <div className="text-right">
        <p className="section-label">Work</p>
        <p className="mt-1 font-mono text-xl font-bold text-neutral-400 tabular">
          {formatTime(totalWorkTime)}
        </p>
      </div>
    </div>
  );
};
