'use server';

import { randomUUID } from 'node:crypto';

import { and, count, eq, gt, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import {
  firstMessageSchema,
  replySchema,
  type FirstMessageInput,
  type ReplyInput,
} from '@/features/messaging/lib/message-schema';
import { actionError, actionOk, type ActionResult } from '@/lib/action-result';
import { getDb, schema } from '../db';
import { findConversationId } from '../messages';
import { requireVerifiedUser } from '../session';

const { conversations, messages, pets } = schema;

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

const RATE_LIMIT_ERROR = actionError(
  'Enviaste muchos mensajes en poco tiempo. Probá de nuevo en un rato.',
  'rate-limited',
);

/**
 * Primer mensaje de un interesado a la familia. Si ya existe la conversación,
 * el mensaje se suma a ella (una conversación por mascota e interesado).
 */
export async function sendFirstMessage(
  input: FirstMessageInput,
): Promise<ActionResult<{ conversationId: string }>> {
  const auth = await requireVerifiedUser();
  if (!auth.ok) return auth;
  const { user } = auth;

  const parsed = firstMessageSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0].message, 'invalid');
  const { petId, alias, content } = parsed.data;

  const db = await getDb();
  const [pet] = await db
    .select({ id: pets.id, ownerId: pets.ownerId, status: pets.status, slug: pets.slug })
    .from(pets)
    .where(eq(pets.id, petId))
    .limit(1);

  if (!pet) return actionError('Esta publicación ya no existe.', 'invalid');
  if (pet.ownerId === user.id) return actionError('No podés escribirte a vos mismo.', 'forbidden');
  if (pet.status !== 'publicada') {
    return actionError('Esta publicación no está recibiendo mensajes en este momento.', 'forbidden');
  }
  if (await isRateLimited(user.id)) return RATE_LIMIT_ERROR;

  const now = new Date();
  const existingId = await findConversationId(pet.id, user.id);
  const conversationId = existingId ?? randomUUID();

  await db.transaction(async (tx) => {
    if (existingId) {
      await tx
        .update(conversations)
        .set({ adopterAlias: alias, lastMessageAt: now })
        .where(eq(conversations.id, existingId));
    } else {
      await tx.insert(conversations).values({
        id: conversationId,
        petId: pet.id,
        ownerId: pet.ownerId,
        adopterId: user.id,
        adopterAlias: alias,
        createdAt: now,
        lastMessageAt: now,
      });
    }

    await tx.insert(messages).values({
      id: randomUUID(),
      conversationId,
      petId: pet.id,
      senderId: user.id,
      receiverId: pet.ownerId,
      content,
      createdAt: now,
    });
  });

  revalidatePath('/dashboard');
  revalidatePath(`/mascota/${pet.slug}`);
  return actionOk({ conversationId });
}

/** Respuesta dentro de un hilo existente (familia o interesado). */
export async function sendReply(input: ReplyInput): Promise<ActionResult<{ id: string; createdAt: string }>> {
  const auth = await requireVerifiedUser();
  if (!auth.ok) return auth;
  const { user } = auth;

  const parsed = replySchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0].message, 'invalid');
  const { conversationId, content } = parsed.data;

  const db = await getDb();
  const [conversation] = await db
    .select({ id: conversations.id, petId: conversations.petId, ownerId: conversations.ownerId, adopterId: conversations.adopterId })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  const isParticipant =
    conversation && (conversation.ownerId === user.id || conversation.adopterId === user.id);
  if (!isParticipant) return actionError('No encontramos esta conversación.', 'forbidden');
  if (await isRateLimited(user.id)) return RATE_LIMIT_ERROR;

  const now = new Date();
  const id = randomUUID();
  const receiverId = conversation.ownerId === user.id ? conversation.adopterId : conversation.ownerId;

  await db.transaction(async (tx) => {
    await tx.insert(messages).values({
      id,
      conversationId,
      petId: conversation.petId,
      senderId: user.id,
      receiverId,
      content,
      createdAt: now,
    });
    await tx.update(conversations).set({ lastMessageAt: now }).where(eq(conversations.id, conversationId));
  });

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/mensajes/${conversationId}`);
  return actionOk({ id, createdAt: now.toISOString() });
}

/** Marca como leídos los mensajes recibidos en un hilo. */
export async function markConversationRead(conversationId: string): Promise<ActionResult> {
  const auth = await requireVerifiedUser();
  if (!auth.ok) return auth;

  const db = await getDb();
  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.receiverId, auth.user.id),
        eq(messages.isRead, false),
      ),
    );

  revalidatePath('/dashboard');
  return actionOk(null);
}

/**
 * La familia decide revelar su contacto a UN interesado. Es irreversible
 * (el dato ya fue visto), por eso la UI pide confirmación antes.
 */
export async function shareContact(conversationId: string): Promise<ActionResult> {
  const auth = await requireVerifiedUser();
  if (!auth.ok) return auth;

  const db = await getDb();
  const updated = await db
    .update(conversations)
    .set({ contactSharedAt: new Date() })
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.ownerId, auth.user.id),
        isNull(conversations.contactSharedAt),
      ),
    )
    .returning({ id: conversations.id });

  if (updated.length === 0) {
    return actionError('No pudimos compartir tu contacto en esta conversación.', 'forbidden');
  }

  revalidatePath(`/dashboard/mensajes/${conversationId}`);
  return actionOk(null);
}
