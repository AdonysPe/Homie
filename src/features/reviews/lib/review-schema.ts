import { z } from 'zod';

import { RATING_MAX, RATING_MIN } from './review-rules';

export const REVIEW_COMMENT_MAX = 600;

export const reviewSchema = z.object({
  requestId: z.string().min(1),
  rating: z.coerce.number().int().min(RATING_MIN).max(RATING_MAX),
  comment: z
    .string()
    .trim()
    .min(1, 'Cuéntanos cómo te fue.')
    .max(REVIEW_COMMENT_MAX, `Máximo ${REVIEW_COMMENT_MAX} caracteres`),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
