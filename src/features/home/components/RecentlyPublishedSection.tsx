'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

import { Reveal } from '@/components/ui/Reveal';
import { scrollToSection } from '@/lib/scroll';
import { ChevronLink } from './ChevronLink';
import { MARQUEE_ITEMS, PetMarquee } from './PetMarquee';

/** Prueba social inmediata: un número grande y las mascotas pasando, estilo Apple. */
export function RecentlyPublishedSection() {
  const stripRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  // El carrusel "se acerca" mientras entra en pantalla, como las galerías de apple.com.
  const { scrollYProgress } = useScroll({ target: stripRef, offset: ['start end', 'center center'] });
  const stripScale = useTransform(scrollYProgress, [0, 1], [0.88, 1]);
  const stripOpacity = useTransform(scrollYProgress, [0, 0.6], [0.3, 1]);

  return (
    <section id="publicadas" className="bg-cream-100 py-section" aria-labelledby="publicadas-titulo">
      <Reveal>
        <div className="shell flex flex-col items-center gap-4 text-center">
          <p className="eyebrow">Ya publicadas</p>
          <h2 id="publicadas-titulo" className="max-w-3xl text-display-md font-display text-balance text-ink-900">
            {MARQUEE_ITEMS.length} mascotas esperando esta semana.
          </h2>
          <ChevronLink onClick={() => scrollToSection('mascotas')}>Conócelas</ChevronLink>
        </div>
      </Reveal>

      <motion.div
        ref={stripRef}
        style={prefersReducedMotion ? undefined : { scale: stripScale, opacity: stripOpacity }}
        className="mt-12"
      >
        <PetMarquee />
      </motion.div>
    </section>
  );
}
