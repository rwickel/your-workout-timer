import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface AudioToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export const AudioToggle: React.FC<AudioToggleProps> = ({ enabled, onToggle }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={`rounded-lg p-2 transition-colors ${
        enabled 
          ? 'bg-primary/20 text-primary' 
          : 'bg-muted text-muted-foreground'
      }`}
      title={enabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {enabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </motion.button>
  );
};
