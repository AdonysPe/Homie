'use client';

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import Image from 'next/image';
import { useRef, type ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { SEED_LISTINGS } from '@/features/pets/lib/pets-data';
import type { PetListing } from '@/types/pet';

const FEATURED_IDS = ['seed-luna', 'seed-milo', 'seed-nube', 'seed-otto'];

const FEATURED = FEATURED_IDS.map(
  (id) => SEED_LISTINGS.find((listing) => listing.id === id)!,
);

/** Cada pieza ocupa una zona fija del mosaico: entre las cuatro cubren toda la columna. */
const TILE_AREAS = [
  'col-span-3 row-span-4',
  'col-span-2 row-span-3',
  'col-span-2 row-span-3',
  'col-span-3 row-span-2',
];

/** Desplazamientos distintos por pieza: el mosaico respira al hacer scroll. */
const PARALLAX_RANGES = [-26, 14, -16, 22];

interface TileProps {
  listing: PetListing;
  index: number;
  offset: MotionValue<number> | null;
  children?: ReactNode;
}

function PhotoTile({ listing, index, offset, children }: TileProps) {
  return (
    <motion.figure
      style={offset ? { y: offset } : undefined}
      initial={{ opacity: 0, scale: 0.94, y: 26 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative overflow-hidden rounded-panel border-4 border-white bg-cream-200 shadow-lift',
        TILE_AREAS[index],
      )}
    >
      <Image
        src={listing.photoUrl!}
        alt={listing.photoAlt}
        fill
        priority={index === 0}
        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
        className="object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.05]"
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/80 via-ink-900/25 to-transparent p-3 pt-10 text-white">
        {children}
      </figcaption>
    </motion.figure>
  );
}

/**
 * Mostrar antes que contar: cuatro publicaciones reales sostienen el hero
 * y llenan la columna completa, sin huecos.
 */
export function HeroPhotoCluster() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const offsets = [
    useTransform(scrollYProgress, [0, 1], [0, PARALLAX_RANGES[0]]),
    useTransform(scrollYProgress, [0, 1], [0, PARALLAX_RANGES[1]]),
    useTransform(scrollYProgress, [0, 1], [0, PARALLAX_RANGES[2]]),
    useTransform(scrollYProgress, [0, 1], [0, PARALLAX_RANGES[3]]),
  ];

  return (
    <div
      ref={containerRef}
      className="grid h-[17.5rem] grid-cols-5 grid-rows-6 gap-2.5 sm:h-[26rem] sm:gap-3 lg:h-[clamp(26rem,60svh,36rem)]"
    >
      {FEATURED.map((listing, index) => (
        <PhotoTile
          key={listing.id}
          listing={listing}
          index={index}
          offset={prefersReducedMotion ? null : offsets[index]}
        >
          <p className={cn('font-bold leading-tight', index === 0 ? 'text-base' : 'text-sm')}>
            {listing.name}
          </p>
          {index === 0 ? (
            <p className="text-[0.7rem] text-white/85">
              {listing.interestedCount} familias interesadas
            </p>
          ) : null}
        </PhotoTile>
      ))}
    </div>
  );
}
