'use client';

import { AnimatePresence, motion } from 'framer-motion';

export function FieldError({ id, message }: { id?: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden text-xs font-medium text-clay-600"
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}
