'use server';

import { randomUUID } from 'node:crypto';

import { and, count, eq, gt } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { after } from 'next/server';

import {
  adoptionRequestSchema,
  type AdoptionRequestInput,
} from '@/features/adoption/lib/adoption-schema';
import { actionError, actionOk, type ActionResult } from '@/lib/action-result';
import { getDb, schema } from '../db';
import { notifyAdoptionDecision, notifyNewRequest } from '../notifications';
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
    .select({ id: pets.id, ownerId: pets.ownerId, status: pets.status, slug: pets.slug, name: pets.name })
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
  // Corre después de responder: un email o push lento nunca debe demorar la confirmación.
  after(() => notifyNewRequest({ ownerId: pet.ownerId, requestId, petName: pet.name, adopterName: values.adopterName }));
  return actionOk({ requestId });
}

/**
 * La familia decide sobre una carta de presentación. Solo se puede resolver
 * una vez: de `pendiente` a `aceptada` o `rechazada`.
 */
export async function respondToAdoptionRequest(
  requestId: string,
  decision: 'aceptada' | 'rechazada',
): Promise<ActionResult> {
  const auth = await requireVerifiedUser();
  if (!auth.ok) return auth;

  const db = await getDb();
  const [request] = await db
    .select({
      id: adoptionRequests.id,
      ownerId: adoptionRequests.ownerId,
      adopterId: adoptionRequests.adopterId,
      status: adoptionRequests.status,
      petName: pets.name,
    })
    .from(adoptionRequests)
    .innerJoin(pets, eq(pets.id, adoptionRequests.petId))
    .where(eq(adoptionRequests.id, requestId))
    .limit(1);

  if (!request || request.ownerId !== auth.user.id) {
    return actionError('No encontramos esta solicitud.', 'forbidden');
  }
  if (request.status !== 'pendiente') {
    return actionError('Esta solicitud ya fue resuelta.', 'invalid');
  }

  await db
    .update(adoptionRequests)
    .set({ status: decision, updatedAt: new Date(), lastActivityAt: new Date() })
    .where(eq(adoptionRequests.id, requestId));

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/mensajes/${requestId}`);
  after(() =>
    notifyAdoptionDecision({ adopterId: request.adopterId, requestId, petName: request.petName, status: decision }),
  );
  return actionOk(null);
}
