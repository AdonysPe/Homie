'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { SpeciesIcon } from '@/components/icons';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { sizeLabel, speciesLabel } from '@/lib/pet-catalog';
import type { PetListing } from '@/types/pet';
import { useRelativeTime } from '../hooks/useRelativeTime';
import { statusPresentation } from '../lib/listing-status';

interface PetCardProps {
  listing: PetListing;
  /** Resalta la publicación recién creada por el usuario. */
  isHighlighted?: boolean;
  priority?: boolean;
}

export function PetCard({ listing, isHighlighted = false, priority = false }: PetCardProps) {
  const status = statusPresentation(listing.status);
  const publishedLabel = useRelativeTime(listing.publishedAt);
  const isLocalPreview = listing.photoUrl?.startsWith('blob:') ?? false;

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative overflow-hidden rounded-panel border bg-white shadow-soft transition-shadow duration-300 hover:shadow-lift',
        isHighlighted ? 'border-clay-400 ring-2 ring-clay-300' : 'border-cream-300',
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream-200">
        {listing.photoUrl ? (
          isLocalPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.photoUrl}
              alt={listing.photoAlt}
              className="h-full w-full object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.04]"
            />
          ) : (
            <Image
              src={listing.photoUrl}
              alt={listing.photoAlt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              className="object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.04]"
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center text-cream-400">
            <SpeciesIcon species={listing.species} size={56} />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-900/70 to-transparent" />

        <div className="absolute left-3 top-3">
          <Badge tone={status.tone} className="backdrop-blur-sm">
            {status.label}
          </Badge>
        </div>

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-white">
          <div>
            <h3 className="text-lg font-bold leading-tight">{listing.name}</h3>
            <p className="text-xs text-white/85">
              {listing.ageLabel} · {listing.city}
            </p>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-clay-600">
            <SpeciesIcon species={listing.species} size={18} />
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3.5">
        <p className="line-clamp-2 text-sm leading-snug text-ink-700">{listing.highlight}</p>
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-xs text-ink-400">
          <span>
            {speciesLabel(listing.species)} · {sizeLabel(listing.size)}
            {listing.interestedCount > 0
              ? ` · ${listing.interestedCount} ${listing.interestedCount === 1 ? 'interesado' : 'interesados'}`
              : ''}
          </span>
          {publishedLabel ? <time dateTime={listing.publishedAt}>{publishedLabel}</time> : null}
        </div>
      </div>
    </motion.article>
  );
}
