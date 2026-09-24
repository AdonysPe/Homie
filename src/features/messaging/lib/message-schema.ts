import { z } from 'zod';

export const MESSAGE_MAX = 1000;

/** Mensaje del chat interno posterior a una solicitud de adopción. */
export const replySchema = z.object({
  requestId: z.string().min(1),
  content: z
    .string()
    .trim()
    .min(1, 'Escribí un mensaje')
    .max(MESSAGE_MAX, `Máximo ${MESSAGE_MAX} caracteres`),
});

export type ReplyInput = z.infer<typeof replySchema>;
