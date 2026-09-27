'use server';

import { randomUUID } from 'node:crypto';

import { eq } from 'drizzle-orm';

import { actionError, actionOk, type ActionResult } from '@/lib/action-result';
import { getDb, schema } from '../db';
import { markAllNotificationsRead, markNotificationRead } from '../notifications';
import { getCurrentUser } from '../session';

const { pushSubscriptions } = schema;

export async function markNotificationAsRead(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return actionError('Inicia sesión para continuar.', 'unauthenticated');
  await markNotificationRead(id, user.id);
  return actionOk(null);
}

export async function markAllNotificationsAsRead(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return actionError('Inicia sesión para continuar.', 'unauthenticated');
  await markAllNotificationsRead(user.id);
  return actionOk(null);
}

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** Guarda (o reemplaza) la suscripción de push de este navegador. */
export async function subscribeToPush(subscription: PushSubscriptionInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return actionError('Inicia sesión para continuar.', 'unauthenticated');
  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return actionError('Suscripción inválida.', 'invalid');
  }

  const db = await getDb();
  await db
    .insert(pushSubscriptions)
    .values({
      id: randomUUID(),
      userId: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { userId: user.id, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
    });

  return actionOk(null);
}

export async function unsubscribeFromPush(endpoint: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return actionError('Inicia sesión para continuar.', 'unauthenticated');
  const db = await getDb();
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  return actionOk(null);
}
