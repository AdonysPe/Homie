'use client';

import { useMemo, useState } from 'react';

import type { PetListing, PetSpecies } from '@/types/pet';

export type SpeciesFilter = PetSpecies | 'todas';

interface FilterOption {
  value: SpeciesFilter;
  count: number;
}

/** Filtra por especie y calcula cuántas publicaciones hay de cada una. */
export function usePetFilter(listings: PetListing[]) {
  const [activeFilter, setActiveFilter] = useState<SpeciesFilter>('todas');

  const options = useMemo<FilterOption[]>(() => {
    const counts = new Map<PetSpecies, number>();
    for (const listing of listings) {
      counts.set(listing.species, (counts.get(listing.species) ?? 0) + 1);
    }

    return [
      { value: 'todas' as SpeciesFilter, count: listings.length },
      ...Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([species, count]) => ({ value: species as SpeciesFilter, count })),
    ];
  }, [listings]);

  const filteredListings = useMemo(
    () =>
      activeFilter === 'todas'
        ? listings
        : listings.filter((listing) => listing.species === activeFilter),
    [activeFilter, listings],
  );

  return { activeFilter, setActiveFilter, options, filteredListings };
}
