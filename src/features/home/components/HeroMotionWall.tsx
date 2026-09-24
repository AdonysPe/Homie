import Image from 'next/image';

import { SEED_LISTINGS } from '@/features/pets/lib/pets-data';
import { cn } from '@/lib/cn';

const PHOTOS = SEED_LISTINGS.filter((listing) => listing.photoUrl).map((listing) => ({
  id: listing.id,
  url: listing.photoUrl!,
}));

/** Columnas del muro: dirección y velocidad distintas para que nunca se vea mecánico. */
const COLUMNS = [
  { offset: 0, direction: 'up', duration: 58, className: 'flex' },
  { offset: 3, direction: 'down', duration: 72, className: 'flex' },
  { offset: 6, direction: 'up', duration: 64, className: 'flex' },
  { offset: 1, direction: 'down', duration: 80, className: 'hidden md:flex' },
  { offset: 8, direction: 'up', duration: 68, className: 'hidden lg:flex' },
] as const;

const PER_COLUMN = 5;

/** Alterna retrato y cuadrado, como una galería de Fotos. */
const ASPECTS = ['aspect-[4/5]', 'aspect-square', 'aspect-[3/4]', 'aspect-[5/6]', 'aspect-square'];

function columnPhotos(offset: number) {
  return Array.from({ length: PER_COLUMN }, (_, index) => PHOTOS[(offset + index * 2) % PHOTOS.length]);
}

/**
 * Muro de fotos en movimiento continuo (estilo Apple): columnas que suben y bajan
 * a distinto ritmo, con los bordes desvanecidos.
 *
 * Todo es CSS (transform + animation): corre en el compositor, no en JavaScript.
 * Cada columna repite su contenido dos veces, así el -50% final coincide con el
 * inicio y el bucle no tiene costura. Se pausa al pasar el puntero y queda quieto
 * si el sistema pide menos movimiento (regla global en globals.css).
 */
export function HeroMotionWall() {
  return (
    <div
      aria-hidden
      className={cn(
        'relative h-[26rem] overflow-hidden sm:h-[34rem] lg:h-[clamp(34rem,68svh,44rem)]',
        '[mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)]',
      )}
    >
      <div className="flex h-full justify-center gap-3 sm:gap-4">
        {COLUMNS.map((column, columnIndex) => {
          const photos = columnPhotos(column.offset);
          return (
            <div key={columnIndex} className={cn('min-w-0 max-w-[16rem] flex-1', column.className)}>
              <div
                className={cn(
                  'flex w-full flex-col will-change-transform hover:[animation-play-state:paused]',
                  column.direction === 'up' ? 'animate-wall-up' : 'animate-wall-down',
                )}
                style={{ animationDuration: `${column.duration}s` }}
              >
                {/* Cada copia lleva su espaciado final: así -50% cae justo en el inicio de la segunda. */}
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex flex-col gap-3 pb-3 sm:gap-4 sm:pb-4">
                    {photos.map((photo, index) => (
                      <div
                        key={`${copy}-${photo.id}-${index}`}
                        className={cn(
                          'relative w-full shrink-0 overflow-hidden rounded-[1.5rem] bg-cream-200 sm:rounded-[1.75rem]',
                          ASPECTS[(index + columnIndex) % ASPECTS.length],
                        )}
                      >
                        <Image
                          src={photo.url}
                          alt=""
                          fill
                          // Las primeras fotos de las columnas visibles en móvil están arriba del pliegue.
                          priority={copy === 0 && index < 2 && columnIndex < 3}
                          sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16rem"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
