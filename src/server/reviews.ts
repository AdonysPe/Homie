import 'server-only';

import { and, desc, eq } from 'drizzle-orm';

import type { RequestStatus } from '@/features/adoption/lib/adoption-options';
import { isTrustedUser } from '@/features/reviews/lib/review-rules';
import { getDb, schema } from './db';

const { adoptionRequests, pets, reviews, user } = schema;

export interface RatingSummary {
  average: number | null;
  count: number;
  isTrusted: boolean;
}

export interface PublicProfile {
  rating: RatingSummary;
  reviews: Array<{ id: string; rating: number; comment: string; createdAt: Date }>;
}

/** Resumen público de reputación, sin exponer identidad de quienes reseñan. */
export async function getRatingSummary(userId: string): Promise<RatingSummary> {
  const db = await getDb();
  const rows = await db
    .select({ rating: reviews.rating })
    .from(reviews)
    .where(eq(reviews.revieweeId, userId));

  const count = rows.length;
  const average = count > 0 ? rows.reduce((sum, row) => sum + row.rating, 0) / count : null;

  return {
    average,
    count,
    isTrusted: average !== null && isTrustedUser(count, average),
  };
}

/** Perfil público: reseñas anónimas y reputación, sin datos de cuenta. */
export async function getPublicProfile(userId: string): Promise<PublicProfile | null> {
  const db = await getDb();
  const [account] = await db.select({ id: user.id }).from(user).where(eq(user.id, userId)).limit(1);
  if (!account) return null;

  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.revieweeId, userId))
    .orderBy(desc(reviews.createdAt));

  const count = rows.length;
  const average = count > 0 ? rows.reduce((sum, row) => sum + row.rating, 0) / count : null;

  return {
    rating: {
      average,
      count,
      isTrusted: average !== null && isTrustedUser(count, average),
    },
    reviews: rows,
  };
}

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
