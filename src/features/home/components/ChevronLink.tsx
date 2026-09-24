'use client';

import { ChevronDownIcon } from '@/components/icons';
import { cn } from '@/lib/cn';

/** El clásico enlace de Apple: texto en color de acento con un chevron "›". */
export function ChevronLink({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group inline-flex items-center gap-1 text-[1.0625rem] font-medium text-clay-600 transition-colors hover:text-clay-700',
        className,
      )}
    >
      {children}
      <ChevronDownIcon
        size={17}
        strokeWidth={2.2}
        className="-rotate-90 transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </button>
  );
}
