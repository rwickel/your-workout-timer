import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
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
    <div className="flex items-center justify-center gap-8 sm:gap-12">
      {/* Left column: Reset + decrease */}
      <div className="flex w-16 flex-col items-center gap-5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onReset}
          className="p-1 text-neutral-400 transition-colors hover:text-white"
          aria-label="Reset"
        >
          <RotateCcw className="h-7 w-7" />
        </motion.button>
        {isActive && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onAdjustTime(-10)}
            className="flex h-11 w-full items-center justify-center rounded-full border border-neutral-900 text-sm text-neutral-400 tabular transition-colors hover:border-neutral-400 hover:text-white"
          >
            -10s
          </motion.button>
        )}
      </div>

      {/* Play/Pause Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={state.isRunning ? onPause : onStart}
        disabled={state.phase === 'complete'}
        className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full transition-opacity ${
          state.phase === 'complete'
            ? 'bg-neutral-900 text-neutral-600'
            : 'bg-white text-black hover:bg-neutral-200'
        }`}
      >
        {state.isRunning ? (
          <Pause className="h-8 w-8" />
        ) : (
          <Play className="ml-1 h-8 w-8" />
        )}
      </motion.button>

      {/* Right column: Skip + increase */}
      <div className="flex w-16 flex-col items-center gap-5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onSkip}
          disabled={!isActive}
          className={`p-1 transition-colors ${
            isActive ? 'text-neutral-400 hover:text-white' : 'text-neutral-700'
          }`}
          aria-label="Skip"
        >
          <SkipForward className="h-7 w-7" />
        </motion.button>
        {isActive && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onAdjustTime(10)}
            className="flex h-11 w-full items-center justify-center rounded-full border border-neutral-900 text-sm text-neutral-400 tabular transition-colors hover:border-neutral-400 hover:text-white"
          >
            +10s
          </motion.button>
        )}
      </div>
    </div>
  );
};
