import type { MetadataRoute } from 'next';

import { SEED_LISTINGS } from '@/features/pets/lib/pets-data';
import { absoluteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const pets = SEED_LISTINGS.filter((listing) => listing.slug && listing.status !== 'adoptada').map(
    (listing) => ({
      url: absoluteUrl(`/mascota/${listing.slug}`),
      lastModified: listing.publishedAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }),
  );

  return [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    ...pets,
    { url: absoluteUrl('/terminos'), changeFrequency: 'yearly', priority: 0.2 },
    { url: absoluteUrl('/privacidad'), changeFrequency: 'yearly', priority: 0.2 },
  ];
}
