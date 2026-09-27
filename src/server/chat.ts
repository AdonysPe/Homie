import 'server-only';

import { and, asc, eq, gt, gte, isNotNull, or } from 'drizzle-orm';

import { chatImageUrl, TYPING_WINDOW_MS, type ChatMessage } from '@/features/chat/lib/chat-types';
import { ownerDisplayName } from '@/lib/privacy';
import { getDb, schema } from './db';

const { adoptionRequests, chatImages, messages, pets } = schema;

export type ChatRole = 'owner' | 'adopter';

export interface ChatParticipant {
  requestId: string;
  role: ChatRole;
  userId: string;
  counterpartId: string;
  petName: string;
  /**
   * Nombre con el que se debe identificar a `userId` frente a la otra parte:
   * el nombre real si es quien adopta, o "Familia de {mascota}" si es quien la da.
   */
  displayName: string;
}

/**
 * Autorización de todo el chat: devuelve el rol de `userId` en la solicitud,
 * o `null` si no participa (y entonces se responde como si no existiera).
 */
export async function getChatParticipant(requestId: string, userId: string): Promise<ChatParticipant | null> {
  const db = await getDb();
  const [row] = await db
    .select({
      ownerId: adoptionRequests.ownerId,
      adopterId: adoptionRequests.adopterId,
      adopterName: adoptionRequests.adopterName,
      petName: pets.name,
    })
    .from(adoptionRequests)
    .innerJoin(pets, eq(pets.id, adoptionRequests.petId))
    .where(
      and(
        eq(adoptionRequests.id, requestId),
        or(eq(adoptionRequests.ownerId, userId), eq(adoptionRequests.adopterId, userId)),
      ),
    )
    .limit(1);

  if (!row) return null;
  const role: ChatRole = row.ownerId === userId ? 'owner' : 'adopter';
  return {
    requestId,
    role,
    userId,
    counterpartId: role === 'owner' ? row.adopterId : row.ownerId,
    petName: row.petName,
    displayName: role === 'owner' ? ownerDisplayName(row.petName) : row.adopterName,
  };
}

const messageColumns = {
  id: messages.id,
  content: messages.content,
  senderId: messages.senderId,
  readAt: messages.readAt,
  createdAt: messages.createdAt,
  imageId: chatImages.id,
  imageWidth: chatImages.width,
  imageHeight: chatImages.height,
};

type MessageRow = {
  id: string;
  content: string;
  senderId: string;
  readAt: Date | null;
  createdAt: Date;
  imageId: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
};

export function toChatMessage(row: MessageRow, viewerId: string): ChatMessage {
  return {
    id: row.id,
    content: row.content,
    image:
      row.imageId && row.imageWidth && row.imageHeight
        ? { url: chatImageUrl(row.imageId), width: row.imageWidth, height: row.imageHeight }
        : null,
    createdAt: row.createdAt.toISOString(),
    readAt: row.readAt?.toISOString() ?? null,
    isMine: row.senderId === viewerId,
  };
}

/** Historial completo de una solicitud, del más viejo al más nuevo. */
export async function listChatMessages(requestId: string, viewerId: string): Promise<ChatMessage[]> {
  const db = await getDb();
  const rows = await db
    .select(messageColumns)
    .from(messages)
    .leftJoin(chatImages, eq(chatImages.id, messages.imageId))
    .where(eq(messages.requestId, requestId))
    .orderBy(asc(messages.createdAt));
  return rows.map((row) => toChatMessage(row, viewerId));
}

/**
 * Lo que el stream necesita en cada vuelta, en una sola ida a la base por consulta:
 * mensajes nuevos, confirmaciones de lectura de mis mensajes y si la otra parte escribe.
 */
export async function pollChatChanges(
  participant: ChatParticipant,
  cursors: { messagesSince: Date; readsSince: Date },
) {
  const db = await getDb();
  const { requestId, userId, role } = participant;

  const [newMessages, newReads, [typingRow]] = await Promise.all([
    db
      .select(messageColumns)
      .from(messages)
      .leftJoin(chatImages, eq(chatImages.id, messages.imageId))
      // `>=` y no `>`: dos mensajes pueden compartir milisegundo. El stream descarta repetidos.
      .where(and(eq(messages.requestId, requestId), gte(messages.createdAt, cursors.messagesSince)))
      .orderBy(asc(messages.createdAt)),
    db
      .select({ id: messages.id, readAt: messages.readAt })
      .from(messages)
      .where(
        and(
          eq(messages.requestId, requestId),
          eq(messages.senderId, userId),
          isNotNull(messages.readAt),
          gt(messages.readAt, cursors.readsSince),
        ),
      ),
    db
      .select({
        typingAt: role === 'owner' ? adoptionRequests.adopterTypingAt : adoptionRequests.ownerTypingAt,
      })
      .from(adoptionRequests)
      .where(eq(adoptionRequests.id, requestId))
      .limit(1),
  ]);

  const typingAt = typingRow?.typingAt;
  return {
    messages: newMessages.map((row) => ({ message: toChatMessage(row, userId), createdAt: row.createdAt })),
    reads: newReads.filter((read): read is { id: string; readAt: Date } => read.readAt !== null),
    counterpartTyping: Boolean(typingAt && Date.now() - typingAt.getTime() < TYPING_WINDOW_MS),
  };
}
