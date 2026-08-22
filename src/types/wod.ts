export type WodScheme = 'amrap' | 'fortime' | 'emom' | 'rounds';

export interface WodMovement {
  id: string;
  name: string;
  reps: number;
}

export interface Wod {
  id: string;
  name: string;
  scheme: WodScheme;
  timeCapSeconds: number; // used by amrap, fortime
  roundSeconds?: number; // EMOM: length of one round (default 60)
  exerciseRestSeconds?: number; // Rounds: rest between exercises (default 30)
  rounds: number; // used by emom, rounds
  movements: WodMovement[];
}

export interface WodResult {
  wodId: string;
  wodName: string;
  scheme: WodScheme;
  finishedAt: number;
  timeSeconds: number; // elapsed or remaining depending on scheme
  roundsCompleted: number; // amrap/rounds/emom
}

export const SCHEME_LABELS: Record<WodScheme, string> = {
  amrap: 'AMRAP',
  fortime: 'For Time',
  emom: 'EMOM',
  rounds: 'Rounds',
};

export const DEFAULT_WOD: Wod = {
  id: '',
  name: '',
  scheme: 'amrap',
  timeCapSeconds: 20 * 60,
  roundSeconds: 60,
  rounds: 5,
  movements: [
    { id: 'm1', name: 'Pull-Ups', reps: 5 },
    { id: 'm2', name: 'Push-Ups', reps: 10 },
    { id: 'm3', name: 'Air Squats', reps: 15 },
  ],
};

export const formatWodTime = (seconds: number): string => {
  const mins = Math.floor(Math.abs(seconds) / 60);
  const secs = Math.abs(seconds) % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
