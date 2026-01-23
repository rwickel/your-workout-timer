import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  colorClass?: string;
  showSign?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min = -999,
  max = 999,
  step = 1,
  suffix = '',
  colorClass = 'text-primary',
  showSign = false,
}) => {
  const handleIncrement = () => {
    onChange(Math.min(max, value + step));
  };

  const handleDecrement = () => {
    onChange(Math.max(min, value - step));
  };

  const displayValue = showSign && value > 0 ? `+${value}` : value.toString();

  return (
    <div className="flex flex-col gap-2">
      <label className={`text-sm font-medium ${colorClass}`}>{label}</label>
      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2">
        <button
          onClick={handleDecrement}
          className="flex h-10 w-10 items-center justify-center rounded-md bg-background/50 text-foreground transition-colors hover:bg-background active:scale-95"
        >
          <Minus className="h-5 w-5" />
        </button>
        <div className={`flex-1 text-center font-mono text-2xl font-bold ${colorClass}`}>
          {displayValue}{suffix}
        </div>
        <button
          onClick={handleIncrement}
          className="flex h-10 w-10 items-center justify-center rounded-md bg-background/50 text-foreground transition-colors hover:bg-background active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
