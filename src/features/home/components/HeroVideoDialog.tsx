'use client';

import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';

import { CloseIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { scrollToSection } from '@/lib/scroll';

const RehomingPlayer = dynamic(() => import('./RehomingPlayer'), {
  ssr: false,
  loading: () => (
    <div className="aspect-square w-full animate-pulse rounded-panel bg-cream-200" />
  ),
});

export function HeroVideoDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/55 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Cómo funciona Homie, en 11 segundos"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-panel bg-cream-100 p-3 shadow-lift"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm font-semibold text-ink-700">Así funciona</p>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Cerrar el video"
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-cream-300 hover:text-ink-900"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <RehomingPlayer />

            <div className="mt-3 px-1 pb-1">
              <Button
                fullWidth
                onClick={() => {
                  onClose();
                  scrollToSection('publicar');
                }}
              >
                Publicar a mi mascota
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
