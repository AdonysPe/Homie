import { z } from 'zod';

export const MESSAGE_MAX = 1000;

/** Mensaje del chat interno posterior a una solicitud. El texto es opcional si va una foto. */
export const chatMessageSchema = z.object({
  requestId: z.string().min(1),
  content: z.string().trim().max(MESSAGE_MAX, `Máximo ${MESSAGE_MAX} caracteres`),
  imageWidth: z.coerce.number().int().min(1).max(4000).optional(),
  imageHeight: z.coerce.number().int().min(1).max(4000).optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
