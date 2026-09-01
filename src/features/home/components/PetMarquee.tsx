'use client';

import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { SEED_LISTINGS } from '@/features/pets/lib/pets-data';
import { speciesLabel } from '@/lib/pet-catalog';
import type { PetListing } from '@/types/pet';

export const MARQUEE_ITEMS = SEED_LISTINGS.filter((listing) => listing.photoUrl);

/** Píxeles por segundo. Al pasar el puntero baja a paso de lectura. */
const CRUISE_SPEED = 46;
const HOVER_SPEED = 9;

function MarqueeItem({ listing }: { listing: PetListing }) {
  return (
    <figure className="flex w-[9.5rem] shrink-0 flex-col gap-2 rounded-card border border-cream-300 bg-white/70 p-2 backdrop-blur-sm transition-colors duration-300 hover:border-clay-200 hover:bg-white sm:w-[11rem]">
      <div className="relative aspect-[5/4] overflow-hidden rounded-[0.9rem] bg-cream-200">
        <Image
          src={listing.photoUrl!}
          alt={listing.photoAlt}
          fill
          loading="lazy"
          sizes="176px"
          className="object-cover"
        />
      </div>
      <figcaption className="px-0.5 pb-0.5">
        <p className="text-sm font-bold leading-none text-ink-900">{listing.name}</p>
        <p className="mt-1 truncate text-[0.7rem] text-ink-400">
          {speciesLabel(listing.species)} · {listing.city}
        </p>
      </figcaption>
    </figure>
  );
}

/**
 * Carrusel continuo de publicaciones reales.
 *
 * El desplazamiento lo lleva un MotionValue en vez de una animación CSS:
 * así la velocidad puede bajar de forma progresiva al pasar el puntero
 * (cambiar `animation-duration` en CSS provocaría un salto de posición).
 */
export function PetMarquee() {
  const prefersReducedMotion = useReducedMotion();
  const halfRef = useRef<HTMLDivElement>(null);
  const currentSpeed = useRef(CRUISE_SPEED);
  const [isSlowed, setIsSlowed] = useState(false);
  const x = useMotionValue(0);

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion) return;

    const halfWidth = halfRef.current?.offsetWidth ?? 0;
    if (halfWidth === 0) return;

    const targetSpeed = isSlowed ? HOVER_SPEED : CRUISE_SPEED;
    // Interpolación por tiempo: frena y acelera suave, sin tirones.
    currentSpeed.current += (targetSpeed - currentSpeed.current) * Math.min(1, delta / 260);

    let next = x.get() - (currentSpeed.current * delta) / 1000;
    // Al consumir una mitad, vuelve al origen: el bucle no tiene costura.
    if (next <= -halfWidth) next += halfWidth;
    x.set(next);
  });

  return (
    <div
      className="relative overflow-hidden py-1"
      role="group"
      aria-label={`${MARQUEE_ITEMS.length} mascotas publicadas esta semana`}
      onPointerEnter={() => setIsSlowed(true)}
      onPointerLeave={() => setIsSlowed(false)}
    >
      <motion.div style={{ x }} className="flex w-max">
        {[0, 1].map((half) => (
          <div
            key={half}
            ref={half === 0 ? halfRef : undefined}
            className="flex gap-3 pr-3"
            aria-hidden={half === 1 ? true : undefined}
          >
            {MARQUEE_ITEMS.map((listing) => (
              <MarqueeItem key={`${half}-${listing.id}`} listing={listing} />
            ))}
          </div>
        ))}
      </motion.div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-cream-100 to-transparent sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-cream-100 to-transparent sm:w-28" />
    </div>
  );
}
