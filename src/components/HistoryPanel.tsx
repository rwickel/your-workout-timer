import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { HistoryEntry } from '@/hooks/useHistory';
import { formatWodTime } from '@/types/wod';

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onDelete: (id: string) => void;
}

const SCHEME_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'amrap', label: 'AMRAP' },
  { key: 'fortime', label: 'For Time' },
  { key: 'emom', label: 'EMOM' },
  { key: 'rounds', label: 'Rounds' },
  { key: 'interval', label: 'Interval' },
];

const RANGE_FILTERS = [
  { key: '7d', label: '7d', days: 7 },
  { key: '30d', label: '30d', days: 30 },
  { key: 'all', label: 'All', days: Infinity },
] as const;

const dayKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const dayLabel = (ts: number) => {
  const today = dayKey(Date.now());
  const yesterday = dayKey(Date.now() - 86400000);
  const k = dayKey(ts);
  if (k === today) return 'Today';
  if (k === yesterday) return 'Yesterday';
  return new Date(ts).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ entries, onDelete }) => {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [scheme, setScheme] = useState('all');
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [search, setSearch] = useState('');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const filtered = useMemo(() => {
    const rangeDays = RANGE_FILTERS.find(r => r.key === range)!.days;
    const cutoff = rangeDays === Infinity ? 0 : Date.now() - rangeDays * 86400000;
    return entries
      .filter(e => e.finishedAt >= cutoff)
      .filter(e => scheme === 'all' || e.scheme === scheme)
      .filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()))
      .filter(e => !selectedDay || dayKey(e.finishedAt) === selectedDay)
      .sort((a, b) => b.finishedAt - a.finishedAt);
  }, [entries, scheme, range, search, selectedDay]);

  // Group by day
  const grouped = useMemo(() => {
    const map = new Map<string, HistoryEntry[]>();
    for (const e of filtered) {
      const k = dayKey(e.finishedAt);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    }
    return [...map.entries()];
  }, [filtered]);

  // Stats (this month)
  const stats = useMemo(() => {
    const now = new Date();
    const monthEntries = entries.filter(e => {
      const d = new Date(e.finishedAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalSeconds = monthEntries.reduce((s, e) => s + e.timeSeconds, 0);
    const freq = new Map<string, number>();
    for (const e of monthEntries) freq.set(e.title, (freq.get(e.title) ?? 0) + 1);
    const top = [...freq.entries()].sort((a, b) => b[1] - a[1])[0];
    return {
      sessions: monthEntries.length,
      totalTime: totalSeconds,
      topWod: top ? `${top[0]} ×${top[1]}` : '—',
    };
  }, [entries]);

  // Calendar grid for displayed month
  const calendar = useMemo(() => {
    const base = new Date();
    base.setDate(1);
    base.setMonth(base.getMonth() + monthOffset);
    const year = base.getFullYear();
    const month = base.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const activeDays = new Set(
      entries.filter(e => {
        const d = new Date(e.finishedAt);
        return d.getFullYear() === year && d.getMonth() === month;
      }).map(e => dayKey(e.finishedAt))
    );
    return { year, month, firstDow, daysInMonth, activeDays, name: base.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  }, [monthOffset, entries]);

  const resultLabel = (e: HistoryEntry) =>
    e.scheme === 'amrap'
      ? `${e.roundsCompleted} rounds`
      : e.scheme === 'interval'
      ? formatWodTime(e.timeSeconds)
      : formatWodTime(e.timeSeconds);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Stats strip */}
      <div className="flex justify-between border-b border-neutral-900 pb-4">
        <div>
          <p className="section-label">Sessions</p>
          <p className="mt-1 font-mono text-xl font-bold text-white tabular">{stats.sessions}</p>
        </div>
        <div className="text-center">
          <p className="section-label">Total Time</p>
          <p className="mt-1 font-mono text-xl font-bold text-white tabular">{formatWodTime(stats.totalTime)}</p>
        </div>
        <div className="max-w-[40%] truncate text-right">
          <p className="section-label">Top WOD</p>
          <p className="mt-1 truncate font-mono text-sm font-bold text-neutral-400">{stats.topWod}</p>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-4">
        {(['list', 'calendar'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`text-xs font-medium uppercase tracking-widest transition-colors ${
              view === v ? 'border-b border-white pb-1 text-white' : 'pb-1 text-neutral-600 hover:text-neutral-400'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === 'calendar' && (
        <div className="rounded-xl border border-neutral-900 p-4">
          <div className="mb-3 flex items-center justify-between">
            <button onClick={() => setMonthOffset(m => m - 1)} className="text-neutral-400 hover:text-white" aria-label="Previous month">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-white">{calendar.name}</span>
            <button onClick={() => setMonthOffset(m => Math.min(0, m + 1))} disabled={monthOffset >= 0} className="text-neutral-400 hover:text-white disabled:text-neutral-700" aria-label="Next month">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <span key={i} className="py-1 text-[10px] uppercase tracking-widest text-neutral-600">{d}</span>
            ))}
            {Array.from({ length: calendar.firstDow }).map((_, i) => (
              <span key={`pad-${i}`} />
            ))}
            {Array.from({ length: calendar.daysInMonth }, (_, i) => {
              const day = i + 1;
              const k = `${calendar.year}-${String(calendar.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const active = calendar.activeDays.has(k);
              const selected = selectedDay === k;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(selected ? null : k)}
                  className={`aspect-square rounded-md text-sm tabular transition-colors ${
                    selected
                      ? 'bg-white font-bold text-black'
                      : active
                      ? 'font-bold text-white ring-1 ring-inset ring-neutral-500 hover:bg-neutral-900'
                      : 'text-neutral-700'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          {selectedDay && (
            <button
              onClick={() => setSelectedDay(null)}
              className="mt-3 w-full text-center text-xs uppercase tracking-widest text-neutral-600 hover:text-neutral-400"
            >
              Clear day filter
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="space-y-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search WODs..."
          className="w-full rounded-md border border-neutral-900 bg-transparent px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-400 focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          {SCHEME_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setScheme(f.key)}
              className={`rounded-full border px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest transition-colors ${
                scheme === f.key
                  ? 'border-white bg-white text-black'
                  : 'border-neutral-900 text-neutral-400 hover:border-neutral-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="mx-1 w-px self-stretch bg-neutral-900" />
          {RANGE_FILTERS.map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-full border px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest transition-colors ${
                range === r.key
                  ? 'border-white bg-white text-black'
                  : 'border-neutral-900 text-neutral-400 hover:border-neutral-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {grouped.length === 0 ? (
        <p className="py-6 text-sm text-neutral-600">No sessions found.</p>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {grouped.map(([k, dayEntries]) => (
              <div key={k}>
                <p className="section-label mb-1">{selectedDay ? dayLabel(dayEntries[0].finishedAt) : dayLabel(dayEntries[0].finishedAt)}</p>
                {dayEntries.map(e => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 border-b border-neutral-900 py-3"
                  >
                    <span className="text-xs text-neutral-600 tabular">
                      {new Date(e.finishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{e.title}</p>
                      <p className="text-[11px] uppercase tracking-widest text-neutral-600">{e.scheme}</p>
                    </div>
                    <span className="font-mono text-sm text-neutral-400 tabular">{resultLabel(e)}</span>
                    <button
                      onClick={() => onDelete(e.id)}
                      className="p-1.5 text-neutral-700 transition-colors hover:text-white"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};
