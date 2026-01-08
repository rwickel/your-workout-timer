import React from 'react';
import { motion } from 'framer-motion';
import { TimerConfig } from '@/types/timer';
import { TimeInput } from './TimeInput';
import { NumberInput } from './NumberInput';
import { Dumbbell, Coffee, Timer, RotateCw, TrendingUp, TrendingDown } from 'lucide-react';

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 rounded-2xl bg-card p-6"
    >
      {/* Timer Durations */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Timer className="h-5 w-5 text-primary" />
          Timer Settings
        </h3>
        
        <div className="grid gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-8 rounded-lg bg-work/20 p-2">
              <Dumbbell className="h-5 w-5 text-work" />
            </div>
            <div className="flex-1">
              <TimeInput
                label="Work Time"
                value={config.workTime}
                onChange={(v) => updateField('workTime', v)}
                colorClass="text-work"
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-8 rounded-lg bg-pause/20 p-2">
              <Coffee className="h-5 w-5 text-pause" />
            </div>
            <div className="flex-1">
              <TimeInput
                label="Rest Time"
                value={config.pauseTime}
                onChange={(v) => updateField('pauseTime', v)}
                colorClass="text-pause"
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-8 rounded-lg bg-preparation/20 p-2">
              <Timer className="h-5 w-5 text-preparation" />
            </div>
            <div className="flex-1">
              <TimeInput
                label="Preparation Time"
                value={config.preparationTime}
                onChange={(v) => updateField('preparationTime', v)}
                colorClass="text-preparation"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rounds */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <RotateCw className="h-5 w-5 text-primary" />
          Rounds
        </h3>
        <NumberInput
          label="Number of Rounds"
          value={config.rounds}
          onChange={(v) => updateField('rounds', v)}
          min={1}
          max={99}
          colorClass="text-primary"
        />
      </div>

      {/* Progressive Adjustments */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          {config.restAdjustment >= 0 ? (
            <TrendingUp className="h-5 w-5 text-primary" />
          ) : (
            <TrendingDown className="h-5 w-5 text-primary" />
          )}
          Progressive Adjustment
        </h3>
        <p className="text-sm text-muted-foreground">
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
            colorClass="text-work"
            showSign
          />
          <NumberInput
            label="Rest Adj."
            value={config.restAdjustment}
            onChange={(v) => updateField('restAdjustment', v)}
            min={-30}
            max={30}
            suffix="s"
            colorClass="text-pause"
            showSign
          />
          <NumberInput
            label="Prep Adj."
            value={config.preparationAdjustment}
            onChange={(v) => updateField('preparationAdjustment', v)}
            min={-30}
            max={30}
            suffix="s"
            colorClass="text-preparation"
            showSign
          />
        </div>
      </div>
    </motion.div>
  );
};
