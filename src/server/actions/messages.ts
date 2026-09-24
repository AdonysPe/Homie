'use server';

import { randomUUID } from 'node:crypto';

import { and, count, eq, gt, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { replySchema, type ReplyInput } from '@/features/messaging/lib/message-schema';
import { actionError, actionOk, type ActionResult } from '@/lib/action-result';
import { getDb, schema } from '../db';
import { requireVerifiedUser } from '../session';

const { adoptionRequests, messages } = schema;

/** Anti-spam simple: mensajes por usuario por hora. */
const MESSAGES_PER_HOUR = 30;

async function isRateLimited(userId: string): Promise<boolean> {
  const db = await getDb();
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const [row] = await db
    .select({ value: count() })
    .from(messages)
    .where(and(eq(messages.senderId, userId), gt(messages.createdAt, since)));
  return (row?.value ?? 0) >= MESSAGES_PER_HOUR;
}

/** Mensaje en el chat de una solicitud (familia o adoptante). */
export async function sendReply(input: ReplyInput): Promise<ActionResult<{ id: string; createdAt: string }>> {
  const auth = await requireVerifiedUser();
  if (!auth.ok) return auth;
  const { user } = auth;

  const parsed = replySchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0].message, 'invalid');
  const { requestId, content } = parsed.data;

  const db = await getDb();
  const [request] = await db
    .select({ id: adoptionRequests.id, ownerId: adoptionRequests.ownerId, adopterId: adoptionRequests.adopterId })
    .from(adoptionRequests)
    .where(eq(adoptionRequests.id, requestId))
    .limit(1);

  const isParticipant = request && (request.ownerId === user.id || request.adopterId === user.id);
  if (!isParticipant) return actionError('No encontramos esta solicitud.', 'forbidden');
  if (await isRateLimited(user.id)) {
    return actionError('Enviaste muchos mensajes en poco tiempo. Prueba de nuevo en un rato.', 'rate-limited');
  }

  const now = new Date();
  const id = randomUUID();
  const receiverId = request.ownerId === user.id ? request.adopterId : request.ownerId;

  await db.transaction(async (tx) => {
    await tx.insert(messages).values({ id, requestId, senderId: user.id, receiverId, content, createdAt: now });
    await tx
      .update(adoptionRequests)
      .set({ lastActivityAt: now, updatedAt: now })
      .where(eq(adoptionRequests.id, requestId));
  });

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/mensajes/${requestId}`);
  return actionOk({ id, createdAt: now.toISOString() });
}

/** Marca como leído lo recibido en una solicitud (y la carta, si la abre la familia). */
export async function markRequestRead(requestId: string): Promise<ActionResult> {
  const auth = await requireVerifiedUser();
  if (!auth.ok) return auth;
  const userId = auth.user.id;

  const db = await getDb();
  await db
    .update(messages)
    .set({ isRead: true })
    .where(and(eq(messages.requestId, requestId), eq(messages.receiverId, userId), eq(messages.isRead, false)));
  await db
    .update(adoptionRequests)
    .set({ isReadByOwner: true })
    .where(and(eq(adoptionRequests.id, requestId), eq(adoptionRequests.ownerId, userId)));

  revalidatePath('/dashboard');
  return actionOk(null);
}

/**
 * La familia decide revelar su contacto a UN adoptante. Es irreversible
 * (el dato ya fue visto), por eso la UI pide confirmación antes.
 */
export async function shareContact(requestId: string): Promise<ActionResult> {
  const auth = await requireVerifiedUser();
  if (!auth.ok) return auth;

  const db = await getDb();
  const updated = await db
    .update(adoptionRequests)
    .set({ contactSharedAt: new Date() })
    .where(
      and(
        eq(adoptionRequests.id, requestId),
        eq(adoptionRequests.ownerId, auth.user.id),
        isNull(adoptionRequests.contactSharedAt),
      ),
    )
    .returning({ id: adoptionRequests.id });

  if (updated.length === 0) {
    return actionError('No pudimos compartir tu contacto en esta solicitud.', 'forbidden');
  }

  revalidatePath(`/dashboard/mensajes/${requestId}`);
  return actionOk(null);
}
