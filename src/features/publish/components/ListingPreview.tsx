'use client';

import type { UseFormReturn } from 'react-hook-form';

import { PetCard } from '@/features/pets/components/PetCard';
import { buildListingFromForm } from '../lib/build-listing';
import type { PublishFormValues } from '../types';

/**
 * Vista previa en vivo: el dueño ve exactamente lo que verán los adoptantes.
 * Se oculta en mobile para no competir con el formulario.
 */
export function ListingPreview({ form }: { form: UseFormReturn<PublishFormValues> }) {
  const values = form.watch();
  const listing = buildListingFromForm(
    { ...values, name: values.name?.trim() || 'Su nombre' },
    'preview',
  );

  return (
    <aside className="hidden lg:block lg:sticky lg:top-24">
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
        Así se va a ver
      </p>
      <PetCard listing={{ ...listing, city: listing.city || 'Tu distrito' }} />
      <p className="mt-3 text-xs leading-relaxed text-ink-400">
        Tu teléfono y tu email nunca aparecen en la tarjeta.
      </p>
    </aside>
  );
}
