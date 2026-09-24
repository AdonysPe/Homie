import type { Metadata } from 'next';
import Link from 'next/link';

import { VerifiedIcon } from '@/components/icons';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { getCurrentUser } from '@/server/session';

export const metadata: Metadata = { title: 'Email confirmado', robots: { index: false } };

/** Destino del enlace del email. Si el token venció, Better Auth vuelve aquí con `?error=`. */
export default async function VerifiedPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getCurrentUser();
  const isVerified = !error && Boolean(user?.emailVerified);

  return (
    <AuthPageShell>
      <div className="surface flex w-full max-w-md flex-col items-center gap-4 p-8 text-center">
        {isVerified ? (
          <>
            <VerifiedIcon size={56} className="text-sage-500" />
            <h1 className="text-display-sm font-display">¡Email confirmado!</h1>
            <p className="text-[0.95rem] leading-relaxed text-ink-500">
              Ya puedes publicar y escribirle a otras familias. Tu perfil ahora muestra el sello de
              verificado.
            </p>
            <div className="mt-2 flex w-full flex-col gap-2">
              <Link
                href="/#publicar"
                className="flex h-12 items-center justify-center rounded-pill bg-clay-500 font-semibold text-white hover:bg-clay-600"
              >
                Publicar a mi mascota
              </Link>
              <Link
                href="/#mascotas"
                className="flex h-12 items-center justify-center rounded-pill border border-cream-400 bg-white font-semibold text-ink-900 hover:bg-clay-50"
              >
                Ver mascotas
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-display-sm font-display">El enlace ya no sirve</h1>
            <p className="text-[0.95rem] leading-relaxed text-ink-500">
              Puede que haya vencido o que ya lo hayas usado. Ingresa y pide uno nuevo desde tu panel.
            </p>
            <Link
              href="/ingresar?volver=/dashboard"
              className="mt-2 flex h-12 w-full items-center justify-center rounded-pill bg-clay-500 font-semibold text-white hover:bg-clay-600"
            >
              Ingresar
            </Link>
          </>
        )}
      </div>
    </AuthPageShell>
  );
}
