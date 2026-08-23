import { useState, useCallback, useRef, useEffect } from 'react';
import { TimerConfig, TimerState, TimerPhase } from '@/types/timer';

export const useWorkoutTimer = (config: TimerConfig) => {
  const [state, setState] = useState<TimerState>({
    phase: 'idle',
    currentRound: 1,
    currentExercise: 0,
    timeRemaining: config.preparationTime,
    isRunning: false,
    totalElapsed: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Exercise sequence per round: explicit list or fallback to single work time
  const getExercises = useCallback(() => {
    if (config.exercises && config.exercises.length > 0) {
      return config.exercises;
    }
    return [{ id: 'single', name: config.exerciseName ?? '', workTime: config.workTime }];
  }, [config.exercises, config.exerciseName, config.workTime]);

  const getAdjustedPauseTime = useCallback((round: number) => {
    const adjustment = config.restAdjustment * (round - 1);
    return Math.max(0, config.pauseTime + adjustment);
  }, [config.pauseTime, config.restAdjustment]);

  // Advance from an exercise to the next work phase or completion
  const advanceFromExercise = useCallback((round: number, ex: number): { phase: TimerPhase; round: number; ex: number; time: number } => {
    const exercises = getExercises();
    const isLastExercise = ex >= exercises.length - 1;
    const isLastRound = round >= config.rounds;

    if (isLastExercise && isLastRound) {
      return { phase: 'complete', round, ex, time: 0 };
    }

    let nextRound = round;
    let nextEx = ex + 1;
    if (nextEx >= exercises.length) {
      nextEx = 0;
      nextRound = round + 1;
    }

    const base = exercises[nextEx].workTime + config.workAdjustment * (nextRound - 1);
    return { phase: 'work', round: nextRound, ex: nextEx, time: Math.max(0, base) };
  }, [config.rounds, config.workAdjustment, getExercises]);

  const getNextPhase = useCallback((
    currentPhase: TimerPhase,
    currentRound: number,
    currentEx: number
  ): { phase: TimerPhase; round: number; ex: number; time: number } => {
    switch (currentPhase) {
      case 'idle':
      case 'preparation': {
        const first = getExercises()[0];
        const base = first.workTime + config.workAdjustment * (currentRound - 1);
        return { phase: 'work', round: currentRound, ex: 0, time: Math.max(0, base) };
      }
      case 'work': {
        // Rest between phases; skipped when rest time is 0
        if (getAdjustedPauseTime(currentRound) <= 0) {
          return advanceFromExercise(currentRound, currentEx);
        }
        return { phase: 'pause', round: currentRound, ex: currentEx, time: getAdjustedPauseTime(currentRound) };
      }
      case 'pause':
        return advanceFromExercise(currentRound, currentEx);
      default:
        return { phase: 'complete', round: currentRound, ex: currentEx, time: 0 };
    }
  }, [advanceFromExercise, getAdjustedPauseTime, getExercises]);

  const tick = useCallback(() => {
    setState(prev => {
      if (!prev.isRunning || prev.phase === 'complete' || prev.phase === 'idle') {
        return prev;
      }

      const newTimeRemaining = prev.timeRemaining - 1;

      if (newTimeRemaining <= 0) {
        const next = getNextPhase(prev.phase, prev.currentRound, prev.currentExercise);
        return {
          ...prev,
          phase: next.phase,
          currentRound: next.round,
          currentExercise: next.ex,
          timeRemaining: next.time,
          totalElapsed: prev.totalElapsed + 1,
          isRunning: next.phase !== 'complete',
        };
      }

      return {
        ...prev,
        timeRemaining: newTimeRemaining,
        totalElapsed: prev.totalElapsed + 1,
      };
    });
  }, [getNextPhase]);

  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, tick]);

  const start = useCallback(() => {
    setState(prev => {
      if (prev.phase === 'idle') {
        return {
          ...prev,
          phase: 'preparation',
          currentRound: 1,
          currentExercise: 0,
          timeRemaining: config.preparationTime,
          isRunning: true,
        };
      }
      return { ...prev, isRunning: true };
    });
  }, [config.preparationTime]);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    setState({
      phase: 'idle',
      currentRound: 1,
      currentExercise: 0,
      timeRemaining: config.preparationTime,
      isRunning: false,
      totalElapsed: 0,
    });
  }, [config.preparationTime]);

  const skipPhase = useCallback(() => {
    setState(prev => {
      if (prev.phase === 'complete' || prev.phase === 'idle') return prev;
      const next = getNextPhase(prev.phase, prev.currentRound, prev.currentExercise);
      return {
        ...prev,
        phase: next.phase,
        currentRound: next.round,
        currentExercise: next.ex,
        timeRemaining: next.time,
        isRunning: next.phase !== 'complete',
      };
    });
  }, [getNextPhase]);

  const adjustTime = useCallback((delta: number) => {
    setState(prev => ({
      ...prev,
      timeRemaining: Math.max(0, prev.timeRemaining + delta),
    }));
  }, []);

  return {
    state,
    start,
    pause,
    reset,
    skipPhase,
    adjustTime,
  };
};
