import { eq } from 'drizzle-orm';

import { getDb, schema } from '@/server/db';

/**
 * Sirve las fotos subidas por las familias. El id es un UUID imposible de adivinar
 * y la foto nunca cambia: se cachea como inmutable en el navegador y en la CDN.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const [photo] = await db
    .select({ data: schema.petPhotos.data, mimeType: schema.petPhotos.mimeType })
    .from(schema.petPhotos)
    .where(eq(schema.petPhotos.id, id))
    .limit(1);

  if (!photo) return new Response('Not found', { status: 404 });

  return new Response(Buffer.from(photo.data), {
    headers: {
      'Content-Type': photo.mimeType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
