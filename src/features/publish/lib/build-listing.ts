import { createId, formatAge } from '@/lib/format';
import type { PetListing } from '@/types/pet';
import type { PublishFormValues } from '../types';

function buildHighlight(values: PublishFormValues): string {
  if (values.description && values.description.length > 0) {
    return values.description.length > 60
      ? `${values.description.slice(0, 57).trimEnd()}…`
      : values.description;
  }
  if (values.goodWithKids) return 'Se lleva bien con chicos';
  if (values.goodWithPets) return 'Convive con otras mascotas';
  if (values.isVaccinated) return 'Vacunas al día';
  return 'Busca un nuevo hogar';
}

/**
 * Traduce lo que el dueño completó a la tarjeta pública que verá la gente.
 * `id` se puede fijar para la vista previa en vivo (evita remontar la tarjeta en cada tecla).
 */
export function buildListingFromForm(values: PublishFormValues, id?: string): PetListing {
  const [mainPhoto] = values.photos;

  return {
    id: id ?? createId('nuevo'),
    name: values.name.trim(),
    species: values.species,
    ageLabel: formatAge(values.ageValue, values.ageUnit),
    size: values.size,
    city: values.city.trim(),
    photoUrl: mainPhoto?.previewUrl ?? null,
    photoAlt: `${values.name.trim()}, ${values.species}, foto subida por su familia`,
    highlight: buildHighlight(values),
    status: 'en-revision',
    interestedCount: 0,
    publishedAt: new Date().toISOString(),
  };
}
