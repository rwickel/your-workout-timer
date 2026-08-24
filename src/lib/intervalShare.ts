import { TimerConfig, IntervalExercise } from '@/types/timer';

// Compact payload keys keep the QR small
interface CompactExercise {
  n?: string;
  r?: number;
  m?: 'time' | 'reps';
  p?: number; // reps
  w?: number;
  pt?: number;
  wa?: number;
  ra?: number;
}

interface CompactConfig {
  e?: string; // exerciseName
  w: number; // workTime
  p: number; // pauseTime
  pr: number; // preparationTime
  r: number; // rounds
  wa: number;
  ra: number;
  rs?: number; // repSeconds
  x?: CompactExercise[];
}

export const encodeInterval = (config: TimerConfig): string => {
  const compact: CompactConfig = {
    e: config.exerciseName || undefined,
    w: config.workTime,
    p: config.pauseTime,
    pr: config.preparationTime,
    r: config.rounds,
    wa: config.workAdjustment,
    ra: config.restAdjustment,
    rs: config.repSeconds !== 2 ? config.repSeconds : undefined,
    x:
      config.exercises && config.exercises.length > 0
        ? config.exercises.map(ex => ({
            n: ex.name || undefined,
            r: ex.rounds !== undefined ? ex.rounds : undefined,
            m: ex.mode && ex.mode !== 'time' ? ex.mode : undefined,
            p: ex.reps,
            w: ex.workTime,
            pt: ex.pauseTime,
            wa: ex.workAdjustment,
            ra: ex.restAdjustment,
          }))
        : undefined,
  };
  const json = JSON.stringify(compact);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const decodeInterval = (encoded: string): TimerConfig | null => {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(b64)));
    const c = JSON.parse(json) as CompactConfig;
    if (typeof c.w !== 'number' || typeof c.r !== 'number') return null;
    const exercises: IntervalExercise[] | undefined = c.x?.map((ex, i) => ({
      id: `shared-${Date.now()}-${i}`,
      name: ex.n ?? '',
      rounds: ex.r,
      mode: ex.m ?? 'time',
      reps: ex.p,
      workTime: Number(ex.w) || 0,
      pauseTime: ex.pt,
      workAdjustment: ex.wa,
      restAdjustment: ex.ra,
    }));
    return {
      exerciseName: c.e,
      workTime: Number(c.w),
      pauseTime: Number(c.p),
      preparationTime: Number(c.pr) || 0,
      rounds: Math.max(1, Number(c.r)),
      workAdjustment: Number(c.wa) || 0,
      restAdjustment: Number(c.ra) || 0,
      preparationAdjustment: 0,
      repSeconds: Number(c.rs) || 2,
      exercises,
    };
  } catch {
    return null;
  }
};

// Tailscale HTTPS address - valid certificate, enables PWA install on Android
const SHARE_ORIGIN = 'https://maco.taild0181d.ts.net';

export const intervalShareUrlFor = (config: TimerConfig): string =>
  `${SHARE_ORIGIN}/interval?d=${encodeInterval(config)}`;

export const intervalWhatsappUrlFor = (config: TimerConfig): string => {
  const lines =
    config.exercises && config.exercises.length > 0
      ? config.exercises.map(ex =>
          ex.mode === 'reps'
            ? `${ex.name || 'Exercise'}: ${ex.reps ?? 0} reps`
            : `${ex.name || 'Exercise'}: ${ex.workTime}s`
        )
      : [`${config.exerciseName || 'Work'} ${config.workTime}s / ${config.pauseTime}s × ${config.rounds}`];
  const header = `${config.rounds} Rounds · ${config.workTime}s/${config.pauseTime}s`;
  const text = `${config.exerciseName || 'Interval Workout'}\n${header}\n\n${lines.join('\n')}\n\n${intervalShareUrlFor(config)}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
};
