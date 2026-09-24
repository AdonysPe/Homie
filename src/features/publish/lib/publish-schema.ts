import { z } from 'zod';

import { speciesHasSize } from '@/lib/pet-catalog';
import { IDEAL_HOMES, PET_SEXES, PET_SIZES, PET_SPECIES, REHOMING_REASONS } from '@/types/pet';
import type { PetPhoto } from '../types';

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_SIZE_MB = 8;
export const SPECIAL_NEEDS_MAX = 200;

const photoSchema = z.custom<PetPhoto>(
  (value) => typeof value === 'object' && value !== null && 'previewUrl' in value,
  { error: 'Foto inválida' },
);

/**
 * Las reglas que cruzan campos corren siempre (`when`), aunque otros pasos
 * todavía estén incompletos: así cada paso valida lo suyo al avanzar.
 */
const always = () => true;

export const publishSchema = z
  .object({
    species: z.enum(PET_SPECIES, { error: 'Elegí el tipo de mascota' }),
    name: z
      .string()
      .trim()
      .min(2, 'Escribí su nombre (mínimo 2 letras)')
      .max(30, 'Máximo 30 caracteres'),

    ageValue: z
      .number({ error: 'Indicá la edad' })
      .min(0, 'La edad no puede ser negativa')
      .max(40, 'Revisá la edad'),
    ageUnit: z.enum(['meses', 'anos']),
    sex: z.enum(PET_SEXES, { error: 'Elegí macho o hembra' }),
    size: z.enum(PET_SIZES).optional(),

    isSterilized: z.boolean(),
    isVaccinated: z.boolean(),
    isDewormed: z.boolean(),
    hasMicrochip: z.boolean(),
    microchipNumber: z.string().trim().optional(),
    specialNeeds: z
      .string()
      .trim()
      .max(SPECIAL_NEEDS_MAX, `Máximo ${SPECIAL_NEEDS_MAX} caracteres`)
      .optional(),
    idealHome: z.enum(IDEAL_HOMES, { error: 'Elegí el entorno ideal' }),
    goodWithKids: z.boolean(),
    goodWithPets: z.boolean(),

    photos: z
      .array(photoSchema)
      .min(1, 'Subí al menos una foto: es lo que más ayuda a que lo adopten')
      .max(MAX_PHOTOS, `Máximo ${MAX_PHOTOS} fotos`),
    description: z.string().trim().max(280, 'Máximo 280 caracteres').optional(),
    reason: z.enum(REHOMING_REASONS, { error: 'Elegí el motivo' }),

    ownerName: z.string().trim().min(2, 'Escribí tu nombre').max(40, 'Máximo 40 caracteres'),
    city: z.string().trim().min(2, 'Escribí tu ciudad').max(60, 'Máximo 60 caracteres'),
    contactMethod: z.enum(['whatsapp', 'email']),
    contactValue: z.string().trim().min(1, 'Necesitamos un contacto'),
    acceptsFollowUp: z
      .boolean()
      .refine((value) => value, 'Necesitamos tu permiso para avisarte de cada interesado'),
    acceptsTerms: z
      .boolean()
      .refine((value) => value, 'Para publicar tenés que aceptar los Términos y la Política de Privacidad'),
  })
  .refine((values) => !values.species || !speciesHasSize(values.species) || Boolean(values.size), {
    path: ['size'],
    message: 'Elegí un tamaño',
    when: always,
  })
  .refine(
    (values) => {
      if (!values.hasMicrochip || !values.microchipNumber) return true;
      const digits = values.microchipNumber.replace(/\s/g, '');
      return /^\d{9,15}$/.test(digits);
    },
    {
      path: ['microchipNumber'],
      message: 'El número de microchip tiene entre 9 y 15 dígitos',
      when: always,
    },
  )
  .refine(
    (values) =>
      values.contactMethod !== 'email' ||
      !values.contactValue ||
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.contactValue.trim()),
    { path: ['contactValue'], message: 'Revisá el email (ej. nombre@correo.com)', when: always },
  )
  .refine(
    (values) => {
      if (values.contactMethod !== 'whatsapp' || !values.contactValue) return true;
      const digits = values.contactValue.replace(/\D/g, '');
      return digits.length >= 8 && digits.length <= 15;
    },
    {
      path: ['contactValue'],
      message: 'Revisá el número de WhatsApp (8 a 15 dígitos)',
      when: always,
    },
  );

export type PublishSchema = z.infer<typeof publishSchema>;
