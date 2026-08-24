// Global timer settings shared by interval and WOD runners.
const KEY = 'workout-timer-settings';

export interface TimerSettings {
  countdownSeconds: number; // spoken countdown starts this many seconds before phase end
  beepSeconds: number; // beeps start this many seconds before phase end (0 = off)
  preparationSeconds: number; // get-ready countdown before a workout starts
}

const DEFAULTS: TimerSettings = {
  countdownSeconds: 10,
  beepSeconds: 3,
  preparationSeconds: 10,
};

export const getTimerSettings = (): TimerSettings => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<TimerSettings>;
    return {
      countdownSeconds:
        typeof parsed.countdownSeconds === 'number' && parsed.countdownSeconds >= 0
          ? parsed.countdownSeconds
          : DEFAULTS.countdownSeconds,
      beepSeconds:
        typeof parsed.beepSeconds === 'number' && parsed.beepSeconds >= 0
          ? parsed.beepSeconds
          : DEFAULTS.beepSeconds,
      preparationSeconds:
        typeof parsed.preparationSeconds === 'number' && parsed.preparationSeconds > 0
          ? parsed.preparationSeconds
          : DEFAULTS.preparationSeconds,
    };
  } catch {
    return { ...DEFAULTS };
  }
};

export const setTimerSettings = (settings: Partial<TimerSettings>): void => {
  try {
    const next = { ...getTimerSettings(), ...settings };
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    console.warn('Saving settings failed');
  }
};
