'use client';

import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';
import { FieldError } from './FieldError';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  currentLength?: number;
  maxLength?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, currentLength, maxLength, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={textareaId} className="text-sm font-semibold text-ink-700">
          {label}
        </label>
        {maxLength ? (
          <span className="text-xs tabular-nums text-ink-400">
            {currentLength ?? 0}/{maxLength}
          </span>
        ) : null}
      </div>
      <textarea
        ref={ref}
        id={textareaId}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'min-h-[6.5rem] w-full resize-none rounded-card border bg-white px-4 py-3 text-[1rem] leading-relaxed',
          'placeholder:text-ink-300 transition-colors duration-200 ease-soft',
          error ? 'border-clay-500 bg-clay-50/40' : 'border-cream-400',
          className,
        )}
        {...props}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
});
