'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

import { useListingsStore } from '../store/listings-store';
import { usePetFilter } from '../hooks/usePetFilter';
import { PetCard } from './PetCard';
import { PetFilterBar } from './PetFilterBar';

export function PetGallery() {
  const listings = useListingsStore((state) => state.listings);
  const justPublishedId = useListingsStore((state) => state.justPublishedId);
  const clearHighlight = useListingsStore((state) => state.clearHighlight);
  const { activeFilter, setActiveFilter, options, filteredListings } = usePetFilter(listings);

  useEffect(() => {
    if (!justPublishedId) return;
    const timeout = setTimeout(clearHighlight, 6000);
    return () => clearTimeout(timeout);
  }, [clearHighlight, justPublishedId]);

  return (
    <div className="flex flex-col gap-6">
      <PetFilterBar options={options} activeFilter={activeFilter} onChange={setActiveFilter} />

      <motion.ul
        layout
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {filteredListings.map((listing, index) => (
            <motion.li
              key={listing.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              viewport={{ once: true, margin: '-8% 0px -4% 0px' }}
              transition={{
                duration: 0.45,
                // El escalonado se corta a la cuarta tarjeta: más allá se siente lento.
                delay: Math.min(index, 3) * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <PetCard
                listing={listing}
                isHighlighted={listing.id === justPublishedId}
                priority={index < 2}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
