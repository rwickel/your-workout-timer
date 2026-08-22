import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface AudioToggleProps {
  enabled: boolean;
  onToggle: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export const AudioToggle: React.FC<AudioToggleProps> = ({
  enabled,
  onToggle,
  volume,
  onVolumeChange,
}) => {
  return (
    <div className="flex items-center gap-1">
      {enabled && (
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={Math.round(volume * 100)}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          className="h-1 w-20 cursor-pointer appearance-auto accent-white"
          aria-label="Volume"
        />
      )}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className={`p-2 transition-colors ${
          enabled ? 'text-white' : 'text-neutral-600'
        }`}
        title={enabled ? 'Mute sounds' : 'Enable sounds'}
      >
        {enabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </motion.button>
    </div>
  );
};
