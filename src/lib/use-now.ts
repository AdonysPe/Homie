'use client';

import { useSyncExternalStore } from 'react';

/**
 * Reloj compartido: un único intervalo para toda la página, por más
 * tiempos relativos que haya en pantalla ("hace 2 minutos" se actualiza solo).
 */
const TICK_MS = 30_000;
const listeners = new Set<() => void>();
let now = Date.now();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((notify) => notify());
    }, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/**
 * Hora actual que se refresca cada 30 s. Devuelve `null` en el servidor y
 * durante la hidratación: así el HTML no depende del reloj de quién lo generó.
 */
export function useNow(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => now,
    () => null,
  );
}
