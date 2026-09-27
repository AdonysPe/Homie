'use client';

import { useState } from 'react';

import { StarIcon } from '@/components/icons';
import { cn } from '@/lib/cn';

/** Selector de 1 a 5 estrellas: clic para fijar, hover para previsualizar. */
export function StarRatingInput({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = hovered ?? value;

  return (
    <div role="radiogroup" aria-label="Tu calificación" className="flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
      {Array.from({ length: 5 }, (_, index) => {
        const star = index + 1;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} de 5 estrellas`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            className="p-1 transition-transform active:scale-90"
          >
            <StarIcon size={30} className={cn(star <= shown ? 'text-honey-500' : 'text-cream-400')} />
          </button>
        );
      })}
    </div>
  );
}
