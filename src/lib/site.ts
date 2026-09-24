/**
 * Datos de marca y URL canónica en un solo lugar.
 * En Vercel, `VERCEL_PROJECT_PRODUCTION_URL` apunta al dominio de producción;
 * `NEXT_PUBLIC_SITE_URL` permite fijarlo a mano (dominio propio).
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercelHost) return `https://${vercelHost}`;

  return 'http://localhost:3000';
}

export const SITE = {
  name: 'Homie',
  url: resolveSiteUrl(),
  contactEmail: 'hola@homie.pet',
  privacyEmail: 'privacidad@homie.pet',
  locale: 'es_AR',
  /** Las fechas se muestran en hora argentina aunque el servidor corra en UTC. */
  timeZone: 'America/Argentina/Buenos_Aires',
} as const;

export const absoluteUrl = (path: string): string => new URL(path, SITE.url).toString();
