import React from 'react';
import { TimerConfig, formatTime } from '@/types/timer';
import { Clock, Dumbbell, Coffee, Timer } from 'lucide-react';

interface WorkoutSummaryProps {
  config: TimerConfig;
}

export const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({ config }) => {
  // Calculate total workout time
  const calculateTotalTime = () => {
    let total = config.preparationTime; // Initial preparation
    
    for (let round = 1; round <= config.rounds; round++) {
      // Work time
      total += config.workTime;
      
      // Rest time (not after last round)
      if (round < config.rounds) {
        const adjustedPause = Math.max(0, config.pauseTime + config.restAdjustment * (round - 1));
        total += adjustedPause;
        
        // Preparation time for next round
        const adjustedPrep = Math.max(0, config.preparationTime + config.preparationAdjustment * round);
        total += adjustedPrep;
      }
    }
    
    return total;
  };

  const totalSeconds = calculateTotalTime();
  const totalWorkTime = config.workTime * config.rounds;

  return (
    <div className="rounded-xl bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-mono text-lg font-bold text-primary">
            {formatTime(totalSeconds)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-work" />
          <span className="text-sm text-muted-foreground">Work</span>
          <span className="font-mono text-lg font-bold text-work">
            {formatTime(totalWorkTime)}
          </span>
        </div>
      </div>
    </div>
  );
};
