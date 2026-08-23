import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerState } from '@/types/timer';
import { formatTime } from '@/types/timer';

interface TimerDisplayProps {
  state: TimerState;
  totalRounds: number;
  exerciseName?: string;
}

const phaseLabels: Record<string, string> = {
  idle: 'Ready',
  preparation: 'Get Ready',
  work: 'Work',
  pause: 'Rest',
  complete: 'Complete',
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ state, totalRounds, exerciseName }) => {
  const isLowTime = state.timeRemaining <= 3 && state.timeRemaining > 0 && state.phase !== 'complete';

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-4">
      {/* Exercise Name */}
      {exerciseName && state.phase !== 'complete' && (
        <p className="text-lg font-bold text-white">{exerciseName}</p>
      )}

      {/* Phase Label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={state.phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`section-label text-sm ${state.phase === 'work' ? 'text-white' : ''}`}
        >
          {phaseLabels[state.phase]}
        </motion.span>
      </AnimatePresence>

      {/* Main Timer */}
      <motion.div
        animate={isLowTime ? { opacity: [1, 0.4, 1] } : {}}
        transition={{ duration: 1, repeat: isLowTime ? Infinity : 0 }}
      >
        <span className="timer-display">
          {formatTime(state.timeRemaining)}
        </span>
      </motion.div>

      {/* Round Indicator */}
      <div className="flex items-baseline gap-2">
        <span className="section-label">Round</span>
        <span className="text-2xl font-bold text-white tabular">{state.currentRound}</span>
        <span className="text-lg text-neutral-400 tabular">/ {totalRounds}</span>
      </div>

      {/* Round Progress Dots */}
      <div className="flex gap-2">
        {Array.from({ length: totalRounds }, (_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              scale: i + 1 === state.currentRound ? 1.25 : 1,
              opacity: i + 1 <= state.currentRound ? 1 : 0.25,
            }}
            className={`h-1.5 w-6 rounded-full ${
              i + 1 === state.currentRound ? 'bg-white' : 'bg-neutral-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
