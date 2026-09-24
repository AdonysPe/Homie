/**
 * Le da acceso con contraseña a la cuenta demo (dueña de las mascotas de ejemplo).
 * Si ya tenía contraseña, la reemplaza.
 *
 *   DATABASE_URL=postgres://… DEMO_PASSWORD=… npm run db:demo-user
 */
import { randomUUID } from 'node:crypto';

import { hashPassword } from 'better-auth/crypto';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from '../src/server/db/schema';
import { seedDatabase } from '../src/server/db/seed';

const DEMO_USER_ID = 'demo-familias';

async function main() {
  const url = process.env.DATABASE_URL;
  const password = process.env.DEMO_PASSWORD;
  if (!url) throw new Error('Definí DATABASE_URL');
  if (!password || password.length < 8) throw new Error('Definí DEMO_PASSWORD (mínimo 8 caracteres)');

  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool, { schema });

  // Asegura que exista el usuario demo (lo crea el seed junto con sus mascotas).
  await seedDatabase(db);

  const passwordHash = await hashPassword(password);
  const credential = and(eq(schema.account.userId, DEMO_USER_ID), eq(schema.account.providerId, 'credential'));
  const [existing] = await db.select({ id: schema.account.id }).from(schema.account).where(credential);

  if (existing) {
    await db.update(schema.account).set({ password: passwordHash, updatedAt: new Date() }).where(credential);
  } else {
    await db.insert(schema.account).values({
      id: randomUUID(),
      accountId: DEMO_USER_ID,
      providerId: 'credential',
      userId: DEMO_USER_ID,
      password: passwordHash,
    });
  }

  await pool.end();
  console.log('Cuenta demo lista: demo@homie.pet');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
