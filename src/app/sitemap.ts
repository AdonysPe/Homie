import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/lib/site';
import { listPublicPets } from '@/server/pets';

// Se genera en cada request: las publicaciones cambian todo el tiempo.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pets = (await listPublicPets())
    .filter((listing) => listing.slug && listing.status !== 'adoptada')
    .map((listing) => ({
      url: absoluteUrl(`/mascota/${listing.slug}`),
      lastModified: listing.publishedAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

  return [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    ...pets,
    { url: absoluteUrl('/terminos'), changeFrequency: 'yearly', priority: 0.2 },
    { url: absoluteUrl('/privacidad'), changeFrequency: 'yearly', priority: 0.2 },
  ];
}
