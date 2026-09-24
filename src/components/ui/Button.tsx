'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'quiet';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Muestra un spinner, bloquea el botón y lo anuncia como ocupado. */
  isLoading?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-clay-500 text-white shadow-soft hover:bg-clay-600 disabled:bg-clay-200 disabled:text-white/70',
  secondary:
    'bg-white text-ink-900 border border-cream-400 hover:border-clay-300 hover:bg-clay-50 disabled:opacity-50',
  ghost: 'bg-transparent text-ink-700 hover:bg-cream-200 disabled:opacity-50',
  quiet: 'bg-sage-100 text-sage-800 hover:bg-sage-200 disabled:opacity-50',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-[0.95rem] gap-2',
  lg: 'h-13 px-6 text-base gap-2.5 min-h-[3.25rem]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    className,
    type = 'button',
    disabled,
    children,
    ...props
  },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'inline-flex items-center justify-center rounded-pill font-semibold tracking-[-0.01em]',
        'transition-colors duration-200 ease-soft disabled:cursor-not-allowed select-none',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading ? <Spinner size={16} /> : null}
      {children as React.ReactNode}
    </motion.button>
  );
});
