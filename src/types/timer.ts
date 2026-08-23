export interface IntervalExercise {
  id: string;
  name: string;
  workTime: number; // in seconds
  pauseTime?: number; // rest after this exercise (defaults to global)
  workAdjustment?: number; // per-round adjustment (defaults to global)
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
