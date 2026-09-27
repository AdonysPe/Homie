import 'server-only';

import webpush from 'web-push';

import { eq } from 'drizzle-orm';
import { getDb, schema } from './db';

const { pushSubscriptions } = schema;

export interface PushPayload {
  title: string;
  body: string;
  link: string;
}

let configured = false;
function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;

  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? 'mailto:hola@homie.pet', publicKey, privateKey);
  configured = true;
  return true;
}

/**
 * Manda una notificación push a todos los dispositivos suscritos de `userId`.
 * Sin VAPID configurado (opcional), no hace nada: el resto de la app sigue igual.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  if (!ensureConfigured()) return;

  const db = await getDb();
  const subscriptions = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));
  if (subscriptions.length === 0) return;

  const body = JSON.stringify(payload);
  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          body,
        );
      } catch (error) {
        // 404/410: el navegador invalidó la suscripción (desinstaló, borró datos…). Se limpia sola.
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, subscription.id));
        }
      }
    }),
  );
}
