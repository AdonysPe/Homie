import type { IdealHome, PetSex, PetSize, PetSpecies, RehomingReason } from '@/types/pet';

/** Foto ya cargada en el navegador, con su URL de preview lista para revocar. */
export interface PetPhoto {
  id: string;
  file: File;
  previewUrl: string;
  fileName: string;
}

export interface PublishFormValues {
  species: PetSpecies;
  name: string;

  ageValue: number;
  ageUnit: 'meses' | 'anos';
  sex: PetSex;
  /** Solo se pide (y se valida) para especies con escala de tamaño. */
  size?: PetSize;

  isSterilized: boolean;
  isVaccinated: boolean;
  isDewormed: boolean;
  hasMicrochip: boolean;
  /** Privado: nunca se publica, solo lo recibe la familia adoptante. */
  microchipNumber?: string;
  specialNeeds?: string;
  idealHome: IdealHome;
  goodWithKids: boolean;
  goodWithPets: boolean;

  photos: PetPhoto[];
  description?: string;
  reason: RehomingReason;

  ownerName: string;
  city: string;
  contactMethod: 'whatsapp' | 'email';
  contactValue: string;
  acceptsFollowUp: boolean;
  acceptsTerms: boolean;
}

export type PublishFieldName = keyof PublishFormValues;
