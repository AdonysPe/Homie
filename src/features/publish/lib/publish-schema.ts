import { z } from 'zod';

import { PET_SEXES, PET_SIZES, PET_SPECIES, REHOMING_REASONS } from '@/types/pet';
import type { PetPhoto } from '../types';

export const MAX_PHOTOS = 6;
export const MAX_PHOTO_SIZE_MB = 8;

const photoSchema = z.custom<PetPhoto>(
  (value) => typeof value === 'object' && value !== null && 'previewUrl' in value,
  { error: 'Foto inválida' },
);

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
    size: z.enum(PET_SIZES, { error: 'Elegí un tamaño' }),
    sex: z.enum(PET_SEXES, { error: 'Elegí una opción' }),
    isSterilized: z.boolean(),
    isVaccinated: z.boolean(),
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
      .refine((value) => value, 'Necesitamos tu permiso para contactarte'),
  })
  .superRefine((values, ctx) => {
    if (values.contactMethod === 'email') {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.contactValue);
      if (!isEmail) {
        ctx.addIssue({
          code: 'custom',
          path: ['contactValue'],
          message: 'Revisá el email (ej. nombre@correo.com)',
        });
      }
      return;
    }

    const digits = values.contactValue.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) {
      ctx.addIssue({
        code: 'custom',
        path: ['contactValue'],
        message: 'Revisá el número de WhatsApp (8 a 15 dígitos)',
      });
    }
  });

export type PublishSchema = z.infer<typeof publishSchema>;
