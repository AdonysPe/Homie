import 'server-only';

import { randomUUID } from 'node:crypto';

import { and, desc, eq } from 'drizzle-orm';

import type { NotificationItem, NotificationSummary } from '@/features/notifications/lib/notification-item';
import type { NotificationType } from '@/features/notifications/lib/notification-types';
import { absoluteUrl } from '@/lib/site';
import { getDb, schema } from './db';
import { simpleEmail, sendEmail } from './email';
import { sendPushToUser } from './push';

const { notifications, user } = schema;

/** Cuántas notificaciones trae el timbre de un tirón. */
const BELL_LIMIT = 12;
/**
 * Diez mensajes seguidos en el mismo hilo no deben mandar diez emails: dentro de
 * esta ventana, se actualiza la notificación existente y no se reenvía el correo.
 */
const GROUP_EMAIL_WINDOW_MS = 10 * 60 * 1000;

interface NotifyInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  /** Avisos del mismo hilo (ej. mensajes nuevos) se agrupan en una sola fila sin leer. */
  groupKey?: string;
  email?: { subject: string; heading: string; body: string; ctaLabel: string } | null;
}

async function resolveUserEmail(userId: string): Promise<string | null> {
  const db = await getDb();
  const [row] = await db.select({ email: user.email }).from(user).where(eq(user.id, userId)).limit(1);
  return row?.email ?? null;
}

/** Punto único de entrada: guarda el aviso en la base y dispara push + email. */
async function notify(input: NotifyInput): Promise<void> {
  const db = await getDb();
  let shouldEmail = true;

  if (input.groupKey) {
    const [existing] = await db
      .select({ id: notifications.id, createdAt: notifications.createdAt })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, input.userId),
          eq(notifications.groupKey, input.groupKey),
          eq(notifications.isRead, false),
        ),
      )
      .orderBy(desc(notifications.createdAt))
      .limit(1);

    if (existing) {
      shouldEmail = Date.now() - existing.createdAt.getTime() > GROUP_EMAIL_WINDOW_MS;
      await db
        .update(notifications)
        .set({ title: input.title, message: input.message, link: input.link, createdAt: new Date() })
        .where(eq(notifications.id, existing.id));
    } else {
      await db.insert(notifications).values({
        id: randomUUID(),
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link,
        groupKey: input.groupKey,
      });
    }
  } else {
    await db.insert(notifications).values({
      id: randomUUID(),
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
    });
  }

  const tasks: Promise<unknown>[] = [
    sendPushToUser(input.userId, { title: input.title, body: input.message, link: input.link }),
  ];

  if (input.email && shouldEmail) {
    tasks.push(
      resolveUserEmail(input.userId).then((to) => {
        if (!to) return;
        return sendEmail({
          to,
          ...simpleEmail({
            subject: input.email!.subject,
            heading: input.email!.heading,
            body: input.email!.body,
            ctaLabel: input.email!.ctaLabel,
            ctaUrl: absoluteUrl(input.link),
          }),
        });
      }),
    );
  }

  // Un push o email caído nunca debe tumbar la acción que originó el aviso.
  await Promise.allSettled(tasks);
}

export async function notifyNewRequest(params: {
  ownerId: string;
  requestId: string;
  petName: string;
  adopterName: string;
}): Promise<void> {
  const link = `/dashboard/mensajes/${params.requestId}`;
  await notify({
    userId: params.ownerId,
    type: 'new_request',
    title: 'Nueva carta de presentación',
    message: `${params.adopterName} quiere adoptar a ${params.petName}.`,
    link,
    email: {
      subject: `${params.adopterName} quiere adoptar a ${params.petName}`,
      heading: 'Tienes una nueva carta de presentación',
      body: `${params.adopterName} se postuló para adoptar a ${params.petName}. Revisa su carta y decide si quieres responderle.`,
      ctaLabel: 'Ver la solicitud',
    },
  });
}

export async function notifyNewMessage(params: {
  receiverId: string;
  requestId: string;
  senderDisplayName: string;
  preview: string;
}): Promise<void> {
  const link = `/dashboard/mensajes/${params.requestId}`;
  const message = params.preview.trim() || 'Te envió una foto.';
  await notify({
    userId: params.receiverId,
    type: 'new_message',
    title: `${params.senderDisplayName} te escribió`,
    message,
    link,
    groupKey: `message:${params.requestId}`,
    email: {
      subject: `${params.senderDisplayName} te escribió en Homie`,
      heading: `${params.senderDisplayName} te escribió`,
      body: message,
      ctaLabel: 'Responder',
    },
  });
}

/** Resumen para el timbre del header: contador y últimos avisos. */
export async function getNotificationSummary(userId: string): Promise<NotificationSummary> {
  const db = await getDb();
  const [rows, unread] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(BELL_LIMIT),
    db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false))),
  ]);

  const items: NotificationItem[] = rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    link: row.link,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
  }));

  return { unreadCount: unread.length, items };
}

export async function markNotificationRead(id: string, userId: string): Promise<void> {
  const db = await getDb();
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const db = await getDb();
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}
