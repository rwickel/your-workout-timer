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
    <div className="flex flex-col gap-1">
      <label className="section-label">{label}</label>
      <div className="flex items-center justify-between">
        <button
          onClick={handleDecrement}
          className="flex h-11 w-11 shrink-0 items-center justify-center text-neutral-400 transition-all duration-150 hover:text-white active:scale-95"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-5 w-5" />
        </button>
        <div className="flex-1 text-center font-mono text-3xl font-bold text-white tabular">
          {displayValue}
          {suffix && <span className="text-xs font-normal text-neutral-400">{suffix}</span>}
        </div>
        <button
          onClick={handleIncrement}
          className="flex h-11 w-11 shrink-0 items-center justify-center text-neutral-400 transition-all duration-150 hover:text-white active:scale-95"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
