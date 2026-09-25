import { eq } from 'drizzle-orm';

import { getChatParticipant } from '@/server/chat';
import { getDb, schema } from '@/server/db';
import { getCurrentUser } from '@/server/session';

/**
 * Sirve una foto del chat SOLO a los dos participantes de la solicitud.
 *
 * Por eso no se sube a un CDN público (Cloudinary/S3 con URL abierta): la foto
 * del hogar de alguien no puede quedar accesible para cualquiera que tenga el
 * enlace. La caché es `private`: el navegador la guarda, los CDN intermedios no.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const db = await getDb();
  const [image] = await db
    .select({
      requestId: schema.chatImages.requestId,
      data: schema.chatImages.data,
      mimeType: schema.chatImages.mimeType,
    })
    .from(schema.chatImages)
    .where(eq(schema.chatImages.id, id))
    .limit(1);

  // Mismo 404 exista o no: no se filtra qué imágenes existen.
  if (!image || !(await getChatParticipant(image.requestId, user.id))) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(Buffer.from(image.data), {
    headers: {
      'Content-Type': image.mimeType,
      'Cache-Control': 'private, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
