import { VerifiedIcon } from '@/components/icons';
import { cn } from '@/lib/cn';

/** Señal de confianza: la persona confirmó su email. */
export function VerifiedBadge({
  verified,
  label,
  className,
}: {
  verified: boolean;
  /** Texto a mostrar; por defecto describe el estado del email. */
  label?: string;
  className?: string;
}) {
  if (!verified) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-pill bg-honey-200 px-2 py-0.5 text-xs font-semibold text-[#7A5A14]',
          className,
        )}
      >
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-honey-600" />
        {label ?? 'Email sin confirmar'}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill bg-sage-100 px-2 py-0.5 text-xs font-semibold text-sage-700',
        className,
      )}
    >
      <VerifiedIcon size={14} className="text-sage-500" />
      {label ?? 'Email verificado'}
    </span>
  );
}
