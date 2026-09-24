import { defineConfig } from 'drizzle-kit';

/**
 * `npm run db:generate` crea migraciones SQL a partir de `src/server/db/schema.ts`.
 * `npm run db:migrate` las aplica sobre DATABASE_URL (Postgres de producción).
 * En local sin DATABASE_URL no hace falta: PGlite se migra solo al arrancar.
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
  strict: true,
});
