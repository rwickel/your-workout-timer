import { describe, it, expect } from 'vitest';
import { TimerConfig } from '@/types/timer';
import { encodeInterval, decodeInterval, intervalShareUrlFor } from '@/lib/intervalShare';

const base: TimerConfig = {
  exerciseName: 'Circuit',
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
    { id: 'ex-1', name: 'Pushups', workTime: 40, reps: 12, repAdjustment: 2 },
    { id: 'ex-2', name: '', workTime: 30, pauseTime: 0, restAdjustment: -1 },
  ],
};

describe('REQ-I8 / SW-UR-I7 — interval sharing', () => {
  it('round-trips a full configuration', () => {
    const decoded = decodeInterval(encodeInterval(base));
    expect(decoded).not.toBeNull();
    expect(decoded!.exerciseName).toBe('Circuit');
    expect(decoded!.workTime).toBe(45);
    expect(decoded!.pauseTime).toBe(15);
    expect(decoded!.preparationTime).toBe(10);
    expect(decoded!.rounds).toBe(8);
    const [a, b] = decoded!.exercises!;
    expect(a.name).toBe('Pushups');
    expect(a.reps).toBe(12);
    expect(a.repAdjustment).toBe(2);
    expect(b.pauseTime).toBe(0);
    expect(b.restAdjustment).toBe(-1);
  });

  it('produces URL-safe base64 without padding', () => {
    const enc = encodeInterval(base);
    expect(enc).not.toMatch(/[+/=]/);
  });

  it('builds a share URL containing the payload', () => {
    expect(intervalShareUrlFor(base)).toMatch(/^https:\/\/.+\/interval\?d=.+/);
  });

  it('returns null for garbage input', () => {
    expect(decodeInterval('not-valid-base64!!!')).toBeNull();
    expect(decodeInterval('')).toBeNull();
  });

  it('keeps zero rest as an explicit 0 after round-trip', () => {
    const decoded = decodeInterval(encodeInterval(base))!;
    expect(decoded.exercises![1].pauseTime).toBe(0);
  });
});
