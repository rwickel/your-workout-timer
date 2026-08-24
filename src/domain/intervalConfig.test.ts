import { describe, it, expect } from 'vitest';
import { DEFAULT_CONFIG, getExerciseDuration, getExerciseReps, TimerConfig } from '@/types/timer';

const cfg = (over: Partial<TimerConfig> = {}): TimerConfig => ({
  ...DEFAULT_CONFIG,
  exercises: undefined,
  ...over,
});

describe('REQ-I1 / SW-UR-I1 — config model', () => {
  it('computes work duration with per-round adjustment', () => {
    const ex = { id: 'a', name: 'A', workTime: 40 };
    expect(getExerciseDuration(ex, cfg({ workAdjustment: 5 }), 3)).toBe(50);
  });

  it('floors negative durations at 0', () => {
    const ex = { id: 'a', name: 'A', workTime: 10 };
    expect(getExerciseDuration(ex, cfg({ workAdjustment: -20 }), 3)).toBe(0);
  });

  it('uses the exercise-specific adjustment over the global one', () => {
    const ex = { id: 'a', name: 'A', workTime: 40, workAdjustment: 2 };
    expect(getExerciseDuration(ex, cfg({ workAdjustment: 99 }), 2)).toBe(42);
  });

  it('returns undefined reps when none are set (reps optional)', () => {
    expect(getExerciseReps({ id: 'a', name: 'A', workTime: 30 }, cfg(), 1)).toBeUndefined();
  });

  it('adjusts reps per round without touching duration (REQ: reps never influence timer)', () => {
    const ex = { id: 'a', name: 'A', workTime: 30, reps: 10, repAdjustment: 2 };
    const c = cfg();
    expect(getExerciseReps(ex, c, 1)).toBe(10);
    expect(getExerciseReps(ex, c, 3)).toBe(14);
    expect(getExerciseDuration(ex, c, 3)).toBe(30); // unchanged
  });

  it('floors adjusted reps at 0', () => {
    const ex = { id: 'a', name: 'A', workTime: 30, reps: 4, repAdjustment: -10 };
    expect(getExerciseReps(ex, cfg(), 3)).toBe(0);
  });
});
