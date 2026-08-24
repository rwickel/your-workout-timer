import { useState, useCallback, useRef, useEffect } from 'react';
import { TimerConfig, TimerState, TimerPhase, getExerciseDuration } from '@/types/timer';

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

  // Per-exercise work time with its own progressive adjustment
  const getWorkFor = useCallback((exIdx: number, round: number) => {
    const ex = getExercises()[exIdx];
    return getExerciseDuration(ex, config, round);
  }, [config, getExercises]);

  // Rest after a given exercise, using its own rest time/adjustment when set
  const getRestFor = useCallback((exIdx: number, round: number) => {
    const ex = getExercises()[exIdx];
    const base = ex.pauseTime ?? config.pauseTime;
    const adj = ex.restAdjustment ?? config.restAdjustment;
    return Math.max(0, base + adj * (round - 1));
  }, [config.pauseTime, config.restAdjustment, getExercises]);

  // Rounds for a given exercise (own count or global fallback)
  const getRoundsFor = useCallback((exIdx: number) => {
    return getExercises()[exIdx].rounds ?? config.rounds;
  }, [config.rounds, getExercises]);

  // Advance from an exercise to the next work phase or completion
  const advanceFromExercise = useCallback((round: number, ex: number): { phase: TimerPhase; round: number; ex: number; time: number } => {
    const exercises = getExercises();
    const isLastExercise = ex >= exercises.length - 1;

    if (round < getRoundsFor(ex)) {
      // Next round of the same exercise
      return { phase: 'work', round: round + 1, ex, time: getWorkFor(ex, round + 1) };
    }
    if (isLastExercise) {
      return { phase: 'complete', round, ex, time: 0 };
    }

    // Move to the next exercise, restarting at its own round 1
    const nextEx = ex + 1;
    return { phase: 'work', round: 1, ex: nextEx, time: getWorkFor(nextEx, 1) };
  }, [getRoundsFor, getWorkFor]);

  const getNextPhase = useCallback((
    currentPhase: TimerPhase,
    currentRound: number,
    currentEx: number
  ): { phase: TimerPhase; round: number; ex: number; time: number } => {
    switch (currentPhase) {
      case 'idle':
      case 'preparation': {
        return { phase: 'work', round: 1, ex: 0, time: getWorkFor(0, 1) };
      }
      case 'work': {
        // Rest after this exercise; skipped when its rest time is 0
        const rest = getRestFor(currentEx, currentRound);
        const upcoming = advanceFromExercise(currentRound, currentEx);
        if (rest <= 0 || upcoming.phase === 'complete') {
          // No rest (or workout is finished): go straight to the next phase
          return upcoming;
        }
        return { phase: 'pause', round: currentRound, ex: currentEx, time: rest };
      }
      case 'pause':
        return advanceFromExercise(currentRound, currentEx);
      default:
        return { phase: 'complete', round: currentRound, ex: currentEx, time: 0 };
    }
  }, [advanceFromExercise, getRestFor, getWorkFor]);

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
