import React, { useState, useEffect } from 'react';
import { formatTime, parseTime } from '@/types/timer';
import { Minus, Plus } from 'lucide-react';

interface TimeInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 3600,
  step = 5,
}) => {
  const [inputValue, setInputValue] = useState(formatTime(value));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(formatTime(value));
    }
  }, [value, isEditing]);

  const handleIncrement = () => {
    onChange(Math.min(max, value + step));
  };

  const handleDecrement = () => {
    onChange(Math.max(min, value - step));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9:]/g, '');

    if (val.length === 2 && !val.includes(':')) {
      val = val + ':';
    }

    if (val.length > 5) {
      val = val.slice(0, 5);
    }

    setInputValue(val);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const parsed = parseTime(inputValue);
    const seconds = Number.isFinite(parsed) ? parsed : 0;
    const clampedValue = Math.max(min, Math.min(max, seconds));
    onChange(clampedValue);
    setInputValue(formatTime(clampedValue));
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

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
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="w-full min-w-0 bg-transparent text-center font-mono text-3xl font-bold text-white tabular focus:outline-none"
          placeholder="00:00"
        />
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
