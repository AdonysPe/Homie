import type { PetSex, PetSize, PetSpecies, RehomingReason } from '@/types/pet';

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
  size: PetSize;
  sex: PetSex;
  isSterilized: boolean;
  isVaccinated: boolean;
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
}

export type PublishFieldName = keyof PublishFormValues;
