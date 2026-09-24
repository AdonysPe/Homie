import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/** Encabezado de sección estilo Apple: antetítulo de color, titular grande y bajada corta. */
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
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'items-center text-center sm:flex-col sm:items-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h2 className="text-display-md font-display text-balance text-ink-900">{title}</h2>
        {description ? <p className="mt-4 text-lede text-ink-500 text-balance">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
