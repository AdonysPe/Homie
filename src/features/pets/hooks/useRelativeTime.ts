'use client';

import { useSyncExternalStore } from 'react';

import { formatRelativeTime } from '@/lib/format';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Devuelve "hace 3 horas" recién después de hidratar:
 * calcularlo en el servidor provocaría desajustes de hidratación.
 */
export function useRelativeTime(isoDate: string): string | null {
  const isHydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  return isHydrated ? formatRelativeTime(isoDate) : null;
}
