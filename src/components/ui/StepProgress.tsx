'use client';

import { motion } from 'framer-motion';

import { cn } from '@/lib/cn';
import { CheckIcon } from '@/components/icons';

export interface StepProgressItem {
  id: string;
  title: string;
}

export function StepProgress({
  steps,
  currentIndex,
  onStepSelect,
}: {
  steps: StepProgressItem[];
  currentIndex: number;
  onStepSelect?: (index: number) => void;
}) {
  return (
    <ol className="flex items-center gap-1.5" aria-label="Progreso de la publicación">
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const canNavigate = Boolean(onStepSelect) && index < currentIndex;

        return (
          <li key={step.id} className={cn('flex-1', isCurrent && 'flex-[1.6]')}>
            <button
              type="button"
              disabled={!canNavigate}
              onClick={() => canNavigate && onStepSelect?.(index)}
              aria-current={isCurrent ? 'step' : undefined}
              className="group flex w-full flex-col gap-1.5 text-left"
            >
              <span className="relative block h-1.5 w-full overflow-hidden rounded-pill bg-cream-300">
                <motion.span
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-pill',
                    isDone ? 'bg-sage-500' : 'bg-clay-500',
                  )}
                  initial={false}
                  animate={{ width: isDone || isCurrent ? '100%' : '0%' }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>
              <span
                className={cn(
                  'flex items-center gap-1 text-[0.7rem] font-semibold uppercase tracking-[0.08em] transition-colors',
                  isCurrent ? 'text-clay-600' : isDone ? 'text-sage-600' : 'text-ink-300',
                )}
              >
                {isDone ? <CheckIcon size={12} /> : null}
                <span className={cn(!isCurrent && !isDone && 'hidden sm:inline')}>{step.title}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
