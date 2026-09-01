'use client';

import { useEffect, useState } from 'react';

/**
 * Observa un elemento por id y devuelve si está a la vista.
 * Arranca en `true` para que nada aparezca de golpe antes del primer callback.
 */
export function useElementInView(elementId: string, rootMargin = '0px'): boolean {
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementId, rootMargin]);

  return isInView;
}
