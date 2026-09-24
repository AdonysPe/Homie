/**
 * Carga las publicaciones de ejemplo en el Postgres de DATABASE_URL.
 * (En local sin DATABASE_URL no hace falta: PGlite se llena solo.)
 *
 *   DATABASE_URL=postgres://… npm run db:seed
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from '../src/server/db/schema';
import { seedDatabase } from '../src/server/db/seed';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Define DATABASE_URL');

  const pool = new Pool({ connectionString: url });
  await seedDatabase(drizzle(pool, { schema }));
  await pool.end();
  console.log('Datos de ejemplo cargados.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
