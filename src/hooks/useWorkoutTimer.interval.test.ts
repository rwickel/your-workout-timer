import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkoutTimer } from './useWorkoutTimer';
import { TimerConfig } from '@/types/timer';

const single = (over: Partial<TimerConfig> = {}): TimerConfig => ({
  exerciseName: 'Test',
  workTime: 5,
  pauseTime: 3,
  preparationTime: 2,
  rounds: 3,
  workAdjustment: 0,
  restAdjustment: 0,
  preparationAdjustment: 0,
  countdownSeconds: 10,
  beepSeconds: 0,
  exercises: undefined,
  ...over,
});

const run = (hook: { result: { current: ReturnType<typeof useWorkoutTimer> } }, seconds: number) => {
  for (let i = 0; i < seconds; i++) {
    act(() => { vi.advanceTimersByTime(1000); });
  }
};

describe('REQ-I3 / SW-UR-I2 — timer phase machine', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('runs preparation then work then rest then completes', () => {
    const { result } = renderHook(() => useWorkoutTimer(single()));
    act(() => { result.current.start(); });
    expect(result.current.state.phase).toBe('preparation');

    run(result.current, 2); // prep over
    expect(result.current.state).toMatchObject({ phase: 'work', currentRound: 1 });

    run(result.current, 5); // work r1 done -> rest r1
    expect(result.current.state).toMatchObject({ phase: 'pause', currentRound: 1 });

    run(result.current, 3); // rest done -> work r2
    expect(result.current.state).toMatchObject({ phase: 'work', currentRound: 2 });

    // rounds 2 and 3 (rest only between rounds)
    run(result.current, 5 + 3);
    expect(result.current.state.phase).toBe('work');
    expect(result.current.state.currentRound).toBe(3);

    // final round: no rest afterwards (REQ-I3)
    run(result.current, 5);
    expect(result.current.state.phase).toBe('complete');
    expect(result.current.state.isRunning).toBe(false);
  });

  it('skips rest entirely when rest = 0 and still announces round changes via state', () => {
    const { result } = renderHook(() => useWorkoutTimer(single({ pauseTime: 0 })));
    act(() => { result.current.start(); });
    run(result.current, 2);
    for (let r = 1; r <= 3; r++) {
      expect(result.current.state).toMatchObject({ phase: 'work', currentRound: r });
      if (r < 3) run(result.current, 5);
    }
    run(result.current, 5);
    expect(result.current.state.phase).toBe('complete');
  });

  it('applies progressive work/rest adjustments per round', () => {
    const { result } = renderHook(() =>
      useWorkoutTimer(single({ workAdjustment: 2, restAdjustment: -1 }))
    );
    act(() => { result.current.start(); });
    run(result.current, 2);
    expect(result.current.state.timeRemaining).toBe(5); // r1: 5+0
    run(result.current, 5 + 3);
    expect(result.current.state.timeRemaining).toBe(7); // r2: 5+2
    run(result.current, 7 + 2); // rest r2 = max(0, 3-1) = 2
    expect(result.current.state.timeRemaining).toBe(9); // r3: 5+4
  });

  it('runs each exercise with its own rounds before moving on', () => {
    const cfg = single({
      rounds: 2,
      exercises: [
        { id: 'a', name: 'A', workTime: 4, rounds: 3 },
        { id: 'b', name: 'B', workTime: 6 },
      ],
      pauseTime: 0,
    });
    const { result } = renderHook(() => useWorkoutTimer(cfg));
    act(() => { result.current.start(); });
    run(result.current, 2);
    expect(result.current.state).toMatchObject({ currentExercise: 0, currentRound: 1 });
    run(result.current, 4 * 3 - 4);
    expect(result.current.state).toMatchObject({ currentExercise: 0, currentRound: 3 });
    run(result.current, 4);
    expect(result.current.state).toMatchObject({ currentExercise: 1, currentRound: 1 });
    run(result.current, 6 * 2);
    expect(result.current.state.phase).toBe('complete');
  });

  it('supports explicit preparation override from global settings', () => {
    const { result } = renderHook(() => useWorkoutTimer(single({ preparationTime: 10 })));
    act(() => { result.current.reset(4); });
    expect(result.current.state.timeRemaining).toBe(4);
    act(() => { result.current.start(4); });
    expect(result.current.state.phase).toBe('preparation');
    run(result.current, 4);
    expect(result.current.state.phase).toBe('work');
  });

  it('totalElapsed equals prep + all executed phases (no trailing rest)', () => {
    const cfg = single(); // 2 prep + 3×(5 work) + 2×(3 rest) = 23
    const { result } = renderHook(() => useWorkoutTimer(cfg));
    act(() => { result.current.start(); });
    run(result.current, 60);
    expect(result.current.state.totalElapsed).toBe(23);
  });
});
