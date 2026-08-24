# SW Unit Requirements — Interval Handling

Traceability: each SW-UR refines one or more REQ from `requirements.md`.

## SW-UR-I1 — Interval config model (`src/types/timer.ts`) → REQ-I1, I4

- `IntervalExercise` SHALL contain: `id`, `name`, optional `rounds`, required
  `workTime`, optional `reps`, optional `repAdjustment`, optional `pauseTime`,
  optional `workAdjustment`, optional `restAdjustment`.
- `getExerciseDuration(ex, config, round)` SHALL return
  `max(0, workTime + workAdjustment × (round − 1))`.
- `getExerciseReps(ex, config, round)` SHALL return `undefined` when no reps are set,
  otherwise `max(0, reps + repAdjustment × (round − 1))`.

## SW-UR-I2 — Timer phase machine (`src/hooks/useWorkoutTimer.ts`) → REQ-I3, I7

- State: `{ phase, currentRound, currentExercise, timeRemaining, isRunning, totalElapsed }`.
- `getNextPhase`:
  - preparation → work(ex 0, round 1)
  - work → rest (when rest > 0 AND workout not finishing), else advance
  - pause → advance to next round of the same exercise or next exercise at its round 1,
    or complete after the final phase
- Advance duration = `max(0, base + adjustment × (round − 1))`.
- `start(preparationTime?)` and `reset(preparationTime?)` SHALL accept an explicit
  preparation override (used by the global settings).
- 1-second tick decrements `timeRemaining`; on reaching 0 the next phase begins and
  `totalElapsed` increments.

## SW-UR-I3 — Total time summary (`src/components/WorkoutSummary.tsx`) → REQ-I4

- Total = preparation + all work durations + every rest that the runner executes
  (none after the final phase).
- Work total sums work durations only.
- The calculation SHALL mirror the phase machine exactly (verified by simulation).

## SW-UR-I4 — Runner display (`src/components/TimerDisplay.tsx`) → REQ-I5

- Shows phase label, formatted countdown, exercise name and (during work, when set)
  the round-adjusted rep target below the timer, round X / Y and progress dots.
- Blinks when ≤ 3 s remain (excluding `complete`).

## SW-UR-I5 — Voice & audio orchestration (`src/pages/Index.tsx`, `src/hooks/useAudio.ts`) → REQ-I6

- A dedicated effect announces "Round X" / "Round X, Y reps" once per
  (exercise, round) key while in `work` and running — independent of phase changes
  (rest = 0 case) — with a short delay to avoid speech-queue collisions.
- Phase-change tones play only on actual phase transitions.
- Spoken countdown applies when `currentTime <= countdownSeconds` for rest/preparation
  phases and skipped-rest work endings; suppressed for phases shorter than
  `countdownSeconds` (preparation always counts down by voice).
- Beeps use `beepSeconds` (0 disables).
- "Prepare for …" announcements are suppressed when the rest < `countdownSeconds`.
- `useAudio.speak` cancels only when a utterance is speaking/pending and re-schedules
  with a short delay (Chrome drop mitigation).

## SW-UR-I6 — Global settings (`src/lib/timerSettings.ts`, `src/components/SettingsPanel.tsx`) → REQ-I2

- Settings `{ countdownSeconds, beepSeconds, preparationSeconds }` persisted in
  localStorage under `workout-timer-settings`; validated on read; defaults 10 / 3 / 10.
- The interval runner reads them live per tick; Start/Reset apply
  `preparationSeconds` explicitly.
- The WOD runner uses the same values.

## SW-UR-I7 — Sharing (`src/lib/intervalShare.ts`, `src/components/IntervalShare.tsx`, routing) → REQ-I8

- Compact base64url payload of the full config; URL `/interval?d=…`
  (hash variant supported); `/interval` route registered.
- Import modal previews name, rounds, prep and per-exercise time/reps;
  loading replaces the active configuration.
