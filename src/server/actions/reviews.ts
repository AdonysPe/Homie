'use server';

import { randomUUID } from 'node:crypto';

import { revalidatePath } from 'next/cache';
import { after } from 'next/server';

import { reviewSchema, type ReviewInput } from '@/features/reviews/lib/review-schema';
import { actionError, actionOk, type ActionResult } from '@/lib/action-result';
import { getDb, schema } from '../db';
import { notifyReviewReceived } from '../notifications';
import { getReviewContext } from '../reviews';
import { requireVerifiedUser } from '../session';

const { reviews } = schema;

/**
 * Califica a la otra parte de una adopción ya `completada`: una vez por
 * persona (índice único (solicitud, quien califica)).
 */
export async function submitReview(input: ReviewInput): Promise<ActionResult> {
  const auth = await requireVerifiedUser();
  if (!auth.ok) return auth;

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0].message, 'invalid');
  const { requestId, rating, comment } = parsed.data;

  const context = await getReviewContext(requestId, auth.user.id);
  if (!context) return actionError('No encontramos esta solicitud.', 'forbidden');
  if (context.status !== 'completada') {
    return actionError('Primero confirmen entre los dos que la adopción se completó.', 'invalid');
  }
  if (context.myReview) return actionError('Ya calificaste esta adopción.', 'invalid');

  const db = await getDb();
  const inserted = await db
    .insert(reviews)
    .values({
      id: randomUUID(),
      requestId,
      petId: context.petId,
      reviewerId: auth.user.id,
      revieweeId: context.counterpartId,
      rating,
      comment,
    })
    .onConflictDoNothing()
    .returning({ id: reviews.id });

  if (inserted.length === 0) return actionError('Ya calificaste esta adopción.', 'invalid');

  revalidatePath(`/dashboard/mensajes/${requestId}`);
  revalidatePath(`/perfil/${context.counterpartId}`);
  after(() => notifyReviewReceived({ userId: context.counterpartId, rating }));
  return actionOk(null);
}
