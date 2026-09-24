import type { IdealHome, PetSex, PetSize, PetSpecies, RehomingReason } from '@/types/pet';
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

/**
 * Sustantivo con artículo y género para frases ("una gata", "un ave").
 * Las especies sin femenino natural en el habla cotidiana quedan en masculino genérico.
 */
const SPECIES_NOUNS: Record<PetSpecies, Record<PetSex, string>> = {
  perro: { macho: 'un perro', hembra: 'una perra' },
  gato: { macho: 'un gato', hembra: 'una gata' },
  conejo: { macho: 'un conejo', hembra: 'una coneja' },
  ave: { macho: 'un ave', hembra: 'un ave' },
  roedor: { macho: 'un roedor', hembra: 'un roedor' },
  reptil: { macho: 'un reptil', hembra: 'un reptil' },
  otro: { macho: 'una mascota', hembra: 'una mascota' },
};

export const speciesNoun = (species: PetSpecies, sex: PetSex): string =>
  SPECIES_NOUNS[species][sex];

export interface SizeOption {
  value: PetSize;
  label: string;
  hint: string;
}

/**
 * El tamaño solo aporta cuando la especie tiene rangos reconocibles.
 * Un "periquito grande" no le dice nada a quien adopta: ahí no se pregunta.
 */
const SIZES_BY_SPECIES: Partial<Record<PetSpecies, SizeOption[]>> = {
  perro: [
    { value: 'pequeno', label: 'Pequeño', hint: 'hasta 10 kg' },
    { value: 'mediano', label: 'Mediano', hint: '10 a 25 kg' },
    { value: 'grande', label: 'Grande', hint: 'más de 25 kg' },
  ],
  gato: [
    { value: 'pequeno', label: 'Pequeño', hint: 'hasta 3,5 kg' },
    { value: 'mediano', label: 'Mediano', hint: '3,5 a 5,5 kg' },
    { value: 'grande', label: 'Grande', hint: 'más de 5,5 kg' },
  ],
  conejo: [
    { value: 'pequeno', label: 'Enano', hint: 'hasta 2 kg' },
    { value: 'mediano', label: 'Mediano', hint: '2 a 4 kg' },
    { value: 'grande', label: 'Gigante', hint: 'más de 4 kg' },
  ],
  reptil: [
    { value: 'pequeno', label: 'Pequeño', hint: 'hasta 30 cm' },
    { value: 'mediano', label: 'Mediano', hint: '30 cm a 1 m' },
    { value: 'grande', label: 'Grande', hint: 'más de 1 m' },
  ],
};

export const sizeOptionsFor = (species: PetSpecies): SizeOption[] | null =>
  SIZES_BY_SPECIES[species] ?? null;

export const speciesHasSize = (species: PetSpecies): boolean => species in SIZES_BY_SPECIES;

export const sizeLabel = (species: PetSpecies, size: PetSize | undefined): string | null => {
  if (!size) return null;
  return sizeOptionsFor(species)?.find((option) => option.value === size)?.label ?? null;
};

export const SEX_OPTIONS: { value: PetSex; label: string }[] = [
  { value: 'macho', label: 'Macho' },
  { value: 'hembra', label: 'Hembra' },
];

export const sexLabel = (sex: PetSex): string =>
  SEX_OPTIONS.find((option) => option.value === sex)?.label ?? '';

export const IDEAL_HOME_OPTIONS: { value: IdealHome; label: string; hint: string }[] = [
  { value: 'casa-con-patio', label: 'Casa con patio', hint: 'Necesita espacio al aire libre' },
  { value: 'departamento', label: 'Departamento', hint: 'Se adapta a espacios chicos' },
  {
    value: 'experiencia-previa',
    label: 'Experiencia previa requerida',
    hint: 'Mejor con alguien que ya tuvo su especie',
  },
];

export const idealHomeLabel = (home: IdealHome): string =>
  IDEAL_HOME_OPTIONS.find((option) => option.value === home)?.label ?? '';

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
