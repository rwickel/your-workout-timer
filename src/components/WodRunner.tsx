import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Wod, WodResult, SCHEME_LABELS, formatWodTime } from '@/types/wod';

interface WodRunnerProps {
  wod: Wod;
  onFinish: (result: WodResult) => void;
  onExit: () => void;
}

type RunnerStatus = 'ready' | 'prep' | 'running' | 'paused' | 'done';

/* ---------------- Rounds scheme: exercise -> rest -> exercise ---------------- */

const RoundsRunner: React.FC<WodRunnerProps> = ({ wod, onFinish, onExit }) => {
  const [status, setStatus] = useState<RunnerStatus>('ready');
  const [prepRemaining, setPrepRemaining] = useState(0);
  const [round, setRound] = useState(1);
  const [exIndex, setExIndex] = useState(0);
  const [inRest, setInRest] = useState(false);
  const [phaseSeconds, setPhaseSeconds] = useState(0); // counts up in exercise, down in rest
  const [totalElapsed, setTotalElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const restDuration = Math.max(0, wod.exerciseRestSeconds ?? 30);
  const movement = wod.movements[exIndex];
  const isLastExercise = round === wod.rounds && exIndex === wod.movements.length - 1;

  const speak = useCallback((text: string) => {
    try {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        const v = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('en'));
        if (v) u.voice = v;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    } catch (e) {
      console.warn('Speech failed:', e);
    }
  }, []);

  const beep = useCallback((freq: number, duration = 0.15) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Beep failed:', e);
    }
  }, []);

  // Announce current exercise
  useEffect(() => {
    if (status !== 'running') return;
    const prefix = exIndex === 0 ? `Round ${round}. ` : '';
    speak(inRest ? 'Rest' : `${prefix}${movement?.name ?? ''}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exIndex, inRest, round]);

  useEffect(() => {
    if (status === 'running' || status === 'prep') {
      intervalRef.current = setInterval(() => {
        if (status === 'prep') {
          setPrepRemaining(p => {
            if (p <= 1) {
              setStatus('running');
              return 0;
            }
            return p - 1;
          });
          return;
        }
        setTotalElapsed(t => t + 1);
        if (inRest) {
          setPhaseSeconds(s => {
            if (s <= 1) {
              // Rest over -> next exercise
              if (exIndex < wod.movements.length - 1) {
                setExIndex(exIndex + 1);
              } else if (round < wod.rounds) {
                setRound(round + 1);
                setExIndex(0);
              }
              setInRest(false);
              return 0;
            }
            return s - 1;
          });
        } else {
          setPhaseSeconds(s => s + 1);
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, inRest, exIndex, round, wod.movements.length, wod.rounds]);

  // Prep voice
  useEffect(() => {
    if (status === 'prep' && prepRemaining > 0 && prepRemaining <= 10) {
      speak(String(prepRemaining));
    }
  }, [status, prepRemaining, speak]);

  const start = () => {
    beep(660);
    setPrepRemaining(10);
    setStatus('prep');
    speak('Get ready');
  };

  const handleDone = () => {
    beep(660);
    if (!inRest && !isLastExercise) {
      // Exercise finished -> rest before next exercise
      setInRest(true);
      setPhaseSeconds(restDuration);
    } else if (!isLastExercise) {
      // Skip remaining rest
      if (exIndex < wod.movements.length - 1) setExIndex(exIndex + 1);
      else { setRound(round + 1); setExIndex(0); }
      setInRest(false);
      setPhaseSeconds(0);
    } else {
      setStatus('done');
      beep(1047, 0.3);
      speak('Workout complete');
    }
  };

  const reset = () => {
    setStatus('ready');
    setPrepRemaining(0);
    setRound(1);
    setExIndex(0);
    setInRest(false);
    setPhaseSeconds(0);
    setTotalElapsed(0);
  };

  const clockDisplay =
    status === 'prep'
      ? String(prepRemaining)
      : inRest
      ? formatWodTime(phaseSeconds)
      : formatWodTime(phaseSeconds);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Scheme + name */}
      <div className="text-center">
        <p className="section-label">{SCHEME_LABELS[wod.scheme]}{wod.name ? ` · ${wod.name}` : ''}</p>
        {status !== 'ready' && status !== 'done' && (
          <p className="mt-2 font-mono text-lg text-neutral-400 tabular">
            Round {round} / {wod.rounds}
          </p>
        )}
      </div>

      {/* Phase label */}
      {(status === 'running' || status === 'paused') && (
        <p className="text-sm font-semibold uppercase tracking-widest text-white">
          {!inRest ? `${movement?.reps} × ${movement?.name}` : 'Rest'}
        </p>
      )}

      {/* Clock */}
      <span className="timer-display my-4 block">{clockDisplay}</span>

      {/* Movement list with current highlighted */}
      <div className="w-full max-w-xs space-y-2 border-t border-neutral-900 pt-5">
        {wod.movements.map((m, i) => (
          <p
            key={m.id}
            className={`tabular ${i === exIndex && !inRest ? 'font-bold text-white' : 'text-neutral-400'}`}
          >
            <span className={i === exIndex && !inRest ? 'text-white' : ''}>{m.reps}</span> {m.name}
          </p>
        ))}
      </div>

      {/* Controls */}
      {status !== 'done' ? (
        <div className="flex items-center gap-10">
          <button
            onClick={reset}
            disabled={status === 'ready'}
            className="p-1 text-neutral-400 transition-all duration-150 hover:text-white active:scale-[0.98] disabled:text-neutral-700"
            aria-label="Reset"
          >
            <RotateCcw className="h-7 w-7" />
          </button>
          {status === 'ready' || status === 'prep' ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={start}
              disabled={status === 'prep'}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-neutral-200"
            >
              <Play className="ml-1 h-8 w-8" />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDone}
              className="flex h-20 items-center justify-center rounded-full bg-white px-10 text-sm font-bold uppercase tracking-widest text-black transition-colors hover:bg-neutral-200"
            >
              {inRest ? 'Skip Rest' : 'Done'}
            </motion.button>
          )}
          <button
            onClick={() => setStatus(s => (s === 'paused' ? 'running' : s === 'running' ? 'paused' : s))}
            disabled={status === 'ready' || status === 'prep'}
            className="p-1 text-neutral-400 transition-all duration-150 hover:text-white active:scale-[0.98] disabled:text-neutral-700"
            aria-label="Pause"
          >
            {status === 'paused' ? <Play className="h-7 w-7" /> : <Pause className="h-7 w-7" />}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <p className="text-xl font-bold uppercase tracking-widest text-white">Complete!</p>
          <p className="font-mono text-3xl text-neutral-400 tabular">{formatWodTime(totalElapsed)}</p>
          <div className="flex gap-4">
            <button
              onClick={() =>
                onFinish({
                  wodId: wod.id,
                  wodName: wod.name,
                  scheme: wod.scheme,
                  finishedAt: Date.now(),
                  timeSeconds: totalElapsed,
                  roundsCompleted: wod.rounds,
                })
              }
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black transition-all duration-150 hover:bg-neutral-200 active:scale-[0.98]"
            >
              Save Result
            </button>
            <button
              onClick={onExit}
              className="rounded-lg border border-neutral-900 px-6 py-3 text-sm font-medium uppercase tracking-widest text-neutral-400 transition-all duration-150 hover:text-white active:scale-[0.98]"
            >
              Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------- Generic runner for AMRAP / For Time / EMOM ---------------- */

export const WodRunner: React.FC<WodRunnerProps> = (props) => {
  // Rounds scheme uses its own exercise/rest phase machine
  if (props.wod.scheme === 'rounds') {
    return <RoundsRunner {...props} />;
  }
  const { wod, onFinish, onExit } = props;
  const [status, setStatus] = useState<RunnerStatus>('ready');
  const [elapsed, setElapsed] = useState(0); // seconds since workout start (excl. prep)
  const [prepRemaining, setPrepRemaining] = useState(0); // prep countdown seconds
  const [roundsDone, setRoundsDone] = useState(0); // manual round counter (AMRAP)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spokenRef = useRef<Set<string>>(new Set());

  const timeCap = wod.scheme === 'fortime' && !wod.timeCapSeconds ? 3600 : wod.timeCapSeconds;
  const roundSeconds = wod.scheme === 'emom' ? Math.max(10, wod.roundSeconds ?? 60) : 60;
  // Guard against legacy/broken WODs with missing or invalid round count
  const safeRounds =
    wod.scheme === 'emom'
      ? wod.rounds && wod.rounds > 0
        ? wod.rounds
        : Math.max(1, Math.round(timeCap / roundSeconds))
      : wod.rounds;

  // Prep applies to AMRAP, EMOM and For Time
  const needsPrep = wod.scheme !== 'rounds';
  const prepTotal = 10;

  const totalSeconds =
    wod.scheme === 'amrap' || wod.scheme === 'fortime'
      ? timeCap
      : wod.scheme === 'emom'
      ? safeRounds * roundSeconds
      : timeCap; // rounds-for-time uses cap as safety limit

  const currentRound =
    wod.scheme === 'emom' ? Math.min(safeRounds, Math.floor(elapsed / roundSeconds) + 1) : 1;

  const speak = useCallback((text: string) => {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        const englishVoice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('en'));
        if (englishVoice) utterance.voice = englishVoice;
        utterance.volume = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('Speech failed:', e);
    }
  }, []);

  const beep = useCallback((freq: number, duration = 0.15) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Beep failed:', e);
    }
  }, []);

  useEffect(() => {
    if (status === 'running' || status === 'prep') {
      intervalRef.current = setInterval(() => {
        if (status === 'prep') {
          setPrepRemaining(p => {
            if (p <= 1) {
              setStatus('running');
              return 0;
            }
            return p - 1;
          });
        } else {
          setElapsed(e => e + 1);
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  // Prep countdown voice
  useEffect(() => {
    if (status !== 'prep') return;
    if (prepRemaining > 0 && prepRemaining <= 10) {
      speak(String(prepRemaining));
    }
  }, [status, prepRemaining, speak]);

  // Voice events per second
  useEffect(() => {
    if (status !== 'running') return;
    const remaining = totalSeconds - elapsed;

    // Countdown last 10 seconds
    if (remaining <= 10 && remaining > 0) {
      const key = `count-${remaining}`;
      if (!spokenRef.current.has(key)) {
        spokenRef.current.add(key);
        speak(String(remaining));
      }
    }

    // EMOM round beeps
    if (wod.scheme === 'emom' && elapsed > 0 && elapsed % roundSeconds === 0) {
      beep(880);
      if (elapsed / roundSeconds < safeRounds) speak(`Round ${elapsed / roundSeconds + 1}`);
    }

    // Time up
    if (remaining <= 0) {
      setStatus('done');
      beep(1047, 0.3);
      speak(wod.scheme === 'amrap' ? 'Time' : 'Time cap reached');
    }
  }, [elapsed, status, totalSeconds, wod, speak, beep]);

  const start = () => {
    spokenRef.current.clear();
    beep(660);
    if (needsPrep) {
      setPrepRemaining(prepTotal);
      setStatus('prep');
      speak('Get ready');
    } else {
      setStatus('running');
      speak('3, 2, 1, go');
    }
  };

  // Announce "Go" when prep finishes
  useEffect(() => {
    if (status === 'running' && elapsed === 0 && needsPrep) {
      speak('Go');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const finishManually = () => {
    setStatus('done');
    speak('Workout complete');
  };

  const handleFinish = () => {
    onFinish({
      wodId: wod.id,
      wodName: wod.name,
      scheme: wod.scheme,
      finishedAt: Date.now(),
      timeSeconds: wod.scheme === 'fortime' || wod.scheme === 'rounds' ? elapsed : totalSeconds,
      roundsCompleted:
        wod.scheme === 'amrap'
          ? roundsDone
          : wod.scheme === 'emom'
          ? currentRound
          : wod.scheme === 'rounds'
          ? safeRounds
          : 1,
    });
  };

  const clockDisplay =
    wod.scheme === 'amrap'
      ? formatWodTime(Math.max(0, totalSeconds - elapsed))
      : formatWodTime(elapsed);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Scheme + name */}
      <div className="text-center">
        <p className="section-label">{SCHEME_LABELS[wod.scheme]}{wod.name ? ` · ${wod.name}` : ''}</p>
        {wod.scheme === 'emom' && status !== 'done' && (
          <p className="mt-2 font-mono text-lg text-neutral-400 tabular">
            Round {currentRound} / {safeRounds}
          </p>
        )}
      </div>

      {/* Clock */}
      {status === 'prep' ? (
        <span className="timer-display my-4 block">{prepRemaining}</span>
      ) : (
        <motion.span
          animate={totalSeconds - elapsed <= 3 && status === 'running' ? { opacity: [1, 0.4, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
          className="timer-display my-4 block"
        >
          {clockDisplay}
        </motion.span>
      )}

      {/* AMRAP round counter */}
      {wod.scheme === 'amrap' && status !== 'done' && (
        <div className="flex w-full max-w-xs items-center justify-between rounded-xl border border-neutral-900 px-5 py-5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setRoundsDone(r => Math.max(0, r - 1))}
            disabled={roundsDone === 0}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-900 text-2xl text-neutral-400 transition-colors hover:border-neutral-400 hover:text-white disabled:text-neutral-700 disabled:hover:border-neutral-900"
            aria-label="Remove round"
          >
            −
          </motion.button>
          <div className="text-center">
            <p className="section-label">Rounds</p>
            <span className="mt-1 block font-mono text-4xl font-bold text-white tabular">{roundsDone}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setRoundsDone(r => r + 1)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl font-bold text-black transition-colors hover:bg-neutral-200"
            aria-label="Add round"
          >
            +
          </motion.button>
        </div>
      )}

      {/* Movements */}
      <div className="w-full max-w-xs space-y-2 border-t border-neutral-900 pt-5 text-center">
        {wod.movements.map(m => (
          <p key={m.id} className="text-neutral-400 tabular">
            <span className="font-bold text-white">{m.reps}</span> {m.name}
          </p>
        ))}
      </div>

      {/* Controls */}
      {status !== 'done' ? (
        <div className="flex items-center gap-10">
          <button
            onClick={() => { setStatus('ready'); setElapsed(0); setPrepRemaining(0); spokenRef.current.clear(); }}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-neutral-400 transition-all duration-150 hover:text-white active:scale-[0.98]"
            aria-label="Reset"
          >
            <RotateCcw className="h-7 w-7" />
          </button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={status === 'running' ? () => setStatus('paused') : start}
            disabled={status === 'done'}
            className={`flex h-20 w-20 items-center justify-center rounded-full ${
              status === 'running' ? 'bg-white text-black hover:bg-neutral-200' : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            {status === 'running' ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="ml-1 h-8 w-8" />
            )}
          </motion.button>
          {(wod.scheme === 'fortime' || wod.scheme === 'rounds') && (
            <button
              onClick={finishManually}
              className="min-h-[44px] rounded-full border border-neutral-900 px-6 py-2 text-sm uppercase tracking-widest text-neutral-400 transition-all duration-150 hover:border-neutral-400 hover:text-white active:scale-[0.98]"
            >
              Finish
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <p className="text-xl font-bold uppercase tracking-widest text-white">Time!</p>
          <p className="font-mono text-3xl text-neutral-400 tabular">{formatWodTime(elapsed)}</p>
          <div className="flex gap-4">
            <button
              onClick={handleFinish}
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black transition-all duration-150 hover:bg-neutral-200 active:scale-[0.98]"
            >
              Save Result
            </button>
            <button
              onClick={onExit}
              className="rounded-lg border border-neutral-900 px-6 py-3 text-sm font-medium uppercase tracking-widest text-neutral-400 transition-all duration-150 hover:text-white active:scale-[0.98]"
            >
              Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


