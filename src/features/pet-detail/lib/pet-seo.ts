import type { Metadata } from 'next';

import { ogImageFor } from '@/features/pets/lib/pets-data';
import { speciesLabel, speciesNoun } from '@/lib/pet-catalog';
import { SITE } from '@/lib/site';
import type { PetListing } from '@/types/pet';

export const petPath = (pet: PetListing): string => `/mascota/${pet.slug}`;

/** "Adoptar a Luna - Perro en Córdoba" (el layout agrega "| Homie"). */
export const petTitle = (pet: PetListing): string =>
  `Adoptar a ${pet.name} - ${speciesLabel(pet.species)} en ${pet.city}`;

export const petDescription = (pet: PetListing): string =>
  `Conoce a ${pet.name}, ${speciesNoun(pet.species, pet.sex)} de ${pet.ageLabel} que busca un hogar responsable en ${pet.city}. Publicación directa, sin intermediarios. Entra a ${SITE.name}.`;

export function buildPetMetadata(pet: PetListing): Metadata {
  const title = petTitle(pet);
  const description = petDescription(pet);
  const url = petPath(pet);
  // Las fotos de Unsplash se recortan a 1200×630; las subidas se usan tal cual (1600 px máx.).
  const isUnsplash = pet.photoUrl?.startsWith('https://images.unsplash.com') ?? false;
  const images = pet.photoUrl
    ? [
        isUnsplash
          ? { url: ogImageFor(pet.photoUrl), width: 1200, height: 630, alt: pet.photoAlt }
          : { url: pet.photoUrl, alt: pet.photoAlt },
      ]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      // og:title no pasa por el template del layout: se completa a mano.
      title: `${title} | ${SITE.name}`,
      description,
      url,
      type: 'website',
      siteName: SITE.name,
      locale: SITE.locale,
      images,
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title: `${title} | ${SITE.name}`,
      description,
      images: images?.map((image) => image.url),
    },
  };
}
