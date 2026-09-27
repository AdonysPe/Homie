import { StarIcon } from '@/components/icons';
import { cn } from '@/lib/cn';

/** Estrellas de solo lectura: para mostrar un promedio o una reseña ya dejada. */
export function StarRating({
  value,
  size = 18,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={`${value} de 5 estrellas`}
      className={cn('inline-flex items-center gap-0.5', className)}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon key={index} size={size} className={index < Math.round(value) ? 'text-honey-500' : 'text-cream-400'} />
      ))}
    </span>
  );
}
