import { z } from 'zod';

import { HOME_TYPES } from './adoption-options';

export const ADOPTION_MESSAGE_MIN = 60;
export const ADOPTION_MESSAGE_MAX = 1500;

/**
 * Carta de presentación. Todos los campos son obligatorios: quien adopta
 * no es anónimo, se presenta para que la familia pueda confiar.
 */
export const adoptionRequestSchema = z.object({
  petId: z.string().min(1),
  adopterName: z
    .string()
    .trim()
    .min(2, 'Escribe tu nombre')
    .max(60, 'Máximo 60 caracteres'),
  adopterCity: z
    .string()
    .trim()
    .min(2, 'Cuéntanos en qué distrito vives')
    .max(60, 'Máximo 60 caracteres'),
  homeType: z.enum(HOME_TYPES, { error: 'Elige el tipo de hogar' }),
  message: z
    .string()
    .trim()
    .min(
      ADOPTION_MESSAGE_MIN,
      `Cuéntale un poco más a la familia (mínimo ${ADOPTION_MESSAGE_MIN} caracteres)`,
    )
    .max(ADOPTION_MESSAGE_MAX, `Máximo ${ADOPTION_MESSAGE_MAX} caracteres`),
});

export type AdoptionRequestInput = z.infer<typeof adoptionRequestSchema>;
