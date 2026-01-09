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
  colorClass?: string;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 3600,
  step = 5,
  colorClass = 'text-primary',
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
    
    // Auto-insert colon after 2 digits if not present
    if (val.length === 2 && !val.includes(':')) {
      val = val + ':';
    }
    
    // Limit format to mm:ss
    if (val.length > 5) {
      val = val.slice(0, 5);
    }
    
    setInputValue(val);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const seconds = parseTime(inputValue);
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
    <div className="flex flex-col gap-2">
      <label className={`text-sm font-medium ${colorClass}`}>{label}</label>
      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2">
        <button
          onClick={handleDecrement}
          className="flex h-10 w-10 items-center justify-center rounded-md bg-background/50 text-foreground transition-colors hover:bg-background active:scale-95"
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
          className={`flex-1 bg-transparent text-center font-mono text-2xl font-bold ${colorClass} focus:outline-none focus:ring-2 focus:ring-primary rounded-md`}
          placeholder="00:00"
        />
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
