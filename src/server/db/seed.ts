import { count } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';

// Ruta relativa (no `@/`): este módulo también lo usa `scripts/seed.ts` fuera de Next.
import { SEED_LISTINGS } from '../../features/pets/lib/pets-data';
import * as schema from './schema';

const DEMO_OWNER_ID = 'demo-familias';

/**
 * Carga las publicaciones de ejemplo una sola vez (si no hay ninguna mascota).
 * Todas pertenecen a un usuario demo sin contraseña: nadie puede iniciar sesión con él.
 */
export async function seedDatabase(db: PgDatabase<PgQueryResultHKT, typeof schema>) {
  const [{ value: existing }] = await db.select({ value: count() }).from(schema.pets);
  if (existing > 0) return;

  await db
    .insert(schema.user)
    .values({
      id: DEMO_OWNER_ID,
      name: 'Familias Homie',
      email: 'demo@homie.pet',
      emailVerified: true,
    })
    .onConflictDoNothing();

  await db.insert(schema.pets).values(
    SEED_LISTINGS.map((listing) => ({
      id: listing.id,
      slug: listing.slug!,
      ownerId: DEMO_OWNER_ID,
      name: listing.name,
      species: listing.species,
      sex: listing.sex,
      ageLabel: listing.ageLabel,
      size: listing.size ?? null,
      city: listing.city,
      photos: listing.photoUrl
        ? [{ url: listing.photoUrl, alt: listing.photoAlt }, ...(listing.gallery ?? [])]
        : [],
      highlight: listing.highlight,
      description: listing.description ?? null,
      sterilized: listing.health.sterilized,
      vaccinated: listing.health.vaccinated,
      dewormed: listing.health.dewormed,
      hasMicrochip: listing.health.microchip,
      specialNeeds: listing.specialNeeds ?? null,
      idealHome: listing.idealHome,
      goodWithKids: listing.goodWithKids,
      goodWithPets: listing.goodWithPets,
      reason: 'otro' as const,
      ownerName: 'Familia de ' + listing.name,
      contactMethod: 'email' as const,
      contactValue: 'demo@homie.pet',
      status: listing.status === 'adoptada' ? ('adoptada' as const) : ('publicada' as const),
      publishedAt: new Date(listing.publishedAt),
    })),
  );
}
