export const PET_SPECIES = ['perro', 'gato', 'conejo', 'ave', 'roedor', 'reptil', 'otro'] as const;
export type PetSpecies = (typeof PET_SPECIES)[number];

export const PET_SIZES = ['pequeno', 'mediano', 'grande'] as const;
export type PetSize = (typeof PET_SIZES)[number];

export const PET_SEXES = ['hembra', 'macho', 'no-se'] as const;
export type PetSex = (typeof PET_SEXES)[number];

export const REHOMING_REASONS = [
  'mudanza',
  'alergia',
  'tiempo',
  'economia',
  'salud',
  'camada',
  'convivencia',
  'otro',
] as const;
export type RehomingReason = (typeof REHOMING_REASONS)[number];

export type ListingStatus = 'en-revision' | 'publicada' | 'con-interesados' | 'adoptada';

/** Una publicación tal como se muestra en la galería pública. */
export interface PetListing {
  id: string;
  name: string;
  species: PetSpecies;
  ageLabel: string;
  size: PetSize;
  city: string;
  photoUrl: string | null;
  /** Descripción alt para lectores de pantalla: siempre concreta, nunca "foto de mascota". */
  photoAlt: string;
  highlight: string;
  status: ListingStatus;
  interestedCount: number;
  publishedAt: string;
}
