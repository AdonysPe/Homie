'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';

import { ArrowRightIcon, ChevronDownIcon, PlayIcon, ShieldIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { scrollToSection } from '@/lib/scroll';
import { useElementInView } from '../hooks/useElementInView';
import { HeroPhotoCluster } from './HeroPhotoCluster';
import { HeroVideoDialog } from './HeroVideoDialog';

/** Three.js entra por separado y solo en cliente: no bloquea el primer render. */
const HeroScene = dynamic(() => import('@/components/three/HeroScene'), { ssr: false });

const TRUST_POINTS = ['Gratis, siempre', 'Vos elegís la familia', 'Tus datos, privados'];

export function HeroSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isHeroVisible = useElementInView('hero', '80px');
  const stageRef = useRef<HTMLDivElement>(null);

  // El bloque de texto cede protagonismo a medida que el scroll avanza.
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start start', 'end start'],
  });
  const copyOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const copyLift = useTransform(scrollYProgress, [0, 1], [0, -48]);

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-16 pt-24 sm:pb-20 sm:pt-28"
    >
      <div className="warm-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />

      <div ref={stageRef} className="relative">
        {!prefersReducedMotion ? (
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden>
            <HeroScene active={isHeroVisible} />
          </div>
        ) : null}

        <div className="shell grid items-center gap-10 lg:grid-cols-[1fr_1.08fr] lg:gap-14">
          <motion.div
            style={prefersReducedMotion ? undefined : { opacity: copyOpacity, y: copyLift }}
            className="flex flex-col items-start gap-6"
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-pill border border-cream-300 bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink-700 backdrop-blur-sm"
            >
              <ShieldIcon size={15} className="text-sage-600" />
              Adopción responsable, sin intermediarios
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="text-display-lg font-display text-balance"
            >
              Ayudemos a que encuentre un{' '}
              <span className="relative whitespace-nowrap text-clay-600">
                nuevo hogar
                <motion.svg
                  className="absolute -bottom-1 left-0 h-2.5 w-full text-clay-300"
                  viewBox="0 0 200 10"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <motion.path
                    d="M2 7.5C40 3 80 2.5 198 5.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </motion.svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-prose text-lede text-ink-500"
            >
              Perro, gato, conejo o el que sea. Publicalo en 3 minutos y elegí vos con quién sigue.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
            >
              <Button
                size="lg"
                onClick={() => scrollToSection('publicar')}
                className="sm:min-w-[15rem]"
              >
                Publicar a mi mascota
                <ArrowRightIcon size={19} />
              </Button>

              <Button size="lg" variant="secondary" onClick={() => setIsVideoOpen(true)}>
                <PlayIcon size={17} />
                Ver cómo funciona
              </Button>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-ink-400"
            >
              {TRUST_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage-400" aria-hidden />
                  {point}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          <div className="w-full max-w-md justify-self-center lg:max-w-none">
            <HeroPhotoCluster />
          </div>
        </div>
      </div>

      {/* Con el hero a pantalla completa hace falta decir que abajo sigue habiendo página. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center text-ink-300"
      >
        <motion.span
          animate={prefersReducedMotion ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDownIcon size={22} />
        </motion.span>
      </motion.div>

      <HeroVideoDialog isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </section>
  );
}
