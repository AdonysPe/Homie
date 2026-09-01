import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center text-center',
        className,
      )}
    >
      <div className={cn('max-w-prose', align === 'center' && 'mx-auto')}>
        {eyebrow ? <p className="eyebrow mb-2.5">{eyebrow}</p> : null}
        <h2 className="text-display-sm font-display text-balance">{title}</h2>
        {description ? <p className="mt-3 text-ink-500 text-[1.0625rem] leading-relaxed">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
