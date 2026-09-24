import { speciesHasSize, speciesLabel } from '@/lib/pet-catalog';
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
 *
 * Nunca copia datos privados: ni el contacto, ni el motivo, ni el número de microchip.
 */
export function buildListingFromForm(values: PublishFormValues, id?: string): PetListing {
  const [mainPhoto, ...extraPhotos] = values.photos;
  const name = values.name.trim();
  const altBase = `${name}, ${speciesLabel(values.species).toLowerCase()}`;

  return {
    id: id ?? createId('nuevo'),
    name,
    species: values.species,
    sex: values.sex,
    ageLabel: formatAge(values.ageValue, values.ageUnit),
    size: speciesHasSize(values.species) ? values.size : undefined,
    city: values.city.trim(),
    photoUrl: mainPhoto?.previewUrl ?? null,
    photoAlt: `${altBase}, foto principal subida por su familia`,
    gallery: extraPhotos.map((photo, index) => ({
      url: photo.previewUrl,
      alt: `${altBase}, foto ${index + 2} subida por su familia`,
    })),
    highlight: buildHighlight(values),
    description: values.description?.trim() || undefined,
    health: {
      sterilized: values.isSterilized,
      vaccinated: values.isVaccinated,
      dewormed: values.isDewormed,
      microchip: values.hasMicrochip,
    },
    specialNeeds: values.specialNeeds?.trim() || undefined,
    idealHome: values.idealHome,
    goodWithKids: values.goodWithKids,
    goodWithPets: values.goodWithPets,
    status: 'en-revision',
    interestedCount: 0,
    publishedAt: new Date().toISOString(),
  };
}
