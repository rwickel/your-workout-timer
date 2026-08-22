import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Wod, WodResult, formatWodTime } from '@/types/wod';

interface WodRunnerProps {
  wod: Wod;
  onFinish: (result: WodResult) => void;
  onExit: () => void;
}

type RunnerStatus = 'ready' | 'running' | 'paused' | 'done';

export const WodRunner: React.FC<WodRunnerProps> = ({ wod, onFinish, onExit }) => {
  const [status, setStatus] = useState<RunnerStatus>('ready');
  const [elapsed, setElapsed] = useState(0); // seconds since start
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spokenRef = useRef<Set<string>>(new Set());

  const timeCap = wod.scheme === 'fortime' && !wod.timeCapSeconds ? 3600 : wod.timeCapSeconds;

  // EMOM rounds are 60s each; Rounds For Time has no fixed per-round length
  const totalSeconds =
    wod.scheme === 'amrap' || wod.scheme === 'fortime'
      ? timeCap
      : wod.scheme === 'emom'
      ? wod.rounds * 60
      : timeCap; // rounds-for-time uses cap as safety limit

  const currentRound =
    wod.scheme === 'emom' ? Math.min(wod.rounds, Math.floor(elapsed / 60) + 1) : 1;

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
    if (status === 'running') {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

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

    // EMOM minute beeps
    if (wod.scheme === 'emom' && elapsed % 60 === 0 && elapsed > 0) {
      beep(880);
      if (elapsed / 60 < wod.rounds) speak(`Minute ${elapsed / 60 + 1}`);
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
    setStatus('running');
    beep(660);
    speak('3, 2, 1, go');
  };

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
          ? Math.floor(elapsed / Math.max(1, roundDurationEstimate()))
          : wod.scheme === 'emom'
          ? currentRound
          : wod.scheme === 'rounds'
          ? wod.rounds
          : 1,
    });
  };

  // Rough estimate of one full round for AMRAP stats
  const roundDurationEstimate = () => {
    const totalReps = wod.movements.reduce((sum, m) => sum + m.reps, 0);
    return Math.max(60, Math.round(totalReps * 2.5)); // ~2.5s per rep heuristic
  };

  const clockDisplay =
    wod.scheme === 'amrap'
      ? formatWodTime(Math.max(0, totalSeconds - elapsed))
      : formatWodTime(elapsed);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Scheme + name */}
      <div className="text-center">
        <p className="section-label">{wod.name || wod.scheme}</p>
        {wod.scheme === 'emom' && (
          <p className="mt-2 font-mono text-lg text-neutral-400 tabular">
            Round {currentRound} / {wod.rounds}
          </p>
        )}
      </div>

      {/* Clock */}
      <motion.span
        animate={totalSeconds - elapsed <= 3 && status === 'running' ? { opacity: [1, 0.4, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
        className="timer-display"
      >
        {clockDisplay}
      </motion.span>

      {/* Movements */}
      <div className="w-full max-w-xs space-y-1 border-t border-neutral-900 pt-4 text-center">
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
            onClick={() => { setStatus('ready'); setElapsed(0); spokenRef.current.clear(); }}
            className="p-1 text-neutral-400 transition-colors hover:text-white"
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
              className="rounded-full border border-neutral-900 px-4 py-2 text-sm uppercase tracking-widest text-neutral-400 transition-colors hover:border-neutral-400 hover:text-white"
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
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black transition-colors hover:bg-neutral-200"
            >
              Save Result
            </button>
            <button
              onClick={onExit}
              className="rounded-lg border border-neutral-900 px-6 py-3 text-sm font-medium uppercase tracking-widest text-neutral-400 transition-colors hover:text-white"
            >
              Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
