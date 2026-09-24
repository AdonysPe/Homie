'use server';

import { randomUUID } from 'node:crypto';

import { and, count, eq, gt } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import {
  adoptionRequestSchema,
  type AdoptionRequestInput,
} from '@/features/adoption/lib/adoption-schema';
import { actionError, actionOk, type ActionResult } from '@/lib/action-result';
import { getDb, schema } from '../db';
import { requireVerifiedUser } from '../session';

const { adoptionRequests, pets } = schema;

/** Anti-spam: postulaciones por persona en 24 h. */
const REQUESTS_PER_DAY = 10;

/**
 * Crea la carta de presentación de un adoptante.
 *
 * Solo devuelve el id de la solicitud: ni en la respuesta ni en ningún paso
 * posterior el adoptante recibe el email o el teléfono de la familia.
 */
export async function submitAdoptionRequest(
  input: AdoptionRequestInput,
): Promise<ActionResult<{ requestId: string }>> {
  const auth = await requireVerifiedUser();
  if (!auth.ok) return auth;
  const { user } = auth;

  const parsed = adoptionRequestSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0].message, 'invalid');
  const values = parsed.data;

  const db = await getDb();
  const [pet] = await db
    .select({ id: pets.id, ownerId: pets.ownerId, status: pets.status, slug: pets.slug })
    .from(pets)
    .where(eq(pets.id, values.petId))
    .limit(1);

  if (!pet) return actionError('Esta publicación ya no existe.', 'invalid');
  if (pet.ownerId === user.id) {
    return actionError('No puedes postularte para tu propia mascota.', 'forbidden');
  }
  if (pet.status !== 'publicada') {
    return actionError('Esta publicación no está recibiendo solicitudes en este momento.', 'forbidden');
  }

  const [recent] = await db
    .select({ value: count() })
    .from(adoptionRequests)
    .where(
      and(
        eq(adoptionRequests.adopterId, user.id),
        gt(adoptionRequests.createdAt, new Date(Date.now() - 86_400_000)),
      ),
    );
  if ((recent?.value ?? 0) >= REQUESTS_PER_DAY) {
    return actionError('Enviaste muchas solicitudes hoy. Prueba de nuevo mañana.', 'rate-limited');
  }

  const requestId = randomUUID();
  const inserted = await db
    .insert(adoptionRequests)
    .values({
      id: requestId,
      petId: pet.id,
      ownerId: pet.ownerId,
      adopterId: user.id,
      adopterName: values.adopterName,
      adopterCity: values.adopterCity,
      homeType: values.homeType,
      message: values.message,
    })
    // Índice único (mascota, adoptante): una sola postulación por persona.
    .onConflictDoNothing()
    .returning({ id: adoptionRequests.id });

  if (inserted.length === 0) {
    return actionError('Ya te postulaste para esta mascota. Sigue la conversación desde tu panel.', 'invalid');
  }

  revalidatePath('/dashboard');
  revalidatePath(`/mascota/${pet.slug}`);
  return actionOk({ requestId });
}
