/**
 * Actualiza las mascotas de ejemplo de una base existente con los datos
 * actuales de `pets-data.ts` (distrito, slug y textos). No toca publicaciones
 * reales ni cambia estados: solo las filas `seed-*`.
 *
 *   DATABASE_URL=postgres://… npm run db:sync-seed
 */
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { SEED_LISTINGS } from '../src/features/pets/lib/pets-data';
import * as schema from '../src/server/db/schema';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Define DATABASE_URL');

  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool, { schema });

  let updated = 0;
  for (const listing of SEED_LISTINGS) {
    const rows = await db
      .update(schema.pets)
      .set({
        slug: listing.slug!,
        city: listing.city,
        highlight: listing.highlight,
        description: listing.description ?? null,
        specialNeeds: listing.specialNeeds ?? null,
        updatedAt: new Date(),
      })
      .where(eq(schema.pets.id, listing.id))
      .returning({ id: schema.pets.id });
    updated += rows.length;
  }

  await pool.end();
  console.log(`Mascotas de ejemplo actualizadas: ${updated}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
