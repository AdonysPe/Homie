'use server';

import { randomUUID } from 'node:crypto';

import { and, count, eq, gt, isNull, lt, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { chatImageUrl, type ChatMessage } from '@/features/chat/lib/chat-types';
import { chatMessageSchema } from '@/features/messaging/lib/message-schema';
import { actionError, actionOk, type ActionResult } from '@/lib/action-result';
import { getChatParticipant } from '../chat';
import { getDb, schema } from '../db';
import { readUploadedImage } from '../image-upload';
import { requireVerifiedUser } from '../session';

const { adoptionRequests, chatImages, messages } = schema;

/** Anti-spam: mensajes por usuario por hora (una conversación real queda muy por debajo). */
const MESSAGES_PER_HOUR = 120;
/** No se reescribe "escribiendo" más de una vez por este intervalo, aunque el cliente insista. */
const TYPING_MIN_INTERVAL_MS = 2_000;

async function isRateLimited(userId: string): Promise<boolean> {
  const db = await getDb();
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const [row] = await db
    .select({ value: count() })
    .from(messages)
    .where(and(eq(messages.senderId, userId), gt(messages.createdAt, since)));
  return (row?.value ?? 0) >= MESSAGES_PER_HOUR;
}

/**
 * Envía un mensaje (texto, foto o ambos). Recibe `FormData` porque puede llevar
 * un archivo: `requestId`, `content`, y opcionalmente `image` + `imageWidth`/`imageHeight`
 * (la foto ya viene comprimida y sin EXIF desde el navegador).
 *
 * Devuelve el mensaje ya serializado: el cliente reemplaza su versión optimista
 * con esta, y si el stream lo entrega también, se descarta por id.
 */
export async function sendChatMessage(formData: FormData): Promise<ActionResult<ChatMessage>> {
  const auth = await requireVerifiedUser();
  if (!auth.ok) return auth;
  const { user } = auth;

  const parsed = chatMessageSchema.safeParse({
    requestId: formData.get('requestId'),
    content: formData.get('content') ?? '',
    imageWidth: formData.get('imageWidth') ?? undefined,
    imageHeight: formData.get('imageHeight') ?? undefined,
  });
  if (!parsed.success) return actionError(parsed.error.issues[0].message, 'invalid');
  const { requestId, content, imageWidth, imageHeight } = parsed.data;

  const file = formData.get('image');
  const hasImage = file instanceof File && file.size > 0;
  if (!content && !hasImage) return actionError('Escribe un mensaje o adjunta una foto.', 'invalid');

  const participant = await getChatParticipant(requestId, user.id);
  if (!participant) return actionError('No encontramos esta solicitud.', 'forbidden');
  if (await isRateLimited(user.id)) {
    return actionError('Enviaste muchos mensajes en poco tiempo. Prueba de nuevo en un rato.', 'rate-limited');
  }

  let image: { data: Uint8Array; mimeType: string; width: number; height: number } | null = null;
  if (hasImage) {
    const upload = await readUploadedImage(file);
    if (!upload || !imageWidth || !imageHeight) {
      return actionError('La foto no es válida o pesa demasiado. Prueba con otra.', 'invalid');
    }
    image = { ...upload, width: imageWidth, height: imageHeight };
  }

  const now = new Date();
  const messageId = randomUUID();
  const imageId = image ? randomUUID() : null;
  const clearTyping = participant.role === 'owner' ? { ownerTypingAt: null } : { adopterTypingAt: null };

  const db = await getDb();
  await db.transaction(async (tx) => {
    if (image && imageId) {
      await tx.insert(chatImages).values({
        id: imageId,
        requestId,
        uploaderId: user.id,
        mimeType: image.mimeType,
        data: image.data,
        width: image.width,
        height: image.height,
        createdAt: now,
      });
    }
    await tx.insert(messages).values({
      id: messageId,
      requestId,
      senderId: user.id,
      receiverId: participant.counterpartId,
      content,
      imageId,
      createdAt: now,
    });
    // Enviar apaga el "escribiendo…" en el acto, sin esperar a que venza.
    await tx
      .update(adoptionRequests)
      .set({ lastActivityAt: now, updatedAt: now, ...clearTyping })
      .where(eq(adoptionRequests.id, requestId));
  });

  // El chat se actualiza por el stream; esto refresca la bandeja y los contadores.
  revalidatePath('/dashboard');

  return actionOk({
    id: messageId,
    content,
    image: image && imageId ? { url: chatImageUrl(imageId), width: image.width, height: image.height } : null,
    createdAt: now.toISOString(),
    readAt: null,
    isMine: true,
  });
}

/**
 * "Estoy escribiendo". El cliente lo llama como mucho cada 2,5 s mientras teclea;
 * el `where` además ignora llamadas demasiado seguidas.
 */
export async function setTyping(requestId: string): Promise<void> {
  const auth = await requireVerifiedUser();
  if (!auth.ok) return;

  const participant = await getChatParticipant(requestId, auth.user.id);
  if (!participant) return;

  const now = new Date();
  const column = participant.role === 'owner' ? adoptionRequests.ownerTypingAt : adoptionRequests.adopterTypingAt;
  const db = await getDb();
  await db
    .update(adoptionRequests)
    .set(participant.role === 'owner' ? { ownerTypingAt: now } : { adopterTypingAt: now })
    .where(
      and(
        eq(adoptionRequests.id, requestId),
        or(isNull(column), lt(column, new Date(now.getTime() - TYPING_MIN_INTERVAL_MS))),
      ),
    );
}

/** Marca como leído lo recibido en una solicitud (y la carta, si la abre la familia). */
export async function markRequestRead(requestId: string): Promise<ActionResult> {
  const auth = await requireVerifiedUser();
  if (!auth.ok) return auth;
  const userId = auth.user.id;

  const db = await getDb();
  const now = new Date();
  const updated = await db
    .update(messages)
    .set({ isRead: true, readAt: now })
    .where(and(eq(messages.requestId, requestId), eq(messages.receiverId, userId), eq(messages.isRead, false)))
    .returning({ id: messages.id });
  const openedLetter = await db
    .update(adoptionRequests)
    .set({ isReadByOwner: true })
    .where(
      and(
        eq(adoptionRequests.id, requestId),
        eq(adoptionRequests.ownerId, userId),
        eq(adoptionRequests.isReadByOwner, false),
      ),
    )
    .returning({ id: adoptionRequests.id });

  if (updated.length > 0 || openedLetter.length > 0) revalidatePath('/dashboard');
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
