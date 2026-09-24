import { z } from 'zod';

export const MESSAGE_MAX = 1000;
export const FIRST_MESSAGE_MIN = 30;

const content = z
  .string()
  .trim()
  .min(1, 'Escribí un mensaje')
  .max(MESSAGE_MAX, `Máximo ${MESSAGE_MAX} caracteres`);

/** Primer contacto: quien adopta se presenta con el nombre que elija. */
export const firstMessageSchema = z.object({
  petId: z.string().min(1),
  alias: z
    .string()
    .trim()
    .min(2, 'Escribí tu nombre (o cómo querés que te llamen)')
    .max(40, 'Máximo 40 caracteres'),
  content: content.min(
    FIRST_MESSAGE_MIN,
    `Contale un poco más a la familia (mínimo ${FIRST_MESSAGE_MIN} caracteres)`,
  ),
});

export const replySchema = z.object({
  conversationId: z.string().min(1),
  content,
});

export type FirstMessageInput = z.infer<typeof firstMessageSchema>;
export type ReplyInput = z.infer<typeof replySchema>;
