'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { scrollToSection } from '@/lib/scroll';
import { useElementInView } from '../hooks/useElementInView';

/**
 * El CTA nunca desaparece del alcance: reaparece apenas el hero sale de pantalla
 * y se esconde mientras el formulario está a la vista (ahí ya estás publicando).
 */
export function StickyPublishCta() {
  const isHeroVisible = useElementInView('hero', '-40% 0px 0px 0px');
  const isFormVisible = useElementInView('publicar', '-10% 0px -30% 0px');

  const shouldShow = !isHeroVisible && !isFormVisible;

  return (
    <AnimatePresence>
      {shouldShow ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:p-0"
        >
          <button
            type="button"
            onClick={() => scrollToSection('publicar')}
            className="flex w-full items-center justify-center rounded-pill bg-clay-500 px-6 py-3.5 text-[0.95rem] font-semibold text-white shadow-lift transition-colors duration-200 hover:bg-clay-600 sm:w-auto sm:py-3"
          >
            Publicar a mi mascota
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
