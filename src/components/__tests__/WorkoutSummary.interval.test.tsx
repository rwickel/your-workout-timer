import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkoutSummary } from '../WorkoutSummary';
import { TimerConfig } from '@/types/timer';

const base: TimerConfig = {
  exerciseName: 'Test',
  workTime: 45,
  pauseTime: 15,
  preparationTime: 10,
  rounds: 8,
  workAdjustment: 0,
  restAdjustment: 0,
  preparationAdjustment: 0,
  countdownSeconds: 10,
  beepSeconds: 3,
  exercises: undefined,
};

const mmss = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

describe('REQ-I4 / SW-UR-I3 — total time matches the runner', () => {
  it('default config: prep + rounds×work + (rounds−1)×rest', () => {
    render(<WorkoutSummary config={base} />);
    // 10 + 8×45 + 7×15 = 475
    expect(screen.getByText(mmss(475))).toBeInTheDocument();
  });

  it('includes preparation time', () => {
    render(<WorkoutSummary config={{ ...base, preparationTime: 30 }} />);
    expect(screen.getByText(mmss(495))).toBeInTheDocument();
  });

  it('applies work/rest adjustments per round', () => {
    render(<WorkoutSummary config={{ ...base, workAdjustment: 5, restAdjustment: -2 }} />);
    // work: Σ(45+5(r-1)), r1..8 = 8*45+5*28=500
    // rest (r1..r7): Σ max(0, 15-2(r-1)) = 15+13+11+9+7+5+3 = 63
    expect(screen.getByText(mmss(500 + 63 + 10))).toBeInTheDocument();
  });

  it('clamps negative rest to zero', () => {
    render(<WorkoutSummary config={{ ...base, restAdjustment: -20 }} />);
    // rest r1 = 15 (adjustment applies from round 2), r2+ clamped to 0
    expect(screen.getByText(mmss(10 + 360 + 15))).toBeInTheDocument();
  });

  it('sums multi-exercise configs with own rounds and no trailing rests', () => {
    const cfg: TimerConfig = {
      ...base,
      exercises: [
        { id: 'a', name: 'A', workTime: 40, rounds: 3 },
        { id: 'b', name: 'B', workTime: 50, pauseTime: 5, rounds: 2 },
      ],
    };
    render(<WorkoutSummary config={cfg} />);
    // A: 3×40, rest after a1,a2 (global 15 each) — rest after a3 before B: pause of A = global 15
    // runner: every phase except the very last gets rest → 6 phases, 5 rests
    // rests: a1=15, a2=15, a3=15(B follows), b1=5
    // total = 10 + 120 + 100 + 15*3 + 5 = 280
    expect(screen.getByText(mmss(280))).toBeInTheDocument();
  });
});
