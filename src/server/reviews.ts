import 'server-only';

import { and, eq } from 'drizzle-orm';

import type { RequestStatus } from '@/features/adoption/lib/adoption-options';
import { getDb, schema } from './db';

const { adoptionRequests, pets, reviews } = schema;

export interface ReviewContext {
  petId: string;
  petName: string;
  status: RequestStatus;
  counterpartId: string;
  myReview: { rating: number; comment: string } | null;
}

/** Autorización + estado para calificar: solo participantes, y solo una vez cada uno. */
export async function getReviewContext(requestId: string, userId: string): Promise<ReviewContext | null> {
  const db = await getDb();
  const [row] = await db
    .select({
      ownerId: adoptionRequests.ownerId,
      adopterId: adoptionRequests.adopterId,
      status: adoptionRequests.status,
      petId: pets.id,
      petName: pets.name,
    })
    .from(adoptionRequests)
    .innerJoin(pets, eq(pets.id, adoptionRequests.petId))
    .where(eq(adoptionRequests.id, requestId))
    .limit(1);

  if (!row || (row.ownerId !== userId && row.adopterId !== userId)) return null;
  const counterpartId = row.ownerId === userId ? row.adopterId : row.ownerId;

  const [myReview] = await db
    .select({ rating: reviews.rating, comment: reviews.comment })
    .from(reviews)
    .where(and(eq(reviews.requestId, requestId), eq(reviews.reviewerId, userId)))
    .limit(1);

  return { petId: row.petId, petName: row.petName, status: row.status, counterpartId, myReview: myReview ?? null };
}
