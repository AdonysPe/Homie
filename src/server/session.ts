import 'server-only';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { actionError, type ActionError } from '@/lib/action-result';
import type { AccountSummary } from '@/features/auth/components/AccountMenu';
import { getAuth } from './auth';
import { countUnread } from './messages';

export interface CurrentUser {
  id: string;
  name: string;
  emailVerified: boolean;
}

/** Usuario de la request actual (memoizado por request). Nunca expone el email a la UI. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const auth = await getAuth();
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result) return null;
  return { id: result.user.id, name: result.user.name, emailVerified: result.user.emailVerified };
});

/** Para páginas protegidas: redirige a ingresar y vuelve después. */
export async function requireUserOrRedirect(returnTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/ingresar?volver=${encodeURIComponent(returnTo)}`);
  return user;
}

/** Para Server Actions: la autorización real, independiente del proxy. */
export async function requireVerifiedUser(): Promise<{ ok: true; user: CurrentUser } | ActionError> {
  const user = await getCurrentUser();
  if (!user) return actionError('Inicia sesión para continuar.', 'unauthenticated');
  if (!user.emailVerified) {
    return actionError('Confirma tu email para continuar. Revisa tu bandeja de entrada.', 'unverified');
  }
  return { ok: true, user };
}

/** Resumen para el header: nombre, verificación y mensajes sin leer. */
export async function getAccountSummary(): Promise<AccountSummary | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return { name: user.name, emailVerified: user.emailVerified, unreadCount: await countUnread(user.id) };
}
