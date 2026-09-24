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

/** Campos del formulario salvo las fotos (que al servidor llegan como archivos). */
const publishFields = z.object({
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
});

type PublishRuleFields = z.infer<typeof publishFields>;

/** Reglas que cruzan campos, compartidas por el esquema del cliente y el del servidor. */
function publishRules(values: PublishRuleFields, ctx: z.RefinementCtx) {
  if (values.species && speciesHasSize(values.species) && !values.size) {
    ctx.addIssue({ code: 'custom', path: ['size'], message: 'Elegí un tamaño' });
  }

  if (values.hasMicrochip && values.microchipNumber) {
    const digits = values.microchipNumber.replace(/\s/g, '');
    if (!/^\d{9,15}$/.test(digits)) {
      ctx.addIssue({
        code: 'custom',
        path: ['microchipNumber'],
        message: 'El número de microchip tiene entre 9 y 15 dígitos',
      });
    }
  }

  if (!values.contactValue) return;
  if (values.contactMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.contactValue.trim())) {
    ctx.addIssue({ code: 'custom', path: ['contactValue'], message: 'Revisá el email (ej. nombre@correo.com)' });
  }
  if (values.contactMethod === 'whatsapp') {
    const digits = values.contactValue.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) {
      ctx.addIssue({
        code: 'custom',
        path: ['contactValue'],
        message: 'Revisá el número de WhatsApp (8 a 15 dígitos)',
      });
    }
  }
}

/** Esquema del formulario (navegador): incluye las fotos locales. */
export const publishSchema = publishFields
  .extend({
    photos: z
      .array(photoSchema)
      .min(1, 'Subí al menos una foto: es lo que más ayuda a que lo adopten')
      .max(MAX_PHOTOS, `Máximo ${MAX_PHOTOS} fotos`),
  })
  .superRefine(publishRules, { when: always });

/** Esquema del servidor: los mismos campos y reglas; las fotos se validan aparte. */
export const publishPayloadSchema = publishFields.superRefine(publishRules, { when: always });

export type PublishPayload = z.infer<typeof publishPayloadSchema>;
