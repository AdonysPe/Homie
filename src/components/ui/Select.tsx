'use client';

import { forwardRef, useId, type SelectHTMLAttributes } from 'react';

import { ChevronDownIcon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { FieldError } from './FieldError';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
}

/**
 * Select nativo con piel propia: en iOS y Android abre el selector del sistema,
 * que es más rápido y accesible que cualquier dropdown hecho a mano.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-semibold text-ink-700">
        {label}
      </label>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(error ? errorId : undefined, hint ? hintId : undefined) || undefined}
          className={cn(
            'h-12 w-full appearance-none rounded-card border bg-white pl-4 pr-11 text-[1rem] text-ink-900',
            'transition-colors duration-200 ease-soft',
            error ? 'border-clay-500 bg-clay-50/40' : 'border-cream-400',
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-400"
        />
      </div>
      {hint && !error ? (
        <p id={hintId} className="text-xs text-ink-400">
          {hint}
        </p>
      ) : null}
      <FieldError id={errorId} message={error} />
    </div>
  );
});
