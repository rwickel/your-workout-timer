import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import { Wod, SCHEME_LABELS } from '@/types/wod';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

interface WodImportProps {
  wod: Wod;
  onImport: (wod: Wod, startNow: boolean) => void;
  onDismiss: () => void;
}

export const WodImport: React.FC<WodImportProps> = ({ wod, onImport, onDismiss }) => {
  const [added, setAdded] = useState(false);
  const { canInstall, promptInstall } = useInstallPrompt();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-xs space-y-6 text-center">
        <div className="flex items-center justify-between text-left">
          <h3 className="section-label">Shared Workout</h3>
          <button onClick={onDismiss} className="text-neutral-600 transition-colors hover:text-white" aria-label="Dismiss">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl border border-neutral-900 p-4 text-left">
          <p className="text-lg font-bold text-white">{wod.name}</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-neutral-400">
            {SCHEME_LABELS[wod.scheme]}
            {wod.scheme === 'amrap' && ` · ${Math.round(wod.timeCapSeconds / 60)} min`}
            {(wod.scheme === 'emom' || wod.scheme === 'rounds') && ` · ${wod.rounds} rounds`}
          </p>
          <div className="mt-3 space-y-1 border-t border-neutral-900 pt-3">
            {wod.movements.map(m => (
              <p key={m.id} className="text-sm text-neutral-400 tabular">
                <span className="font-bold text-white">{m.reps}</span> {m.name}
              </p>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {canInstall ? (
            <button
              onClick={promptInstall}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-900 py-3 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:border-neutral-400"
            >
              <Download className="h-4 w-4" />
              Install App
            </button>
          ) : (
            <p className="text-[11px] leading-relaxed text-neutral-600">
              Install manually: Chrome menu (⋮) → "Add to Home screen"
            </p>
          )}
          <button
            onClick={() => { setAdded(true); setTimeout(() => onImport(wod, false), 600); }}
            disabled={added}
            className="w-full rounded-lg bg-white py-4 text-sm font-semibold uppercase tracking-widest text-black transition-colors hover:bg-neutral-200 disabled:bg-neutral-900 disabled:text-neutral-500"
          >
            {added ? 'Added!' : 'Add to My WODs'}
          </button>
          <button
            onClick={() => onImport(wod, true)}
            className="w-full rounded-lg border border-neutral-900 py-3 text-sm font-medium uppercase tracking-widest text-neutral-400 transition-colors hover:border-neutral-400 hover:text-white"
          >
            Start Now
          </button>
          <button
            onClick={onDismiss}
            className="w-full text-xs uppercase tracking-widest text-neutral-600 transition-colors hover:text-neutral-400"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
