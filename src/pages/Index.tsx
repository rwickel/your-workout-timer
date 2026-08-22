import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { TimerConfig, DEFAULT_CONFIG, TimerPhase } from '@/types/timer';
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
import { decodeWod } from '@/lib/wodShare';

type AppMode = 'intervals' | 'wod' | 'history';

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
  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get('d');
    const hashMatch = window.location.hash.match(/#\/wod\?d=([A-Za-z0-9\-_]+)/);
    const encoded = fromQuery ?? hashMatch?.[1];
    if (encoded) {
      const decoded = decodeWod(encoded);
      if (decoded) setImportWod(decoded);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const prevPhaseRef = useRef<TimerPhase>(timer.state.phase);
  const prevTimeRef = useRef<number>(timer.state.timeRemaining);

  useEffect(() => {
    audio.setEnabled(audioEnabled);
    audio.setVolume(audioVolume);
  }, [audioEnabled, audioVolume, audio]);

  useEffect(() => {
    const currentPhase = timer.state.phase;
    const currentTime = timer.state.timeRemaining;

    if (prevPhaseRef.current !== currentPhase && currentPhase !== 'idle') {
      audio.playPhaseChange(currentPhase);

      // Voice announcement per phase change
      const currentRound = timer.state.currentRound;
      const pauseDuration = Math.max(0, config.pauseTime + config.restAdjustment * (currentRound - 1));

      switch (currentPhase) {
        case 'preparation':
          // Only announce when there is time to say it before the countdown
          if (config.preparationTime > 10) {
            audio.speak('Prepare for work');
          }
          break;
        case 'work':
          audio.speak('Work');
          break;
        case 'pause':
          // Skip the announcement for very short rest times so it
          // doesn't overlap with the end-of-rest countdown
          if (pauseDuration > 10) {
            audio.speak('Prepare for rest');
          }
          break;
        case 'complete':
          audio.speak('Workout complete');
          break;
      }
    }

    if (timer.state.isRunning && currentTime !== prevTimeRef.current) {
      // Voice countdown before each work phase (preparation & rest: 10, 9, 8...)
      const isPreWork = currentPhase === 'preparation' || currentPhase === 'pause';
      // When rest time is 0, the 10-count happens at the end of the ongoing work phase
      const restIsSkipped =
        currentPhase === 'work' &&
        config.rounds > 1 &&
        timer.state.currentRound < config.rounds &&
        Math.max(0, config.pauseTime + config.restAdjustment * (timer.state.currentRound - 1)) <= 0;

      if ((isPreWork || restIsSkipped) && currentTime <= 10 && currentTime > 0) {
        audio.speakCountdown(currentTime);
      } else {
        audio.playCountdown(currentTime);
      }
    }

    prevPhaseRef.current = currentPhase;
    prevTimeRef.current = currentTime;
  }, [timer.state.phase, timer.state.timeRemaining, timer.state.isRunning, audio]);

  const handleStartWorkout = () => {
    setShowConfig(false);
    timer.reset();
    timer.start();
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
  const showModeTabs = showConfig && !activeWod && !importWod;

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
        title: `${config.workTime}s/${config.pauseTime}s × ${config.rounds}`,
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
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-neutral-900 bg-black px-4">
        {!showConfig || activeWod ? (
          <button
            onClick={() => { if (activeWod) setActiveWod(null); else handleBackToConfig(); }}
            className="flex items-center gap-1 font-bold text-neutral-400 transition-colors hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm">Back</span>
          </button>
        ) : (
          <div />
        )}
        <div className="ml-auto flex items-center gap-2">
          <AudioToggle
            enabled={audioEnabled}
            onToggle={toggleAudio}
            volume={audioVolume}
            onVolumeChange={handleVolumeChange}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-lg p-4">
          {/* Mode Tabs */}
          {showModeTabs && (
            <div className="mb-6 flex gap-6">
              {(['intervals', 'wod', 'history'] as AppMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`pb-2 text-sm font-medium uppercase tracking-widest transition-colors ${
                    mode === m
                      ? 'border-b border-white text-white'
                      : 'border-b border-transparent text-neutral-600 hover:text-neutral-400'
                  }`}
                >
                  {m === 'intervals' ? 'Intervals' : m === 'wod' ? 'WOD' : 'History'}
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
                      onClick={handleStartWorkout}
                      className="w-full rounded-lg bg-white py-4 text-base font-semibold uppercase tracking-widest text-black transition-colors hover:bg-neutral-200"
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
                <TimerDisplay state={timer.state} totalRounds={config.rounds} />
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
                      className="rounded-lg border border-neutral-900 px-6 py-3 text-sm font-medium uppercase tracking-widest text-neutral-400 transition-colors hover:text-white"
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
    </div>
  );
};

export default Index;
