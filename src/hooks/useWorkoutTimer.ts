import { useState, useCallback, useRef, useEffect } from 'react';
import { TimerConfig, TimerState, TimerPhase } from '@/types/timer';

export const useWorkoutTimer = (config: TimerConfig) => {
  const [state, setState] = useState<TimerState>({
    phase: 'idle',
    currentRound: 1,
    timeRemaining: config.preparationTime,
    isRunning: false,
    totalElapsed: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getAdjustedWorkTime = useCallback((round: number) => {
    const adjustment = config.workAdjustment * (round - 1);
    return Math.max(0, config.workTime + adjustment);
  }, [config.workTime, config.workAdjustment]);

  const getAdjustedPauseTime = useCallback((round: number) => {
    const adjustment = config.restAdjustment * (round - 1);
    return Math.max(0, config.pauseTime + adjustment);
  }, [config.pauseTime, config.restAdjustment]);

  const getAdjustedPrepTime = useCallback((round: number) => {
    const adjustment = config.preparationAdjustment * (round - 1);
    return Math.max(0, config.preparationTime + adjustment);
  }, [config.preparationTime, config.preparationAdjustment]);

  const getNextPhase = useCallback((currentPhase: TimerPhase, currentRound: number): { phase: TimerPhase; round: number; time: number } => {
    switch (currentPhase) {
      case 'idle':
      case 'preparation':
        return { phase: 'work', round: currentRound, time: getAdjustedWorkTime(currentRound) };
      case 'work':
        if (currentRound >= config.rounds) {
          return { phase: 'complete', round: currentRound, time: 0 };
        }
        return { phase: 'pause', round: currentRound, time: getAdjustedPauseTime(currentRound) };
      case 'pause':
        const nextRound = currentRound + 1;
        return { phase: 'preparation', round: nextRound, time: getAdjustedPrepTime(nextRound) };
      default:
        return { phase: 'complete', round: currentRound, time: 0 };
    }
  }, [config.rounds, getAdjustedWorkTime, getAdjustedPauseTime, getAdjustedPrepTime]);

  const tick = useCallback(() => {
    setState(prev => {
      if (!prev.isRunning || prev.phase === 'complete' || prev.phase === 'idle') {
        return prev;
      }

      const newTimeRemaining = prev.timeRemaining - 1;

      if (newTimeRemaining <= 0) {
        const next = getNextPhase(prev.phase, prev.currentRound);
        return {
          ...prev,
          phase: next.phase,
          currentRound: next.round,
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
      timeRemaining: config.preparationTime,
      isRunning: false,
      totalElapsed: 0,
    });
  }, [config.preparationTime]);

  const skipPhase = useCallback(() => {
    setState(prev => {
      if (prev.phase === 'complete' || prev.phase === 'idle') return prev;
      const next = getNextPhase(prev.phase, prev.currentRound);
      return {
        ...prev,
        phase: next.phase,
        currentRound: next.round,
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
    getAdjustedWorkTime,
    getAdjustedPauseTime,
    getAdjustedPrepTime,
  };
};
