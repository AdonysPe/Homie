import type { PetSex, PetSize, PetSpecies, RehomingReason } from '@/types/pet';
import { PET_SPECIES } from '@/types/pet';

export interface SpeciesOption {
  value: PetSpecies;
  label: string;
  plural: string;
}

const SPECIES_LABELS: Record<PetSpecies, { label: string; plural: string }> = {
  perro: { label: 'Perro', plural: 'Perros' },
  gato: { label: 'Gato', plural: 'Gatos' },
  conejo: { label: 'Conejo', plural: 'Conejos' },
  ave: { label: 'Ave', plural: 'Aves' },
  roedor: { label: 'Roedor', plural: 'Roedores' },
  reptil: { label: 'Reptil', plural: 'Reptiles' },
  otro: { label: 'Otro', plural: 'Otros' },
};

export const SPECIES_OPTIONS: SpeciesOption[] = PET_SPECIES.map((value) => ({
  value,
  ...SPECIES_LABELS[value],
}));

export const speciesLabel = (species: PetSpecies): string => SPECIES_LABELS[species].label;
export const speciesPlural = (species: PetSpecies): string => SPECIES_LABELS[species].plural;

export const SIZE_OPTIONS: { value: PetSize; label: string; hint: string }[] = [
  { value: 'pequeno', label: 'Pequeño', hint: 'hasta 10 kg' },
  { value: 'mediano', label: 'Mediano', hint: '10 a 25 kg' },
  { value: 'grande', label: 'Grande', hint: 'más de 25 kg' },
];

export const SEX_OPTIONS: { value: PetSex; label: string }[] = [
  { value: 'hembra', label: 'Hembra' },
  { value: 'macho', label: 'Macho' },
  { value: 'no-se', label: 'No lo sé' },
];

export const REASON_OPTIONS: { value: RehomingReason; label: string }[] = [
  { value: 'mudanza', label: 'Me mudo' },
  { value: 'alergia', label: 'Alergias en casa' },
  { value: 'tiempo', label: 'Ya no tengo tiempo' },
  { value: 'economia', label: 'Situación económica' },
  { value: 'salud', label: 'Motivos de salud' },
  { value: 'camada', label: 'Nació una camada' },
  { value: 'convivencia', label: 'No se lleva con otros' },
  { value: 'otro', label: 'Otro motivo' },
];

export const sizeLabel = (size: PetSize): string =>
  SIZE_OPTIONS.find((option) => option.value === size)?.label ?? '';
