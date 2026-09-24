'use client';

import { Reveal } from '@/components/ui/Reveal';
import { scrollToSection } from '@/lib/scroll';
import { ChevronLink } from './ChevronLink';
import { MARQUEE_ITEMS, PetMarquee } from './PetMarquee';

/** Prueba social inmediata: un número grande y las mascotas pasando, estilo Apple. */
export function RecentlyPublishedSection() {
  return (
    <section id="publicadas" className="bg-cream-100 py-section" aria-labelledby="publicadas-titulo">
      <Reveal>
        <div className="shell flex flex-col items-center gap-4 text-center">
          <p className="eyebrow">Ya publicadas</p>
          <h2 id="publicadas-titulo" className="max-w-3xl text-display-md font-display text-balance text-ink-900">
            {MARQUEE_ITEMS.length} mascotas esperando esta semana.
          </h2>
          <ChevronLink onClick={() => scrollToSection('mascotas')}>Conocelas</ChevronLink>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="mt-12">
        <PetMarquee />
      </Reveal>
    </section>
  );
}
