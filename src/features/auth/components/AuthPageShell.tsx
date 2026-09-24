import Link from 'next/link';
import type { ReactNode } from 'react';

import { LockIcon } from '@/components/icons';
import { BrandMark } from '@/features/home/components/BrandMark';
import { SITE } from '@/lib/site';

/** Pantalla de cuenta: foco total en el formulario, sin distracciones. */
export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="warm-grid flex min-h-[100svh] flex-col">
      <header className="shell flex h-16 items-center">
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
