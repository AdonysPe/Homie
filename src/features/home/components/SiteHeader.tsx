'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { scrollToSection } from '@/lib/scroll';
import { BrandMark } from './BrandMark';

const NAV_LINKS = [
  { id: 'como-funciona', label: 'Cómo funciona' },
  { id: 'mascotas', label: 'Mascotas' },
  { id: 'preguntas', label: 'Preguntas' },
];

export function SiteHeader() {
  const { scrollY, scrollYProgress } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 90], [0, 1]);
  const background = useTransform(
    scrollY,
    [0, 90],
    ['rgba(251,247,242,0)', 'rgba(251,247,242,0.86)'],
  );

  return (
    <motion.header
      style={{ background }}
      className="fixed inset-x-0 top-0 z-40 backdrop-blur-md"
    >
      <motion.div
        style={{ opacity: borderOpacity }}
        className="absolute inset-x-0 bottom-0 h-px bg-cream-300"
      />

      {/* Cuánto falta para llegar al final de la página. */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-clay-500"
        aria-hidden
      />

      <div className="shell flex h-16 items-center justify-between gap-4">
        <a href="#hero" aria-label="Homie, inicio">
          <BrandMark />
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Secciones">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="rounded-pill px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-cream-200 hover:text-ink-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Button size="sm" onClick={() => scrollToSection('publicar')} className="hidden sm:inline-flex">
          Publicar a mi mascota
        </Button>
      </div>
    </motion.header>
  );
}
