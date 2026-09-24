'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface ToastState {
  id: number;
  message: string;
  icon?: ReactNode;
}

/** Estado de un toast efímero: cada llamada reinicia el temporizador. */
export function useToast(durationMs = 2200) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  const show = useCallback(
    (message: string, icon?: ReactNode) => {
      window.clearTimeout(timeoutRef.current);
      setToast({ id: Date.now(), message, icon });
      timeoutRef.current = window.setTimeout(() => setToast(null), durationMs);
    },
    [durationMs],
  );

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  return { toast, show };
}

/**
 * Aviso tipo HUD, discreto y centrado. La región `status` existe siempre
 * (aunque esté vacía) para que los lectores de pantalla anuncien cada mensaje.
 */
export function Toast({ toast, className }: { toast: ToastState | null; className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4',
        className ?? 'bottom-28 lg:bottom-10',
      )}
    >
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="flex items-center gap-2 rounded-pill bg-ink-900/90 px-4 py-2.5 text-sm font-semibold text-white shadow-lift backdrop-blur-xl"
          >
            {toast.icon}
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
