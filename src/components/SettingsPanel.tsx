import React, { useState } from 'react';
import { NumberInput } from './NumberInput';
import { getTimerSettings, setTimerSettings } from '@/lib/timerSettings';

// Global audio settings — apply to interval and WOD runners alike
export const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState(getTimerSettings);

  const update = (field: 'countdownSeconds' | 'beepSeconds' | 'preparationSeconds', value: number) => {
    const next = { ...settings, [field]: value };
    setSettings(next);
    setTimerSettings({ [field]: value });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <p className="section-label">Audio</p>
        <p className="text-xs text-neutral-600">
          These settings apply to all interval workouts and WODs.
        </p>
        <NumberInput
          label="Countdown (s before end)"
          value={settings.countdownSeconds}
          onChange={(v) => update('countdownSeconds', Math.max(0, v))}
          min={0}
          max={30}
          suffix="s"
        />
        <NumberInput
          label="Beep (s before end)"
          value={settings.beepSeconds}
          onChange={(v) => update('beepSeconds', Math.max(0, v))}
          min={0}
          max={30}
          suffix="s"
        />
        <NumberInput
          label="Preparation (s)"
          value={settings.preparationSeconds}
          onChange={(v) => update('preparationSeconds', Math.max(1, v))}
          min={1}
          max={60}
          suffix="s"
        />
      </div>
    </div>
  );
};
