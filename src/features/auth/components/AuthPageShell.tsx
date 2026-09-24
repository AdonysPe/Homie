import Link from 'next/link';
import type { ReactNode } from 'react';

import { ArrowLeftIcon, LockIcon } from '@/components/icons';
import { BrandMark } from '@/features/home/components/BrandMark';
import { SITE } from '@/lib/site';

/**
 * Pantalla de cuenta: foco total en el formulario, con una salida siempre visible.
 * `backHref` vuelve a donde estaba la persona (la ficha, el formulario…) o al inicio.
 */
export function AuthPageShell({ children, backHref = '/' }: { children: ReactNode; backHref?: string }) {
  return (
    <div className="flex min-h-[100svh] flex-col bg-cream-100">
      <header className="shell relative flex h-14 items-center justify-center">
        <Link
          href={backHref}
          className="absolute left-gutter flex items-center gap-1 rounded-pill py-1.5 pr-2 text-[0.95rem] font-medium text-clay-600 transition-colors hover:text-clay-700 sm:left-8"
        >
          <ArrowLeftIcon size={18} />
          Volver
        </Link>
        <Link href="/" aria-label={`${SITE.name}, inicio`}>
          <BrandMark />
        </Link>
      </header>
      <main id="contenido" className="shell flex flex-1 flex-col items-center justify-center pb-16 pt-4">
        {children}
        <p className="mt-6 flex items-center gap-1.5 text-xs text-ink-400">
          <LockIcon size={13} />
          Tus datos, privados. Nunca los vendemos ni los mostramos.
        </p>
      </main>
    </div>
  );
}
