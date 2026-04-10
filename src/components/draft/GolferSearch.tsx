import { useState, useRef, useEffect } from 'react';
import type { PlayerScore } from '@/lib/scoring';
import { cn } from '@/utils/cn';

interface GolferSearchProps {
  players: PlayerScore[];
  value: string | null;
  onChange: (playerId: string | null) => void;
  disabledPlayerIds: string[];
  placeholder?: string;
  label?: string;
}

export function GolferSearch({
  players,
  value,
  onChange,
  disabledPlayerIds,
  placeholder = 'Search golfer...',
  label,
}: GolferSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = players.find(p => p.id === value);

  const filtered = query.trim() === ''
    ? players.slice(0, 50)
    : players.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 50);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <button
        type="button"
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm text-left',
          'bg-white focus:outline-none focus:ring-2 focus:ring-golf-green',
          selected ? 'border-golf-green text-gray-900' : 'border-gray-300 text-gray-400',
        )}
        onClick={() => setOpen(v => !v)}
      >
        <span className="truncate">{selected ? selected.name : placeholder}</span>
        {selected && (
          <span
            role="button"
            onClick={e => { e.stopPropagation(); onChange(null); setQuery(''); }}
            className="text-gray-400 hover:text-gray-700 ml-1 shrink-0"
          >
            ✕
          </span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-golf-green"
              placeholder="Type to search..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-400">No players found</li>
            )}
            {filtered.map(p => {
              const disabled = disabledPlayerIds.includes(p.id) && p.id !== value;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={disabled}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm transition-colors',
                      disabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'hover:bg-green-50 text-gray-800',
                      value === p.id && 'bg-green-50 font-medium',
                    )}
                    onClick={() => {
                      onChange(p.id);
                      setOpen(false);
                      setQuery('');
                    }}
                  >
                    <span className="font-medium">{p.name}</span>
                    {p.position && p.position !== '-' && (
                      <span className="text-gray-400 ml-2 text-xs">{p.position}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
