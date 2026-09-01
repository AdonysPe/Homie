import { PawIcon } from '@/components/icons';
import { cn } from '@/lib/cn';

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-[0.9rem] bg-clay-500 text-white">
        <PawIcon size={20} />
      </span>
      <span className="text-lg font-bold tracking-[-0.02em] text-ink-900">Homie</span>
    </span>
  );
}
