import 'server-only';

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';

import { SITE } from '@/lib/site';
import { getDb, schema, type Database } from './db';
import { sendEmail, verificationEmail } from './email';

/**
 * Autenticación con email y contraseña, sesiones guardadas en nuestra propia
 * base (nada de datos de usuarios en servicios de terceros).
 *
 * Se puede entrar sin haber confirmado el email, pero publicar y escribir
 * mensajes exige email verificado (lo controla `requireVerifiedUser`).
 */
function createAuth(db: Database) {
  return betterAuth({
    appName: SITE.name,
    baseURL: process.env.BETTER_AUTH_URL ?? SITE.url,
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: 'pg', schema }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      expiresIn: 60 * 60 * 24,
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmail({ to: user.email, ...verificationEmail(user.name, url) });
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      // Evita una consulta a la base en cada request: la sesión se cachea firmada en una cookie.
      cookieCache: { enabled: true, maxAge: 60 * 5 },
    },
    rateLimit: { enabled: true, window: 60, max: 20 },
    plugins: [nextCookies()],
  });
}

type Auth = ReturnType<typeof createAuth>;
let authInstance: Auth | undefined;

/** Instancia de auth, creada en el primer uso (necesita la base ya lista). */
export async function getAuth(): Promise<Auth> {
  const db = await getDb();
  authInstance ??= createAuth(db);
  return authInstance;
}
