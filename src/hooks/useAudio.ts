import { useCallback, useRef } from 'react';
import { TimerPhase } from '@/types/timer';

// Audio context for generating tones
const createAudioContext = () => {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
};

export const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);
  const volumeRef = useRef(0.5);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!enabledRef.current) return;
    
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      const volume = volumeRef.current;
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }, [getAudioContext]);

  const playPhaseChange = useCallback((phase: TimerPhase) => {
    switch (phase) {
      case 'work':
        // High energetic beep for work
        playTone(880, 0.15, 'square');
        setTimeout(() => playTone(1100, 0.2, 'square'), 150);
        break;
      case 'pause':
        // Lower relaxed tone for rest
        playTone(440, 0.3, 'sine');
        break;
      case 'preparation':
        // Medium alert tone for prep
        playTone(660, 0.15, 'triangle');
        setTimeout(() => playTone(660, 0.15, 'triangle'), 200);
        break;
      case 'complete':
        // Victory fanfare
        playTone(523, 0.15, 'square');
        setTimeout(() => playTone(659, 0.15, 'square'), 150);
        setTimeout(() => playTone(784, 0.15, 'square'), 300);
        setTimeout(() => playTone(1047, 0.3, 'square'), 450);
        break;
    }
  }, [playTone]);

  const playCountdown = useCallback((secondsLeft: number) => {
    if (secondsLeft <= 3 && secondsLeft > 0) {
      playTone(600, 0.1, 'sine');
    }
  }, [playTone]);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  const setVolume = useCallback((volume: number) => {
    volumeRef.current = Math.max(0, Math.min(1, volume));
  }, []);

  const getVolume = useCallback(() => volumeRef.current, []);

  return {
    playPhaseChange,
    playCountdown,
    setEnabled,
    setVolume,
    getVolume,
    isEnabled: () => enabledRef.current,
  };
};
