'use client';

import { AnimatePresence, motion } from 'framer-motion';

/** Burbuja con tres puntos, como en Mensajes. El texto para lectores de pantalla va aparte. */
export function TypingIndicator({ isTyping, name }: { isTyping: boolean; name: string }) {
  return (
    <>
      <p role="status" aria-live="polite" className="sr-only">
        {isTyping ? `${name} está escribiendo` : ''}
      </p>
      <AnimatePresence>
        {isTyping ? (
          <motion.div
            aria-hidden
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className="flex w-fit origin-bottom-left items-center gap-1 rounded-[1.25rem] rounded-bl-md border border-cream-300 bg-white px-4 py-3.5"
          >
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="h-2 w-2 rounded-full bg-ink-400 animate-typing-dot"
                style={{ animationDelay: `${dot * 0.16}s` }}
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
