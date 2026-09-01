'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { ChevronDownIcon } from '@/components/icons';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/cn';
import { FAQ_ITEMS } from '../lib/faq';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="preguntas" className="scroll-mt-20 bg-cream-200/70 py-section">
      <div className="shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <Reveal>
          <SectionHeading
            eyebrow="Tranquilidad"
            title="Lo que casi todos preguntan"
            description="Tomar esta decisión ya es difícil. El resto lo hacemos simple."
          />
        </Reveal>

        <Reveal delay={0.06}>
          <ul className="flex flex-col gap-2">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              const panelId = `faq-panel-${index}`;
              const buttonId = `faq-button-${index}`;

              return (
                <motion.li
                  key={item.question}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-6% 0px' }}
                  transition={{ duration: 0.42, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    'overflow-hidden rounded-card border bg-white transition-colors duration-200',
                    isOpen ? 'border-clay-200 shadow-soft' : 'border-cream-300',
                  )}
                >
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
                    >
                      <span className="text-[0.95rem] font-semibold text-ink-900">{item.question}</span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className={cn('shrink-0', isOpen ? 'text-clay-600' : 'text-ink-400')}
                      >
                        <ChevronDownIcon size={20} />
                      </motion.span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p className="px-4 pb-4 text-sm leading-relaxed text-ink-500">{item.answer}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
