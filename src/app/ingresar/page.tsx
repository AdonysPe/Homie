import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AuthForm } from '@/features/auth/components/AuthForm';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { safeReturnPath } from '@/lib/safe-return-path';
import { getCurrentUser } from '@/server/session';

export const metadata: Metadata = {
  title: 'Ingresar',
  description: 'Ingresá a tu cuenta para publicar y responder mensajes.',
  robots: { index: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string | string[] }>;
}) {
  const returnTo = safeReturnPath((await searchParams).volver);
  if (await getCurrentUser()) redirect(returnTo);

  return (
    <AuthPageShell backHref={returnTo}>
      <AuthForm mode="ingresar" returnTo={returnTo} />
    </AuthPageShell>
  );
}
