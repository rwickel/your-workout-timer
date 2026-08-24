# Requirements — Interval Handling

## Overview

The interval mode lets users configure and run interval-based workouts consisting of
exercises executed for a configurable work duration per round, with optional rest
between phases and optional rep targets as informational metadata.

## Functional Requirements

### REQ-I1 — Exercise configuration

- The user can add, name, and remove exercises in the workout setup.
- Each exercise has:
  - an optional name (default label when empty),
  - its own round count (falls back to the global round count),
  - a work time in seconds (always drives the timer),
  - an own rest time (falls back to the global rest time),
  - a work adjustment (+/- seconds per round),
  - a rest adjustment (+/- seconds per round).
- Reps are optional metadata: a rep target and a rep adjustment (+/- reps per round).
  They never influence the timer duration.

### REQ-I2 — Global settings

- Global settings (own page, persisted across sessions) apply to all workouts:
  - Countdown length (seconds before phase end at which the spoken countdown starts),
  - Beep length (seconds before phase end at which beeps start; 0 = off),
  - Preparation time (get-ready countdown before the first work phase).

### REQ-I3 — Workout execution (phase machine)

- Phases: `idle → preparation → [work → rest]* → complete`.
- Work time per round = base work time + work adjustment × (round − 1), floored at 0.
- Rest after each work phase = base rest + rest adjustment × (round − 1), floored at 0.
- Rest is skipped when it is 0 or when the workout would complete anyway
  (no rest after the very last phase).
- Multi-exercise workouts run each exercise for all of its rounds before moving on;
  each exercise restarts at its own round 1.

### REQ-I4 — Total time calculation

- The displayed total matches exactly what the runner executes:
  preparation + Σ(work durations) + Σ(rest durations that actually occur).

### REQ-I5 — Visual feedback

- The runner shows: phase label, countdown timer, exercise name with the current
  round's rep target below the timer, round counter (X / Y) and progress dots.
- Short phases (< beep length or < countdown length) still display correctly.

### REQ-I6 — Voice & audio feedback

- "Round X" is announced at every work-phase start — including transitions where
  rest is 0 and the phase does not change.
- When a rep target > 0 is set, the announcement includes it ("Round X, Y reps"),
  using the round-adjusted value.
- A spoken countdown (N…1) runs before rest/preparation ends and at the end of a
  work phase when the following rest is skipped.
- The preparation phase always counts down by voice.
- Phases shorter than the configured countdown length get no spoken countdown.
- "Prepare for …" announcements are suppressed when the rest is shorter than the
  countdown length; otherwise they precede the countdown.
- Beeps sound during the final `beepSeconds` of each phase (if > 0).
- Speech queuing must be robust (no dropped announcements caused by cancel/speak races).

### REQ-I7 — Controls

- Start (from idle, applies global preparation time), pause/resume, reset,
  skip phase, and ±time adjustment are available during the workout.

### REQ-I8 — Sharing

- An interval configuration can be shared via QR code, copyable link
  (`/interval?d=…`) and WhatsApp message.
- Opening a share link shows a preview and lets the user load the configuration.
- The payload includes all exercises incl. reps metadata, adjustments, prep time.

## Non-functional Requirements

- NFR1: Works offline as PWA; settings persist in localStorage.
- NFR2: No external network calls except sharing links.
- NFR3: Type-safe configuration model shared between setup, runner and summary.
