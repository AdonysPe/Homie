'use client';

import { useEffect, useRef, useState } from 'react';

import type { ChatEvent } from '../lib/chat-types';

export type StreamStatus = 'connecting' | 'live' | 'reconnecting' | 'paused' | 'closed';

/** Con la pestaña oculta más de esto, se corta el stream (y se retoma al volver). */
const HIDDEN_GRACE_MS = 30_000;

const EVENT_TYPES: ChatEvent['type'][] = ['message', 'read', 'typing'];

/**
 * Conexión en vivo al chat de una solicitud (Server-Sent Events).
 *
 * - `EventSource` reconecta solo ante cortes de red o cuando el servidor cierra
 *   el stream por tiempo; manda el último `id` y el servidor retoma desde ahí.
 * - Con la pestaña oculta un rato se desconecta para no consultar la base por
 *   nada; al volver, reabre desde el último evento recibido y no se pierde nada.
 */
export function useChatStream(requestId: string, since: string, onEvent: (event: ChatEvent) => void): StreamStatus {
  const [status, setStatus] = useState<StreamStatus>('connecting');
  const onEventRef = useRef(onEvent);
  const cursorRef = useRef(since);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    let source: EventSource | null = null;
    let hiddenTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      if (source) return;
      const url = `/api/chat/${encodeURIComponent(requestId)}/stream?since=${encodeURIComponent(cursorRef.current)}`;
      source = new EventSource(url);

      source.onopen = () => setStatus('live');
      source.onerror = () => {
        // CLOSED: el servidor rechazó (401/404) y EventSource no va a reintentar.
        setStatus(source?.readyState === EventSource.CLOSED ? 'closed' : 'reconnecting');
      };

      for (const type of EVENT_TYPES) {
        source.addEventListener(type, (event) => {
          const message = event as MessageEvent<string>;
          if (message.lastEventId) cursorRef.current = message.lastEventId;
          try {
            onEventRef.current({ type, ...JSON.parse(message.data) } as ChatEvent);
          } catch {
            // Evento malformado: se ignora; el siguiente trae el estado completo.
          }
        });
      }
    };

    const disconnect = () => {
      source?.close();
      source = null;
    };

    const onVisibility = () => {
      clearTimeout(hiddenTimer);
      if (document.visibilityState === 'hidden') {
        hiddenTimer = setTimeout(() => {
          disconnect();
          setStatus('paused');
        }, HIDDEN_GRACE_MS);
      } else if (!source) {
        setStatus('reconnecting');
        connect();
      }
    };

    connect();
    document.addEventListener('visibilitychange', onVisibility);
    // Abierto en una pestaña ya oculta: arranca también la cuenta regresiva para pausar.
    if (document.visibilityState === 'hidden') onVisibility();
    return () => {
      clearTimeout(hiddenTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      disconnect();
    };
  }, [requestId]);

  return status;
}
