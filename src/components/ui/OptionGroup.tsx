'use client';

import type { ReactNode } from 'react';
import { useId } from 'react';

import { cn } from '@/lib/cn';
import { FieldError } from './FieldError';

export interface OptionItem<TValue extends string> {
  value: TValue;
  label: string;
  hint?: string;
  icon?: ReactNode;
}

interface OptionGroupProps<TValue extends string> {
  legend: string;
  /** Oculta el legend visualmente cuando el contexto ya lo explica. */
  hideLegend?: boolean;
  name: string;
  options: OptionItem<TValue>[];
  value: TValue | undefined;
  onChange: (value: TValue) => void;
  error?: string;
  columns?: 2 | 3 | 4;
  size?: 'card' | 'chip';
}

const COLUMN_CLASSES: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

/**
 * Grupo de radios nativos con apariencia de tarjeta.
 * Se apoya en el input real para conservar la navegación con flechas y lectores de pantalla.
 */
export function OptionGroup<TValue extends string>({
  legend,
  hideLegend = false,
  name,
  options,
  value,
  onChange,
  error,
  columns = 3,
  size = 'card',
}: OptionGroupProps<TValue>) {
  const groupId = useId();
  const errorId = `${groupId}-error`;

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend
        className={cn(
          'text-sm font-semibold text-ink-700',
          hideLegend ? 'sr-only' : 'mb-2.5',
        )}
      >
        {legend}
      </legend>

      <div
        className={cn(
          'gap-2',
          size === 'card' ? cn('grid', COLUMN_CLASSES[columns]) : 'flex flex-wrap',
        )}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                'group relative select-none transition-all duration-200 ease-soft',
                'focus-within:ring-2 focus-within:ring-clay-500 focus-within:ring-offset-2 focus-within:ring-offset-cream-100',
                size === 'card'
                  ? 'flex flex-col items-center gap-1.5 rounded-card border p-3 text-center'
                  : 'rounded-pill border px-3.5 py-2 text-sm',
                isSelected
                  ? 'border-clay-500 bg-clay-50 text-clay-700 shadow-soft'
                  : 'border-cream-400 bg-white text-ink-700 hover:border-clay-200 hover:bg-clay-50/40',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.icon ? (
                <span
                  aria-hidden
                  className={cn(
                    'transition-colors duration-200',
                    isSelected ? 'text-clay-600' : 'text-ink-400 group-hover:text-clay-500',
                  )}
                >
                  {option.icon}
                </span>
              ) : null}
              <span className={cn('font-semibold', size === 'card' ? 'text-sm' : 'text-sm')}>
                {option.label}
              </span>
              {option.hint ? <span className="text-xs text-ink-400">{option.hint}</span> : null}
            </label>
          );
        })}
      </div>

      <div className="mt-1.5">
        <FieldError id={errorId} message={error} />
      </div>
    </fieldset>
  );
}
