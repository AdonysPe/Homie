/** Solo rutas internas: evita redirecciones abiertas hacia otros dominios. */
export function safeReturnPath(value: string | string[] | undefined | null): string {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return '/';
  return path;
}
