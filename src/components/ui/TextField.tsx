'use client';

import { forwardRef, useId, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';
import { FieldError } from './FieldError';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  suffix?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, suffix, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-ink-700">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(error ? errorId : undefined, hint ? hintId : undefined) || undefined}
          className={cn(
            'h-12 w-full rounded-card border bg-white px-4 text-[1rem] text-ink-900 placeholder:text-ink-300',
            'transition-colors duration-200 ease-soft',
            error ? 'border-clay-500 bg-clay-50/40' : 'border-cream-400 hover:border-cream-400/80',
            suffix && 'pr-14',
            className,
          )}
          {...props}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-ink-400">
            {suffix}
          </span>
        ) : null}
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
