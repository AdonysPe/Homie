'use client';

import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';

import { ArrowRightIcon, CameraIcon, ChatIcon, HomeHeartIcon, ShieldIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { scrollToSection } from '@/lib/scroll';
import { HOW_IT_WORKS_STEPS, type HowItWorksStep } from '../lib/how-it-works';

const ICONS: Record<HowItWorksStep['icon'], typeof ChatIcon> = {
  chat: ChatIcon,
  camera: CameraIcon,
  shield: ShieldIcon,
  home: HomeHeartIcon,
};

/** El punto de cada paso se enciende cuando la línea de progreso lo alcanza. */
function TrackDot({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const threshold = index / (HOW_IT_WORKS_STEPS.length - 1);
  const scale = useTransform(progress, [threshold - 0.12, threshold], [0.6, 1]);
  const opacity = useTransform(progress, [threshold - 0.12, threshold], [0.25, 1]);

  return (
    <motion.span
      style={{ left: `${12.5 + index * 25}%`, scale, opacity }}
      className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-clay-500"
    />
  );
}

export function HowItWorksSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start 0.85', 'end 0.55'],
  });

  return (
    <section id="como-funciona" className="scroll-mt-20 py-section">
      <div className="shell flex flex-col gap-9">
        <Reveal>
          <SectionHeading
            eyebrow="Cómo funciona"
            title="Cuatro pasos y listo"
            description="Sin llamadas, sin trámites, sin costo."
            action={
              <Button variant="secondary" onClick={() => scrollToSection('publicar')}>
                Empezar ahora
                <ArrowRightIcon size={18} />
              </Button>
            }
          />
        </Reveal>

        <div ref={trackRef}>
          {/* Riel de progreso: se dibuja a medida que la sección entra en pantalla. */}
          <div className="relative mb-4 hidden h-3 lg:block" aria-hidden>
            <span className="absolute left-[12.5%] right-[12.5%] top-1/2 h-px -translate-y-1/2 bg-cream-400" />
            <motion.span
              style={{ scaleX: scrollYProgress }}
              className="absolute left-[12.5%] right-[12.5%] top-1/2 h-px origin-left -translate-y-1/2 bg-clay-500"
            />
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <TrackDot key={step.number} index={index} progress={scrollYProgress} />
            ))}
          </div>

          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((step, index) => {
              const Icon = ICONS[step.icon];

              return (
                <motion.li
                  key={step.number}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10% 0px -5% 0px' }}
                  transition={{ duration: 0.5, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative flex h-full flex-col gap-3 rounded-panel border border-cream-300 bg-white/70 p-5 transition-colors duration-300 hover:border-clay-200 hover:bg-white hover:shadow-soft"
                >
                  <motion.span
                    whileHover={{ rotate: -8, scale: 1.06 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className="flex h-11 w-11 items-center justify-center rounded-[0.95rem] bg-clay-50 text-clay-600 transition-colors duration-300 group-hover:bg-clay-100"
                  >
                    <Icon size={22} />
                  </motion.span>

                  <span className="text-xs font-bold tracking-[0.14em] text-ink-300">
                    {step.number}
                  </span>

                  <div>
                    <h3 className="text-base font-bold text-ink-900">{step.title}</h3>
                    <p className="mt-1 text-sm text-ink-500">{step.detail}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
