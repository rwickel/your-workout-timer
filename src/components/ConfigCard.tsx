import React from 'react';
import { motion } from 'framer-motion';
import { TimerConfig } from '@/types/timer';
import { TimeInput } from './TimeInput';
import { NumberInput } from './NumberInput';

interface ConfigCardProps {
  config: TimerConfig;
  onChange: (config: TimerConfig) => void;
}

export const ConfigCard: React.FC<ConfigCardProps> = ({ config, onChange }) => {
  const updateField = <K extends keyof TimerConfig>(field: K, value: TimerConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Timer Durations */}
      <div className="space-y-4">
        <TimeInput
          label="Work Time"
          value={config.workTime}
          onChange={(v) => updateField('workTime', v)}
        />

        <TimeInput
          label="Rest Time"
          value={config.pauseTime}
          onChange={(v) => updateField('pauseTime', v)}
        />
      </div>

      <div className="border-t border-neutral-900" />

      {/* Rounds */}
      <div className="space-y-4">
        <NumberInput
          label="Number of Rounds"
          value={config.rounds}
          onChange={(v) => updateField('rounds', v)}
          min={1}
          max={99}
        />
      </div>

      <div className="border-t border-neutral-900" />

      {/* Progressive Adjustments */}
      <div className="space-y-4">
        <h3 className="section-label">Progressive Adjustment</h3>
        <p className="text-sm text-neutral-400">
          Adjust rest/prep time each round (use negative to decrease)
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <NumberInput
            label="Work Adj."
            value={config.workAdjustment}
            onChange={(v) => updateField('workAdjustment', v)}
            min={-30}
            max={30}
            suffix="s"
            showSign
          />
          <NumberInput
            label="Rest Adj."
            value={config.restAdjustment}
            onChange={(v) => updateField('restAdjustment', v)}
            min={-30}
            max={30}
            suffix="s"
            showSign
          />
          <NumberInput
            label="Prep Adj."
            value={config.preparationAdjustment}
            onChange={(v) => updateField('preparationAdjustment', v)}
            min={-30}
            max={30}
            suffix="s"
            showSign
          />
        </div>
      </div>
    </motion.div>
  );
};
