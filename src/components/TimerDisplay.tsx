import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerState } from '@/types/timer';
import { formatTime } from '@/types/timer';

interface TimerDisplayProps {
  state: TimerState;
  totalRounds: number;
}

const phaseLabels: Record<string, string> = {
  idle: 'Ready',
  preparation: 'Get Ready',
  work: 'Work!',
  pause: 'Rest',
  complete: 'Complete!',
};

const phaseClasses: Record<string, string> = {
  idle: 'phase-preparation',
  preparation: 'phase-preparation',
  work: 'phase-work',
  pause: 'phase-pause',
  complete: 'phase-work',
};

const phaseBgClasses: Record<string, string> = {
  idle: 'bg-preparation/10',
  preparation: 'bg-preparation/10',
  work: 'bg-work/10',
  pause: 'bg-pause/10',
  complete: 'bg-work/10',
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ state, totalRounds }) => {
  const isLowTime = state.timeRemaining <= 3 && state.timeRemaining > 0 && state.phase !== 'complete';

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-4">
      {/* Phase Label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.phase}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`rounded-full px-6 py-2 ${phaseBgClasses[state.phase]}`}
        >
          <span className={`text-lg font-semibold uppercase tracking-widest ${phaseClasses[state.phase]}`}>
            {phaseLabels[state.phase]}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Main Timer */}
      <motion.div
        animate={isLowTime ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
        className="relative"
      >
        <span className={`timer-display ${phaseClasses[state.phase]} ${isLowTime ? 'animate-pulse-glow' : ''}`}>
          {formatTime(state.timeRemaining)}
        </span>
      </motion.div>

      {/* Round Indicator */}
      <div className="flex items-center gap-2">
        <span className="text-lg text-muted-foreground">Round</span>
        <span className={`text-2xl font-bold ${phaseClasses[state.phase]}`}>
          {state.currentRound}
        </span>
        <span className="text-lg text-muted-foreground">of {totalRounds}</span>
      </div>

      {/* Round Progress Dots */}
      <div className="flex gap-2">
        {Array.from({ length: totalRounds }, (_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8 }}
            animate={{
              scale: i + 1 === state.currentRound ? 1.2 : 1,
              opacity: i + 1 <= state.currentRound ? 1 : 0.3,
            }}
            className={`h-3 w-3 rounded-full transition-colors ${
              i + 1 < state.currentRound
                ? 'bg-work'
                : i + 1 === state.currentRound
                ? state.phase === 'work'
                  ? 'bg-work'
                  : state.phase === 'pause'
                  ? 'bg-pause'
                  : 'bg-preparation'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
