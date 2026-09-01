'use client';

import { motion } from 'framer-motion';

import { cn } from '@/lib/cn';

export function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        'flex items-center justify-between gap-4 rounded-card border px-4 py-3 transition-colors duration-200 ease-soft',
        'focus-within:ring-2 focus-within:ring-clay-500 focus-within:ring-offset-2 focus-within:ring-offset-cream-100',
        checked ? 'border-sage-300 bg-sage-50' : 'border-cream-400 bg-white hover:border-cream-400/70',
      )}
    >
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-ink-900">{label}</span>
        {hint ? <span className="text-xs text-ink-400">{hint}</span> : null}
      </span>

      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-pill transition-colors duration-200 ease-soft',
          checked ? 'bg-sage-500' : 'bg-cream-400',
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 600, damping: 34 }}
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm',
            checked ? 'left-[1.375rem]' : 'left-0.5',
          )}
        />
      </span>
    </label>
  );
}
