import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AuthForm } from '@/features/auth/components/AuthForm';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { safeReturnPath } from '@/lib/safe-return-path';
import { getCurrentUser } from '@/server/session';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Creá tu cuenta gratis para publicar a tu mascota o escribirle a una familia.',
  robots: { index: false },
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string | string[] }>;
}) {
  const returnTo = safeReturnPath((await searchParams).volver);
  if (await getCurrentUser()) redirect(returnTo);

  return (
    <AuthPageShell>
      <AuthForm mode="registro" returnTo={returnTo} />
    </AuthPageShell>
  );
}
