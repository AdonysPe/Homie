'use client';

import { create } from 'zustand';

import type { PetListing } from '@/types/pet';
import { SEED_LISTINGS } from '../lib/pets-data';

interface ListingsState {
  listings: PetListing[];
  /** Id de la publicación recién creada, para resaltarla en la galería. */
  justPublishedId: string | null;
  addListing: (listing: PetListing) => void;
  clearHighlight: () => void;
}

/**
 * Único estado global de la app: es el puente entre el formulario
 * (feature publish) y la galería (feature pets).
 */
export const useListingsStore = create<ListingsState>((set) => ({
  listings: SEED_LISTINGS,
  justPublishedId: null,
  addListing: (listing) =>
    set((state) => ({
      listings: [listing, ...state.listings],
      justPublishedId: listing.id,
    })),
  clearHighlight: () => set({ justPublishedId: null }),
}));
