import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Minus, Plus } from 'lucide-react';
import { TimerState } from '@/types/timer';

interface TimerControlsProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onAdjustTime: (delta: number) => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  state,
  onStart,
  onPause,
  onReset,
  onSkip,
  onAdjustTime,
}) => {
  const isActive = state.phase !== 'idle' && state.phase !== 'complete';

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Time Adjustment */}
      {isActive && (
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onAdjustTime(-10)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
          >
            <Minus className="h-5 w-5" />
          </motion.button>
          <span className="text-sm text-muted-foreground">±10s</span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onAdjustTime(10)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        </div>
      )}

      {/* Main Controls */}
      <div className="flex items-center gap-6">
        {/* Reset Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onReset}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
        >
          <RotateCcw className="h-6 w-6" />
        </motion.button>

        {/* Play/Pause Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={state.isRunning ? onPause : onStart}
          disabled={state.phase === 'complete'}
          className={`flex h-20 w-20 items-center justify-center rounded-full transition-all glow-primary ${
            state.phase === 'complete'
              ? 'bg-muted text-muted-foreground'
              : 'bg-primary text-primary-foreground hover:brightness-110'
          }`}
        >
          {state.isRunning ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="ml-1 h-8 w-8" />
          )}
        </motion.button>

        {/* Skip Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onSkip}
          disabled={!isActive}
          className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
            isActive
              ? 'bg-muted text-muted-foreground hover:bg-muted/80'
              : 'bg-muted/30 text-muted-foreground/30'
          }`}
        >
          <SkipForward className="h-6 w-6" />
        </motion.button>
      </div>
    </div>
  );
};
