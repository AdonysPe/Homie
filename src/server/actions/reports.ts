'use server';

import { randomUUID } from 'node:crypto';

import { and, countDistinct, eq, isNotNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { AUTO_REVIEW_THRESHOLD } from '@/features/reports/lib/report-reasons';
import { reportSchema, type ReportInput } from '@/features/reports/lib/report-schema';
import { actionError, actionOk, type ActionResult } from '@/lib/action-result';
import { getDb, schema } from '../db';
import { getCurrentUser } from '../session';

const { pets, reports, user: users } = schema;

/**
 * Reportar no exige cuenta. Con cuenta, un reporte por persona y mascota;
 * y solo los de cuentas verificadas cuentan para pasar la publicación a revisión.
 */
export async function reportPet(input: ReportInput): Promise<ActionResult<{ underReview: boolean }>> {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0].message, 'invalid');
  const { petId, reason, details } = parsed.data;

  const user = await getCurrentUser();
  const db = await getDb();

  const [pet] = await db
    .select({ id: pets.id, ownerId: pets.ownerId, slug: pets.slug, status: pets.status })
    .from(pets)
    .where(eq(pets.id, petId))
    .limit(1);

  if (!pet) return actionError('Esta publicación ya no existe.', 'invalid');
  if (user && pet.ownerId === user.id) {
    return actionError('No puedes reportar tu propia publicación.', 'forbidden');
  }

  const inserted = await db
    .insert(reports)
    .values({
      id: randomUUID(),
      petId,
      reporterId: user?.id ?? null,
      reason,
      details: details || null,
    })
    .onConflictDoNothing()
    .returning({ id: reports.id });

  // Ya había reportado: respondemos igual que la primera vez, sin duplicar.
  if (inserted.length === 0) return actionOk({ underReview: pet.status === 'en-revision' });

  const underReview = await applyAutoReview(pet.id, pet.status);
  if (underReview) {
    revalidatePath('/');
    revalidatePath(`/mascota/${pet.slug}`);
  }

  return actionOk({ underReview });
}

/**
 * Si una publicación activa acumula AUTO_REVIEW_THRESHOLD reportes pendientes
 * de personas distintas con email verificado, pasa a "En revisión" y deja de listarse.
 */
async function applyAutoReview(petId: string, currentStatus: string): Promise<boolean> {
  if (currentStatus === 'en-revision') return true;
  if (currentStatus !== 'publicada') return false;

  const db = await getDb();
  const [row] = await db
    .select({ value: countDistinct(reports.reporterId) })
    .from(reports)
    .innerJoin(users, eq(users.id, reports.reporterId))
    .where(
      and(
        eq(reports.petId, petId),
        eq(reports.status, 'pendiente'),
        isNotNull(reports.reporterId),
        eq(users.emailVerified, true),
      ),
    );

  if ((row?.value ?? 0) < AUTO_REVIEW_THRESHOLD) return false;

  await db
    .update(pets)
    .set({ status: 'en-revision', updatedAt: new Date() })
    .where(and(eq(pets.id, petId), eq(pets.status, 'publicada')));
  return true;
}
