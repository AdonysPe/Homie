import { ShieldIcon } from '@/components/icons';
import { cn } from '@/lib/cn';

/** Más de {TRUSTED_MIN_REVIEWS} reseñas y promedio mayor a {TRUSTED_MIN_AVERAGE} (ver review-rules.ts). */
export function TrustedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill bg-sage-100 px-2.5 py-1 text-xs font-semibold text-sage-700',
        className,
      )}
    >
      <ShieldIcon size={14} className="text-sage-600" />
      Usuario confiable
    </span>
  );
}
