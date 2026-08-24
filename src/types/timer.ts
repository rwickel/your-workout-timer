export interface IntervalExercise {
  id: string;
  name: string;
  rounds?: number; // own round count (defaults to global)
  workTime: number; // in seconds — always drives the timer
  reps?: number; // optional rep target shown during the round (no effect on duration)
  repAdjustment?: number; // reps added/subtracted each round (only for display)
  pauseTime?: number; // rest after this exercise (defaults to global)
  workAdjustment?: number; // per-round work seconds adjustment (defaults to global)
  restAdjustment?: number;
}

export interface TimerConfig {
  exerciseName?: string; // optional label shown during the workout
  exercises?: IntervalExercise[]; // optional multi-exercise sequence per round
  workTime: number; // in seconds
  pauseTime: number; // in seconds
  preparationTime: number; // in seconds
  rounds: number;
  workAdjustment: number; // seconds to add/subtract work time each round
  restAdjustment: number; // seconds to add/subtract each round (can be negative)
  preparationAdjustment: number; // seconds to add/subtract each round
  countdownSeconds: number; // seconds before a phase end at which the spoken countdown starts
  beepSeconds: number; // seconds before a phase end at which beeps start (0 = off)
}

export type TimerPhase = 'idle' | 'preparation' | 'work' | 'pause' | 'complete';

export interface TimerState {
  phase: TimerPhase;
  currentRound: number;
  currentExercise: number; // index into config.exercises (0 when single)
  timeRemaining: number;
  isRunning: boolean;
  totalElapsed: number;
}

export const DEFAULT_CONFIG: TimerConfig = {
  workTime: 45,
  pauseTime: 15,
  preparationTime: 10,
  rounds: 8,
  workAdjustment: 0,
  restAdjustment: 0,
  preparationAdjustment: 0,
  countdownSeconds: 10,
  beepSeconds: 3,
  exercises: [
    {
      id: 'ex-1',
      name: '',
      rounds: 8,
      workTime: 45,
      pauseTime: 15,
      workAdjustment: 0,
      restAdjustment: 0,
    },
  ],
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(Math.abs(seconds) / 60);
  const secs = Math.abs(seconds) % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const parseTime = (timeString: string): number => {
  const [mins, secs] = timeString.split(':').map(Number);
  return (mins || 0) * 60 + (secs || 0);
};

// Effective rep target of an exercise in a given round (undefined when no reps are set).
export const getExerciseReps = (
  ex: IntervalExercise,
  config: TimerConfig,
  round: number
): number | undefined => {
  if (ex.reps === undefined) return undefined;
  return Math.max(0, ex.reps + (ex.repAdjustment ?? 0) * (round - 1));
};

// Effective work duration (in seconds) of an exercise in a given round,
// with its progressive second-based adjustment.
export const getExerciseDuration = (
  ex: IntervalExercise,
  config: TimerConfig,
  round: number
): number => {
  const adj = ex.workAdjustment ?? config.workAdjustment;
  return Math.max(0, ex.workTime + adj * (round - 1));
};
