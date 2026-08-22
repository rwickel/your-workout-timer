import { Wod, SCHEME_LABELS } from '@/types/wod';

// Compact payload keys keep the QR small
interface CompactWod {
  n: string;
  s: string;
  t: number;
  r: number;
  rs?: number;
  x?: number;
  m: [string, number][];
}

export const encodeWod = (wod: Wod): string => {
  const compact: CompactWod = {
    n: wod.name,
    s: wod.scheme,
    t: wod.timeCapSeconds,
    r: wod.rounds,
    rs: wod.roundSeconds,
    x: wod.exerciseRestSeconds,
    m: wod.movements.map(mv => [mv.name, mv.reps]),
  };
  const json = JSON.stringify(compact);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const decodeWod = (encoded: string): Wod | null => {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(b64)));
    const c = JSON.parse(json) as CompactWod;
    if (!c.n || !c.s || !Array.isArray(c.m)) return null;
    const scheme = (['amrap', 'fortime', 'emom', 'rounds'] as const).includes(c.s as any)
      ? (c.s as Wod['scheme'])
      : 'amrap';
    return {
      id: '',
      name: String(c.n),
      scheme,
      timeCapSeconds: Number(c.t) || 1200,
      rounds: Number(c.r) || 1,
      roundSeconds: c.rs ? Number(c.rs) : undefined,
      exerciseRestSeconds: c.x ? Number(c.x) : undefined,
      movements: c.m.map(([name, reps], i) => ({
        id: `shared-${Date.now()}-${i}`,
        name: String(name),
        reps: Number(reps) || 1,
      })),
    };
  } catch {
    return null;
  }
};

// Tailscale HTTPS address - valid certificate, enables PWA install on Android
const SHARE_ORIGIN = 'https://maco.taild0181d.ts.net';

export const shareUrlFor = (wod: Wod): string =>
  `${SHARE_ORIGIN}/wod?d=${encodeWod(wod)}`;

export const whatsappUrlFor = (wod: Wod): string => {
  const movements = wod.movements.map(mv => `${mv.reps} ${mv.name}`).join('\n');
  let header = '';
  if (wod.scheme === 'amrap') header = `AMRAP ${Math.round(wod.timeCapSeconds / 60)} min`;
  else if (wod.scheme === 'emom') header = `EMOM ${wod.rounds} × ${wod.roundSeconds ?? 60}s`;
  else if (wod.scheme === 'rounds') header = `${wod.rounds} Rounds`;
  else header = `For Time (cap ${Math.round(wod.timeCapSeconds / 60)} min)`;

  const text = `${wod.name || 'Workout'}\n${header}\n\n${movements}\n\n${shareUrlFor(wod)}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
};
