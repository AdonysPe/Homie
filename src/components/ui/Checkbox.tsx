'use client';

import { useId, type ReactNode } from 'react';

import { CheckIcon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { FieldError } from './FieldError';

export function Checkbox({
  label,
  checked,
  onChange,
  error,
}: {
  /** Puede incluir enlaces (ej. a los Términos): activarlos no marca la casilla. */
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}) {
  const errorId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-start gap-3 text-sm text-ink-700">
        {/* El check visible es el propio input: así el click no pasa por la etiqueta. */}
        <span className="relative mt-0.5 flex h-5 w-5 shrink-0">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'peer h-5 w-5 appearance-none rounded-md border bg-white',
              'transition-colors duration-150 checked:border-clay-500 checked:bg-clay-500',
              error ? 'border-clay-500' : 'border-cream-400',
            )}
          />
          <CheckIcon
            size={13}
            className="pointer-events-none absolute inset-0 m-auto text-white opacity-0 transition-opacity peer-checked:opacity-100"
          />
        </span>
        <span className="leading-snug">{label}</span>
      </label>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
