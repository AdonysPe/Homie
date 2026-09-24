import 'server-only';

import { mkdirSync } from 'node:fs';
import path from 'node:path';

import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { connection } from 'next/server';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import { Pool } from 'pg';

import * as schema from './schema';
import { seedDatabase } from './seed';

/**
 * Dos modos, mismo esquema:
 * - `DATABASE_URL` definida → Postgres real (Neon, Supabase, Vercel Postgres…).
 *   Las migraciones se aplican con `npm run db:migrate` en el deploy.
 * - Sin `DATABASE_URL` → PGlite, Postgres embebido. En local persiste en `.data/`;
 *   se migra y se llena con datos de ejemplo solo, sin instalar nada.
 */
function createDatabase() {
  const url = process.env.DATABASE_URL;

  if (url) {
    const pool = new Pool({ connectionString: url, max: 5 });
    return { db: drizzleNodePg(pool, { schema }), ready: Promise.resolve() };
  }

  // En Vercel el disco es de solo lectura: sin DATABASE_URL, la base vive en memoria.
  const isServerless = Boolean(process.env.VERCEL);
  if (isServerless) {
    console.warn('[db] Sin DATABASE_URL: usando PGlite en memoria. Los datos no persisten entre instancias.');
  }

  let dataDir: string | undefined;
  if (!isServerless) {
    dataDir = path.join(process.cwd(), '.data', 'pglite');
    mkdirSync(dataDir, { recursive: true });
  }

  const client = new PGlite(dataDir);
  const db = drizzlePglite(client, { schema });
  const ready = (async () => {
    await migratePglite(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
    await seedDatabase(db);
  })();
  // El error se propaga en cada `getDb()`; acá solo se registra una vez.
  ready.catch((error) => console.error('[db] No se pudo inicializar PGlite:', error));

  return { db, ready };
}

type DatabaseInstance = ReturnType<typeof createDatabase>;

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

// Una sola instancia por proceso: el recargado en caliente de Next no debe abrir
// dos veces el mismo directorio de PGlite. Se crea en el primer uso, nunca al importar.
const globalForDb = globalThis as unknown as { __homieDb?: DatabaseInstance };

/**
 * Cliente listo para usar (en PGlite, ya migrado y con datos de ejemplo).
 *
 * `connection()` marca el render como dinámico: todo lo que lee la base se
 * resuelve por request y nunca durante el build (donde no hay base disponible).
 */
export async function getDb(): Promise<Database> {
  await connection();
  const instance = (globalForDb.__homieDb ??= createDatabase());
  await instance.ready;
  return instance.db as unknown as Database;
}

export { schema };
