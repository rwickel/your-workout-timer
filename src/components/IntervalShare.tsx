import React, { useEffect, useRef, useState } from 'react';
import { X, Copy, MessageCircle, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { TimerConfig } from '@/types/timer';
import { intervalShareUrlFor, intervalWhatsappUrlFor } from '@/lib/intervalShare';

interface IntervalShareModalProps {
  config: TimerConfig;
  onClose: () => void;
}

export const IntervalShareModal: React.FC<IntervalShareModalProps> = ({ config, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const url = intervalShareUrlFor(config);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 220,
        margin: 2,
        color: { dark: '#ffffff', light: '#000000' },
      }).catch(() => undefined);
    }
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.warn('Copy failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xs space-y-4 rounded-xl border border-neutral-900 bg-black p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="section-label">Share Workout</h3>
          <button onClick={onClose} className="flex min-h-[44px] min-w-[44px] items-center justify-center text-neutral-600 transition-all duration-150 hover:text-white active:scale-[0.98]" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <canvas ref={canvasRef} className="mx-auto rounded-lg" />

        <button
          onClick={copy}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-900 py-3 text-sm text-neutral-400 transition-all duration-150 active:scale-[0.98] hover:border-neutral-400 hover:text-white"
        >
          <Copy className="h-4 w-4" />
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        <a
          href={intervalWhatsappUrlFor(config)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-semibold uppercase tracking-widest text-black transition-all duration-150 active:scale-[0.98] hover:bg-neutral-200"
        >
          <MessageCircle className="h-4 w-4" />
          Share via WhatsApp
        </a>

        <p className="text-[11px] text-neutral-600">
          Scan with another device running this app to import the workout.
        </p>
      </div>
    </div>
  );
};

interface IntervalImportModalProps {
  config: TimerConfig;
  onImport: () => void;
  onDismiss: () => void;
}

export const IntervalImportModal: React.FC<IntervalImportModalProps> = ({ config, onImport, onDismiss }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-xs space-y-6 text-center">
        <div className="flex items-center justify-between text-left">
          <h3 className="section-label">Shared Workout</h3>
          <button onClick={onDismiss} className="flex min-h-[44px] min-w-[44px] items-center justify-center text-neutral-600 transition-all duration-150 hover:text-white active:scale-[0.98]" aria-label="Dismiss">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl border border-neutral-900 p-4 text-left">
          <p className="text-lg font-bold text-white">{config.exerciseName?.trim() || 'Interval Workout'}</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-neutral-400">
            {config.rounds} rounds · {config.workTime}s / {config.pauseTime}s
            {config.preparationTime > 0 && ` · ${config.preparationTime}s prep`}
          </p>
          {config.exercises && config.exercises.length > 0 && (
            <div className="mt-3 space-y-1 border-t border-neutral-900 pt-3">
              {config.exercises.map(ex => (
                <p key={ex.id} className="text-sm text-neutral-400 tabular">
                  {ex.name || 'Exercise'}:{' '}
                  <span className="font-bold text-white">
                    {ex.mode === 'reps' ? `${ex.reps ?? 0} reps` : `${ex.workTime}s`}
                  </span>{' '}
                  × {ex.rounds ?? config.rounds}
                </p>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onImport}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-semibold uppercase tracking-widest text-black transition-all duration-150 active:scale-[0.98] hover:bg-neutral-200"
        >
          <Download className="h-4 w-4" />
          Load Workout
        </button>
      </div>
    </div>
  );
};
