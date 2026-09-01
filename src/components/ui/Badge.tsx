import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type BadgeTone = 'clay' | 'sage' | 'honey' | 'neutral';

const TONES: Record<BadgeTone, string> = {
  clay: 'bg-clay-100 text-clay-700',
  sage: 'bg-sage-100 text-sage-700',
  honey: 'bg-honey-200 text-[#7A5A14]',
  neutral: 'bg-cream-200 text-ink-700',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
