'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * `reducedMotion="user"` hace que Motion desactive por sí solo las animaciones
 * de transformación cuando el sistema pide menos movimiento, sin tener que
 * comprobarlo componente por componente.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </MotionConfig>
  );
}
