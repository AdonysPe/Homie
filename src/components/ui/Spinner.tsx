import { cn } from '@/lib/cn';

/** Indicador de actividad estilo iOS: 8 segmentos que se desvanecen en círculo. */
export function Spinner({ size = 18, className, label }: { size?: number; className?: string; label?: string }) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('relative inline-block shrink-0', className)}
      style={{ width: size, height: size }}
    >
      {Array.from({ length: 8 }, (_, index) => (
        <span
          key={index}
          className="absolute left-[45%] top-0 h-[28%] w-[10%] rounded-pill bg-current animate-spinner-fade"
          style={{
            transform: `rotate(${index * 45}deg)`,
            transformOrigin: `50% ${size / 2}px`,
            animationDelay: `${(index - 8) * 0.1}s`,
          }}
        />
      ))}
    </span>
  );
}
