'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

import { AccountMenu, type AccountSummary } from '@/features/auth/components/AccountMenu';
import { SITE } from '@/lib/site';
import { scrollToSection } from '@/lib/scroll';
import { BrandMark } from './BrandMark';

const NAV_LINKS = [
  { id: 'como-funciona', label: 'Cómo funciona' },
  { id: 'mascotas', label: 'Mascotas' },
  { id: 'preguntas', label: 'Preguntas' },
];

/**
 * Barra de navegación estilo apple.com: baja, translúcida (vidrio esmerilado),
 * enlaces en texto chico y una línea fina que aparece al hacer scroll.
 */
export function SiteHeader({ account }: { account: AccountSummary | null }) {
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 40], [0, 1]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-white/75 backdrop-blur-xl backdrop-saturate-150">
      <motion.div
        style={{ opacity: borderOpacity }}
        className="absolute inset-x-0 bottom-0 h-px bg-ink-900/10"
        aria-hidden
      />

      <div className="shell flex h-14 items-center justify-between gap-4">
        <a href="#hero" aria-label={`${SITE.name}, inicio`} className="shrink-0">
          <BrandMark />
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Secciones">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="text-[0.8125rem] text-ink-700 transition-colors hover:text-ink-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => scrollToSection('publicar')}
            className="hidden rounded-pill bg-clay-500 px-3.5 py-1.5 text-[0.8125rem] font-medium text-white transition-colors hover:bg-clay-600 sm:block"
          >
            Publicar
          </button>
          <AccountMenu account={account} />
        </div>
      </div>
    </header>
  );
}
