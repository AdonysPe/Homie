export const PET_SPECIES = ['perro', 'gato', 'conejo', 'ave', 'roedor', 'reptil', 'otro'] as const;
export type PetSpecies = (typeof PET_SPECIES)[number];

export const PET_SIZES = ['pequeno', 'mediano', 'grande'] as const;
export type PetSize = (typeof PET_SIZES)[number];

export const PET_SEXES = ['macho', 'hembra'] as const;
export type PetSex = (typeof PET_SEXES)[number];

export const IDEAL_HOMES = ['casa-con-patio', 'departamento', 'experiencia-previa'] as const;
export type IdealHome = (typeof IDEAL_HOMES)[number];

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

/** Estado guardado en la base de datos. */
export const PET_STATUSES = ['publicada', 'en-revision', 'pausada', 'adoptada'] as const;
export type PetStatus = (typeof PET_STATUSES)[number];

/** Estado que se muestra: "con interesados" se deriva de una publicación activa con consultas. */
export type ListingStatus = PetStatus | 'con-interesados';

export interface PetHealth {
  sterilized: boolean;
  vaccinated: boolean;
  dewormed: boolean;
  microchip: boolean;
}

export interface PetPhotoRef {
  url: string;
  /** Descripción alt para lectores de pantalla: siempre concreta, nunca "foto de mascota". */
  alt: string;
}

/** Una publicación tal como se muestra en la galería pública. */
export interface PetListing {
  id: string;
  /**
   * Solo existe cuando la publicación tiene página pública (`/mascota/[slug]`).
   * Las recién creadas quedan en revisión y todavía no la tienen.
   */
  slug?: string;
  name: string;
  species: PetSpecies;
  sex: PetSex;
  ageLabel: string;
  /** Las especies sin escala de tamaño (aves, roedores…) no lo informan. */
  size?: PetSize;
  city: string;
  photoUrl: string | null;
  /** Descripción alt para lectores de pantalla: siempre concreta, nunca "foto de mascota". */
  photoAlt: string;
  /** Fotos adicionales, después de la principal. */
  gallery?: PetPhotoRef[];
  highlight: string;
  description?: string;
  health: PetHealth;
  specialNeeds?: string;
  idealHome: IdealHome;
  goodWithKids: boolean;
  goodWithPets: boolean;
  status: ListingStatus;
  interestedCount: number;
  publishedAt: string;
  /** La familia que publica confirmó su email. */
  ownerVerified?: boolean;
}
