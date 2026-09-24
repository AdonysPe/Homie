'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { create } from 'zustand';

import { CheckIcon, InfoIcon } from '@/components/icons';
import { cn } from '@/lib/cn';

type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  current: ToastItem | null;
  show: (message: string, tone: ToastTone, durationMs?: number) => void;
  dismiss: () => void;
}

let hideTimer: ReturnType<typeof setTimeout> | undefined;

const useToastStore = create<ToastState>((set) => ({
  current: null,
  show: (message, tone, durationMs = tone === 'error' ? 4200 : 2400) => {
    clearTimeout(hideTimer);
    set({ current: { id: Date.now(), message, tone } });
    hideTimer = setTimeout(() => set({ current: null }), durationMs);
  },
  dismiss: () => set({ current: null }),
}));

/** API imperativa: se puede llamar desde cualquier handler o después de una Server Action. */
export const toast = {
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error: (message: string) => useToastStore.getState().show(message, 'error'),
  info: (message: string) => useToastStore.getState().show(message, 'info'),
};

const TONE_ICON: Record<ToastTone, React.ReactNode> = {
  success: <CheckIcon size={16} strokeWidth={2.4} className="text-sage-300" />,
  error: <InfoIcon size={16} strokeWidth={2} className="text-clay-300" />,
  info: <InfoIcon size={16} strokeWidth={2} className="text-white/70" />,
};

/**
 * Un único aviso tipo HUD para toda la app, montado en el layout raíz.
 * Los errores se anuncian con `alert` (interrumpen); el resto, con `status` (cortesía).
 */
export function Toaster() {
  const current = useToastStore((state) => state.current);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex justify-center px-4 lg:bottom-10">
      <div role="status" aria-live="polite" className="sr-only">
        {current && current.tone !== 'error' ? current.message : ''}
      </div>
      <div role="alert" className="sr-only">
        {current?.tone === 'error' ? current.message : ''}
      </div>

      <AnimatePresence>
        {current ? (
          <motion.button
            key={current.id}
            type="button"
            onClick={dismiss}
            aria-hidden
            tabIndex={-1}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className={cn(
              'pointer-events-auto flex max-w-md items-center gap-2 rounded-pill px-4 py-2.5 text-left text-sm font-semibold text-white shadow-lift backdrop-blur-xl',
              current.tone === 'error' ? 'bg-clay-800/95' : 'bg-ink-900/90',
            )}
          >
            <span className="shrink-0">{TONE_ICON[current.tone]}</span>
            {current.message}
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
