'use client';

import { ArrowRightIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { scrollToSection } from '@/lib/scroll';
import { MARQUEE_ITEMS, PetMarquee } from './PetMarquee';

/**
 * Momento fijo entre el hero y el resto: mientras se hace scroll, el carrusel
 * queda centrado en pantalla el tiempo suficiente para mirarlo.
 * La altura extra de la sección es lo que dura ese anclaje.
 *
 * El anclaje es `position: sticky` puro, sin JavaScript: aunque las animaciones
 * no lleguen a correr, el contenido siempre se ve.
 */
export function RecentlyPublishedSection() {
  return (
    <section
      id="publicadas"
      className="relative h-[145svh] sm:h-[165svh]"
      aria-labelledby="publicadas-titulo"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center gap-8 overflow-hidden">
        <Reveal>
          <div className="shell flex flex-col items-center gap-3 text-center">
            <p className="eyebrow">Ya publicadas</p>
            <h2 id="publicadas-titulo" className="text-display-md font-display text-balance">
              {MARQUEE_ITEMS.length} mascotas esperando esta semana
            </h2>
          </div>
        </Reveal>

        <PetMarquee />

        <Reveal delay={0.12}>
          <div className="shell flex justify-center">
            <Button size="lg" onClick={() => scrollToSection('publicar')}>
              Publicar a mi mascota
              <ArrowRightIcon size={19} />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
