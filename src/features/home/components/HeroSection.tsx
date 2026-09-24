'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { scrollToSection } from '@/lib/scroll';
import { ChevronLink } from './ChevronLink';
import { HeroMotionWall } from './HeroMotionWall';
import { HeroVideoDialog } from './HeroVideoDialog';

const TRUST_POINTS = ['Gratis, siempre', 'Tú eliges la familia', 'Tus datos, privados'];

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/**
 * Hero al estilo de una página de producto de Apple: mensaje centrado y breve,
 * una acción principal, un enlace secundario y la imagen como protagonista.
 */
export function HeroSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const wallRef = useRef<HTMLDivElement>(null);

  // El muro se acerca apenas al hacer scroll: da profundidad sin distraer.
  const { scrollYProgress } = useScroll({ target: wallRef, offset: ['start end', 'end start'] });
  const wallScale = useTransform(scrollYProgress, [0, 0.5], [0.94, 1]);

  return (
    <section id="hero" className="relative overflow-hidden bg-white pb-12 pt-28 sm:pt-36">
      <div className="shell flex flex-col items-center text-center">
        <motion.p {...enter(0)} className="eyebrow">
          Adopción responsable, sin intermediarios
        </motion.p>

        <motion.h1 {...enter(0.06)} className="mt-4 max-w-4xl text-display-xl font-display text-balance text-ink-900">
          Un nuevo hogar empieza <span className="text-clay-500">aquí.</span>
        </motion.h1>

        <motion.p {...enter(0.14)} className="mt-6 max-w-2xl text-lede text-ink-500 text-balance">
          Perro, gato, conejo o el que sea. Publícalo en 3 minutos y elige tú con quién sigue su historia.
        </motion.p>

        <motion.div {...enter(0.22)} className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:gap-7">
          <Button size="lg" onClick={() => scrollToSection('publicar')} className="min-w-[14rem]">
            Publicar a mi mascota
          </Button>
          <ChevronLink onClick={() => setIsVideoOpen(true)}>Ver cómo funciona</ChevronLink>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.34 }}
          className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-400"
        >
          {TRUST_POINTS.map((point) => (
            <li key={point} className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-ink-300" aria-hidden />
              {point}
            </li>
          ))}
        </motion.ul>
      </div>

      <motion.div
        ref={wallRef}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={prefersReducedMotion ? undefined : { scale: wallScale }}
        className="mx-auto mt-14 w-full max-w-[84rem] px-3 sm:mt-20 sm:px-6"
      >
        <HeroMotionWall />
      </motion.div>

      <HeroVideoDialog isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </section>
  );
}
