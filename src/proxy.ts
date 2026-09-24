import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Chequeo optimista: si no hay cookie de sesión, ni siquiera renderizamos
 * la página protegida y mandamos a ingresar (volviendo después al mismo lugar).
 *
 * No es la autorización real: cada página y cada Server Action vuelve a
 * validar la sesión contra la base (`src/server/session.ts`).
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const signInUrl = new URL('/ingresar', request.url);
  signInUrl.searchParams.set('volver', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
