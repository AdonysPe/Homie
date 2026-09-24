import { PawIcon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { SITE } from '@/lib/site';

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <span className="flex h-7 w-7 items-center justify-center rounded-[0.55rem] bg-clay-500 text-white">
        <PawIcon size={16} />
      </span>
      <span className="text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink-900">{SITE.name}</span>
    </span>
  );
}
