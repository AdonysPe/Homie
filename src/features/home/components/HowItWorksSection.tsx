'use client';

import { motion } from 'framer-motion';

import { CameraIcon, ChatIcon, HomeHeartIcon, ShieldIcon } from '@/components/icons';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { scrollToSection } from '@/lib/scroll';
import { HOW_IT_WORKS_STEPS, type HowItWorksStep } from '../lib/how-it-works';
import { ChevronLink } from './ChevronLink';

const ICONS: Record<HowItWorksStep['icon'], typeof ChatIcon> = {
  chat: ChatIcon,
  camera: CameraIcon,
  shield: ShieldIcon,
  home: HomeHeartIcon,
};

/** Cuatro mosaicos grandes y silenciosos, como las grillas de funciones de apple.com. */
export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="scroll-mt-14 bg-white py-section">
      <div className="shell flex flex-col gap-12">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Cómo funciona"
            title="Cuatro pasos. Nada más."
            description="Sin llamadas, sin trámites y sin costo."
          />
        </Reveal>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const Icon = ICONS[step.icon];
            return (
              <motion.li
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px -5% 0px' }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="flex min-h-[15rem] flex-col justify-between gap-8 rounded-[1.75rem] bg-cream-100 p-7"
              >
                <div className="flex items-center justify-between">
                  <Icon size={30} className="text-clay-500" />
                  <span className="text-sm font-semibold tabular-nums text-ink-300">{step.number}</span>
                </div>
                <div>
                  <h3 className="text-[1.375rem] font-semibold leading-tight tracking-[-0.02em] text-ink-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-500">{step.detail}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>

        <Reveal className="flex justify-center">
          <ChevronLink onClick={() => scrollToSection('publicar')}>Empezar ahora</ChevronLink>
        </Reveal>
      </div>
    </section>
  );
}
