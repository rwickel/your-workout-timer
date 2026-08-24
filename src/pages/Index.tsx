import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { TimerConfig, DEFAULT_CONFIG, TimerPhase, getExerciseReps } from '@/types/timer';
import { Wod } from '@/types/wod';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { useAudio } from '@/hooks/useAudio';
import { useFavorites } from '@/hooks/useFavorites';
import { useWods } from '@/hooks/useWods';
import { useHistory } from '@/hooks/useHistory';
import { TimerDisplay } from '@/components/TimerDisplay';
import { TimerControls } from '@/components/TimerControls';
import { ConfigCard } from '@/components/ConfigCard';
import { WorkoutSummary } from '@/components/WorkoutSummary';
import { FavoritesPanel } from '@/components/FavoritesPanel';
import { AudioToggle } from '@/components/AudioToggle';
import { WodPanel } from '@/components/WodPanel';
import { WodRunner } from '@/components/WodRunner';
import { HistoryPanel } from '@/components/HistoryPanel';
import { WodImport } from '@/components/WodImport';
import { IntervalShareModal, IntervalImportModal } from '@/components/IntervalShare';
import { decodeWod } from '@/lib/wodShare';
import { decodeInterval } from '@/lib/intervalShare';
import { SettingsPanel } from '@/components/SettingsPanel';
import { getTimerSettings } from '@/lib/timerSettings';
import { APP_VERSION } from '@/lib/version';

type AppMode = 'intervals' | 'wod' | 'history' | 'settings';

const Index: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('intervals');
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(true);
  const [activeWod, setActiveWod] = useState<Wod | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioVolume, setAudioVolume] = useState(1);

  const timer = useWorkoutTimer(config);
  const audio = useAudio();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { wods, saveWod, deleteWod, addResult } = useWods();
  const { entries: history, addEntry, deleteEntry } = useHistory();

  // Shared WOD import via URL — supports /wod?d=... and /#/wod?d=...
  const [importWod, setImportWod] = useState<Wod | null>(null);
  // Shared interval workout via /interval?d=...
  const [importInterval, setImportInterval] = useState<TimerConfig | null>(null);
  const [sharingInterval, setSharingInterval] = useState(false);
  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get('d');
    const hashMatch = window.location.hash.match(/#\/wod\?d=([A-Za-z0-9\-_]+)/);
    const encoded = fromQuery ?? hashMatch?.[1];
    if (encoded) {
      const decoded = decodeWod(encoded);
      if (decoded) setImportWod(decoded);
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }
    // Shared interval workout via /interval?d=... or /#/interval?d=...
    const isIntervalShare = window.location.pathname.endsWith('/interval') || window.location.hash.includes('/interval?d=');
    if (isIntervalShare) {
      const iEncoded = new URLSearchParams(window.location.hash.split('?')[1] ?? window.location.search).get('d');
      if (iEncoded) {
        const decodedConfig = decodeInterval(iEncoded);
        if (decodedConfig) setImportInterval(decodedConfig);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    // Apply globally persisted audio/prep settings to the interval config
    const s = getTimerSettings();
    setConfig(c => ({
      ...c,
      countdownSeconds: s.countdownSeconds,
      beepSeconds: s.beepSeconds,
      preparationTime: s.preparationSeconds,
    }));
  }, []);

  const prevPhaseRef = useRef<TimerPhase>(timer.state.phase);
  const prevTimeRef = useRef<number>(timer.state.timeRemaining);
  const prevRoundRef = useRef<number>(timer.state.currentRound);
  // Announce "Round X (, Y reps)" once per work phase, even when rest is 0
  // and the phase never changes between rounds.
  const lastWorkKeyRef = useRef('');

  useEffect(() => {
    const { phase, currentRound, currentExercise, isRunning } = timer.state;
    if (phase !== 'work' || !isRunning) {
      lastWorkKeyRef.current = '';
      return;
    }
    const key = `${currentExercise}:${currentRound}`;
    if (key === lastWorkKeyRef.current) return;
    lastWorkKeyRef.current = key;

    const ex = config.exercises?.[currentExercise];
    const reps =
      ex && ex.reps !== undefined
        ? Math.max(0, ex.reps + (ex.repAdjustment ?? 0) * (currentRound - 1))
        : undefined;
    // Small delay so the announcement never collides with the final
    // countdown digit of the previous phase in the speech queue.
    window.setTimeout(() => {
      audio.speak(
        reps !== undefined && reps > 0
          ? `Round ${currentRound}, ${reps} reps`
          : `Round ${currentRound}`
      );
    }, 400);
  }, [timer.state.phase, timer.state.isRunning, timer.state.currentRound, timer.state.currentExercise, config, audio]);

  useEffect(() => {
    audio.setEnabled(audioEnabled);
    audio.setVolume(audioVolume);
  }, [audioEnabled, audioVolume, audio]);

  useEffect(() => {
    const currentPhase = timer.state.phase;
    // Read the global settings on every tick so changes apply immediately
    const { countdownSeconds, beepSeconds } = getTimerSettings();
    const currentTime = timer.state.timeRemaining;
    const currentRound = timer.state.currentRound;
    const curExTop = config.exercises && config.exercises.length > 0
      ? config.exercises[timer.state.currentExercise]
      : null;

    const phaseChanged = prevPhaseRef.current !== currentPhase;
    const roundChanged = prevRoundRef.current !== currentRound;

    if (phaseChanged && currentPhase !== 'idle') {
      audio.playPhaseChange(currentPhase);
    }

    if ((phaseChanged || roundChanged) && currentPhase !== 'idle' && currentRound > 0) {
      const pauseDuration = curExTop
        ? Math.max(0, (curExTop.pauseTime ?? config.pauseTime) + (curExTop.restAdjustment ?? config.restAdjustment) * (currentRound - 1))
        : Math.max(0, config.pauseTime + config.restAdjustment * (currentRound - 1));

      switch (currentPhase) {
        case 'preparation':
          // Only announce when there is time to say it before the countdown
          if (config.preparationTime > countdownSeconds) {
            audio.speak('Prepare for work');
          }
          break;
        case 'pause': {
          // Suppress the announcement when the rest is shorter than the countdown length
          if (pauseDuration < countdownSeconds) {
            break;
          }
          // During intervals: "prepare for Pushups" before the countdown, then "Round X" on work start
          if (config.exercises && config.exercises.length > 0) {
            const exercises = config.exercises;
            const curEx = exercises[timer.state.currentExercise];
            // Next exercise: same one if more rounds remain, otherwise the following one
            const curRounds = curEx?.rounds ?? config.rounds;
            let nextName: string | undefined;
            if (currentRound < curRounds) {
              nextName = curEx?.name;
            } else {
              nextName = exercises[timer.state.currentExercise + 1]?.name;
            }
            if (nextName?.trim()) {
              audio.speak(`prepare for ${nextName.trim()}`);
              break;
            }
          } else if (config.exerciseName?.trim()) {
            audio.speak(`prepare for ${config.exerciseName.trim()}`);
            break;
          }
          audio.speak('Prepare for rest');
          break;
        }
        case 'complete':
          audio.speak('Workout complete');
          break;
      }
    }

    if (timer.state.isRunning && currentTime !== prevTimeRef.current) {
      // Voice countdown before each work phase (preparation & rest: 10, 9, 8...)
      const isPreWork = currentPhase === 'preparation' || currentPhase === 'pause';
      // When rest time is 0, the 10-count happens at the end of the ongoing work phase
      const roundsForCurEx = curExTop ? (curExTop.rounds ?? config.rounds) : config.rounds;
      const restForCurEx = curExTop
        ? Math.max(0, (curExTop.pauseTime ?? config.pauseTime) + (curExTop.restAdjustment ?? config.restAdjustment) * (currentRound - 1))
        : Math.max(0, config.pauseTime + config.restAdjustment * (currentRound - 1));
      const restIsSkipped =
        currentPhase === 'work' &&
        roundsForCurEx > 1 &&
        currentRound < roundsForCurEx &&
        restForCurEx <= 0;
      // Short phases (< countdown length) get no spoken countdown — only beeps/round announcement
      const phaseDuration = curExTop
        ? (currentPhase === 'work'
            ? Math.max(0, curExTop.workTime + (curExTop.workAdjustment ?? config.workAdjustment) * (currentRound - 1))
            : currentPhase === 'pause'
              ? Math.max(0, (curExTop.pauseTime ?? config.pauseTime) + (curExTop.restAdjustment ?? config.restAdjustment) * (currentRound - 1))
              : config.preparationTime)
        : (currentPhase === 'work'
            ? Math.max(0, config.workTime + config.workAdjustment * (currentRound - 1))
            : currentPhase === 'pause'
              ? Math.max(0, config.pauseTime + config.restAdjustment * (currentRound - 1))
              : config.preparationTime);
      const phaseTooShort = phaseDuration < countdownSeconds;
      // The preparation phase always counts down via voice
      const isPreparation = currentPhase === 'preparation';

      if (
        (isPreWork || restIsSkipped) &&
        (isPreparation || !phaseTooShort) &&
        currentTime <= countdownSeconds &&
        currentTime > 0
      ) {
        audio.speakCountdown(currentTime);
      } else {
        audio.playCountdown(currentTime, beepSeconds);
      }
    }

    prevPhaseRef.current = currentPhase;
    prevTimeRef.current = currentTime;
    prevRoundRef.current = currentRound;
  }, [timer.state.phase, timer.state.timeRemaining, timer.state.isRunning, audio]);

  const handleStartWorkout = () => {
    setShowConfig(false);
    // Always start with the globally configured preparation time
    const prep = getTimerSettings().preparationSeconds;
    setConfig(c => ({ ...c, preparationTime: prep }));
    timer.reset(prep);
    timer.start(prep);
  };

  const handleBackToConfig = () => {
    timer.reset();
    setShowConfig(true);
  };

  const handleLoadFavorite = (favoriteConfig: TimerConfig) => {
    setConfig(favoriteConfig);
  };

  const toggleAudio = () => {
    setAudioEnabled(prev => !prev);
  };

  const handleVolumeChange = (volume: number) => {
    setAudioVolume(volume);
  };

  // Mode tabs shown only on the config screen
  const showModeTabs = showConfig && !activeWod && !importWod && !importInterval;

  const handleImport = (wod: Wod, startNow: boolean) => {
    saveWod(wod);
    setImportWod(null);
    if (startNow) {
      setMode('wod');
      setActiveWod(wod);
    }
  };

  // Record interval workout completion once
  const recordedRef = useRef(false);
  useEffect(() => {
    if (timer.state.phase === 'complete' && !recordedRef.current) {
      recordedRef.current = true;
      addEntry({
        source: 'interval',
        title: config.exerciseName?.trim()
          ? `${config.exerciseName.trim()} (${config.workTime}s/${config.pauseTime}s × ${config.rounds})`
          : `${config.workTime}s/${config.pauseTime}s × ${config.rounds}`,
        scheme: 'interval',
        finishedAt: Date.now(),
        timeSeconds: timer.state.totalElapsed,
        roundsCompleted: config.rounds,
      });
    }
    if (timer.state.phase !== 'complete') {
      recordedRef.current = false;
    }
  }, [timer.state.phase, addEntry]);

  return (
    <div className="flex min-h-full flex-col bg-black text-white mobile-safe">
      {importWod && (
        <WodImport
          wod={importWod}
          onImport={handleImport}
          onDismiss={() => setImportWod(null)}
        />
      )}
      {importInterval && (
        <IntervalImportModal
          config={importInterval}
          onImport={() => {
            setConfig(importInterval);
            setMode('intervals');
            setShowConfig(true);
            setActiveWod(null);
            setImportInterval(null);
          }}
          onDismiss={() => setImportInterval(null)}
        />
      )}
      {sharingInterval && (
        <IntervalShareModal config={config} onClose={() => setSharingInterval(false)} />
      )}
      {/* Header */}
      <header
        className={`sticky top-0 z-50 flex items-center justify-between border-b border-neutral-900 bg-black px-4 ${
          !showConfig || activeWod ? 'h-16' : 'h-14'
        }`}
      >
        {!showConfig || activeWod ? (
          <button
            onClick={() => { if (activeWod) setActiveWod(null); else handleBackToConfig(); }}
            className="flex min-h-[44px] items-center gap-1 rounded-lg pr-2 pl-1 font-bold text-neutral-400 transition-all duration-150 hover:text-white active:scale-[0.98]"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm uppercase tracking-widest">Back</span>
          </button>
        ) : (
          <div />
        )}
        {(activeWod || !showConfig) && (
          <div className="ml-auto flex items-center gap-2">
            <AudioToggle
              enabled={audioEnabled}
              onToggle={toggleAudio}
              volume={audioVolume}
              onVolumeChange={handleVolumeChange}
            />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-lg p-4">
          {/* Mode Tabs */}
          {showModeTabs && (
            <div className="mb-6 flex gap-6">
              {(['intervals', 'wod', 'history', 'settings'] as AppMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`min-h-[44px] pb-2 pt-2 text-sm font-medium uppercase tracking-widest transition-all duration-150 active:scale-[0.98] ${
                    mode === m
                      ? 'border-b-2 border-white text-white'
                      : 'border-b-2 border-transparent text-neutral-600 hover:text-neutral-400'
                  }`}
                >
                  {m === 'intervals' ? 'Intervals' : m === 'wod' ? 'WOD' : m === 'history' ? 'History' : 'Settings'}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeWod ? (
              /* WOD Runner */
              <motion.div
                key="wod-runner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center"
              >
                <WodRunner
                  wod={activeWod}
                  onFinish={(result) => {
                    addResult(result);
                    addEntry({
                      source: 'wod',
                      title: result.wodName || result.scheme,
                      scheme: result.scheme,
                      finishedAt: result.finishedAt,
                      timeSeconds: result.timeSeconds,
                      roundsCompleted: result.roundsCompleted,
                    });
                    setActiveWod(null);
                  }}
                  onExit={() => setActiveWod(null)}
                />
              </motion.div>
            ) : showConfig ? (
              <motion.div
                key="config"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 pb-8"
              >
                {mode === 'intervals' ? (
                  <>
                    <ConfigCard config={config} onChange={setConfig} />
                    <WorkoutSummary config={config} />

                    <FavoritesPanel
                      favorites={favorites}
                      currentConfig={config}
                      onSelect={handleLoadFavorite}
                      onSave={addFavorite}
                      onDelete={removeFavorite}
                    />

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSharingInterval(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-900 py-3 text-sm font-medium uppercase tracking-widest text-neutral-400 transition-all duration-150 hover:border-neutral-400 hover:text-white active:scale-[0.98]"
                    >
                      Share Workout
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStartWorkout}
                      className="w-full rounded-lg bg-white py-4 text-base font-semibold uppercase tracking-widest text-black transition-all duration-150 hover:bg-neutral-200 active:scale-[0.98]"
                    >
                      Start Workout
                    </motion.button>
                  </>
                ) : mode === 'wod' ? (
                  <>
                    <WodPanel
                      wods={wods}
                      onStart={(wod) => setActiveWod(wod)}
                      onSave={saveWod}
                      onDelete={deleteWod}
                    />
                  </>
                ) : mode === 'settings' ? (
                  <SettingsPanel />
                ) : (
                  <HistoryPanel entries={history} onDelete={deleteEntry} />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="timer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-12"
              >
                <TimerDisplay
                  state={timer.state}
                  totalRounds={
                    config.exercises && config.exercises.length > 0
                      ? config.exercises[timer.state.currentExercise]?.rounds ?? config.rounds
                      : config.rounds
                  }
                  exerciseName={
                    config.exercises && config.exercises.length > 0
                      ? config.exercises[timer.state.currentExercise]?.name
                      : config.exerciseName
                  }
                  requiredReps={
                    timer.state.phase === 'work'
                      ? (() => {
                          const ex = config.exercises?.[timer.state.currentExercise];
                          if (!ex) return undefined;
                          return getExerciseReps(ex, config, timer.state.currentRound);
                        })()
                      : undefined
                  }
                />
                <TimerControls
                  state={timer.state}
                  onStart={timer.start}
                  onPause={timer.pause}
                  onReset={timer.reset}
                  onSkip={timer.skipPhase}
                  onAdjustTime={timer.adjustTime}
                />

                {timer.state.phase === 'complete' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <h2 className="mb-4 text-xl font-bold uppercase tracking-widest text-white">
                      Workout Complete
                    </h2>
                    <button
                      onClick={handleBackToConfig}
                      className="rounded-lg border border-neutral-900 px-6 py-3 text-sm font-medium uppercase tracking-widest text-neutral-400 transition-all duration-150 hover:text-white active:scale-[0.98]"
                    >
                      Back to Settings
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <footer className="border-t border-neutral-900 py-4 text-center text-[11px] tracking-widest text-neutral-700">
        v{APP_VERSION}
      </footer>
    </div>
  );
};

export default Index;
