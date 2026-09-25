'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { ChevronDownIcon } from '@/components/icons';
import { toast } from '@/components/ui/Toast';
import { createId, formatShortDate } from '@/lib/format';
import { markRequestRead, sendChatMessage, setTyping } from '@/server/actions/messages';
import { useChatStream, type StreamStatus } from '../hooks/useChatStream';
import { chatReducer, initChatState, type OutgoingDraft } from '../lib/chat-state';
import { TYPING_WINDOW_MS, type ChatEvent, type ChatMessage } from '../lib/chat-types';
import { ChatComposer } from './ChatComposer';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface ChatWindowProps {
  requestId: string;
  counterpartName: string;
  initialMessages: ChatMessage[];
  /** Hora del servidor al renderizar: el stream arranca desde acá y no se pierde nada. */
  serverNow: string;
  hasUnread: boolean;
  /** Sin email verificado se puede leer, pero no escribir. */
  canWrite: boolean;
}

const STATUS_COPY: Partial<Record<StreamStatus, string>> = {
  reconnecting: 'Reconectando…',
  closed: 'Se perdió la conexión en vivo. Recarga la página para seguir.',
};

/** Margen para considerar que la persona está "abajo del todo" leyendo lo último. */
const NEAR_BOTTOM_PX = 200;
const isNearBottom = () =>
  window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - NEAR_BOTTOM_PX;

/**
 * Chat en tiempo real de una solicitud de adopción.
 *
 * - Recibe por Server-Sent Events (`useChatStream`): mensajes, "Visto" y "escribiendo…".
 * - Envía por Server Action con actualización optimista; si falla, queda para reintentar.
 * - Lo recibido se marca como leído solo si la pestaña está a la vista.
 */
export function ChatWindow({
  requestId,
  counterpartName,
  initialMessages,
  serverNow,
  hasUnread,
  canWrite,
}: ChatWindowProps) {
  const router = useRouter();
  const [messages, dispatch] = useReducer(chatReducer, initialMessages, initChatState);
  const [isCounterpartTyping, setIsCounterpartTyping] = useState(false);
  const [hasNewBelow, setHasNewBelow] = useState(false);

  const listEndRef = useRef<HTMLDivElement>(null);
  const typingExpiryRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const markReadTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const unreadPendingRef = useRef(false);
  const previewUrlsRef = useRef(new Set<string>());

  /** Marca como leído con un pequeño retardo: una ráfaga de mensajes es una sola escritura. */
  const markRead = useCallback(() => {
    if (!canWrite || document.visibilityState !== 'visible') return;
    clearTimeout(markReadTimerRef.current);
    markReadTimerRef.current = setTimeout(() => {
      unreadPendingRef.current = false;
      void markRequestRead(requestId);
    }, 400);
  }, [canWrite, requestId]);

  const handleEvent = useCallback(
    (event: ChatEvent) => {
      switch (event.type) {
        case 'message':
          if (!event.message.isMine) {
            setIsCounterpartTyping(false);
            unreadPendingRef.current = true;
            markRead();
            if (!isNearBottom()) setHasNewBelow(true);
          }
          dispatch({ type: 'received', message: event.message });
          break;
        case 'read':
          dispatch({ type: 'read', ids: event.ids, readAt: event.readAt });
          break;
        case 'typing':
          setIsCounterpartTyping(event.isTyping);
          // Red de seguridad: si se corta el stream, "escribiendo…" no queda colgado.
          clearTimeout(typingExpiryRef.current);
          if (event.isTyping) {
            typingExpiryRef.current = setTimeout(() => setIsCounterpartTyping(false), TYPING_WINDOW_MS + 2_000);
          }
          break;
      }
    },
    [markRead],
  );

  const streamStatus = useChatStream(requestId, serverNow, handleEvent);

  // Al abrir el hilo: lo pendiente se marca leído y se refresca el contador del header.
  useEffect(() => {
    if (!hasUnread || !canWrite) return;
    void markRequestRead(requestId).then(() => router.refresh());
    // Solo al montar: después lo manejan los eventos del stream.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si llegaron mensajes con la pestaña oculta, se marcan al volver.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && unreadPendingRef.current) markRead();
    };
    const onScroll = () => {
      if (isNearBottom()) setHasNewBelow(false);
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('scroll', onScroll);
    };
  }, [markRead]);

  // Sigue lo último si ya estaba abajo (o si el mensaje es propio); si no, aparece el aviso.
  const lastMessageId = messages.at(-1)?.id;
  const lastMessageIsMine = messages.at(-1)?.isMine ?? false;
  useEffect(() => {
    if (!lastMessageId) return;
    if (lastMessageIsMine || isNearBottom()) {
      listEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }
  }, [lastMessageId, lastMessageIsMine, isCounterpartTyping]);

  // Al salir se liberan las vistas previas locales de las fotos enviadas.
  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      clearTimeout(typingExpiryRef.current);
      clearTimeout(markReadTimerRef.current);
    };
  }, []);

  const deliver = useCallback(
    async (clientId: string, draft: OutgoingDraft) => {
      const formData = new FormData();
      formData.set('requestId', requestId);
      formData.set('content', draft.content);
      if (draft.image) {
        formData.set('image', draft.image.blob, 'foto.jpg');
        formData.set('imageWidth', String(draft.image.width));
        formData.set('imageHeight', String(draft.image.height));
      }

      try {
        const result = await sendChatMessage(formData);
        if (!result.ok) {
          dispatch({ type: 'failed', clientId });
          toast.error(result.error);
          return;
        }
        dispatch({ type: 'confirmed', clientId, message: result.data });
      } catch {
        dispatch({ type: 'failed', clientId });
        toast.error('Se cortó la conexión. Toca "Reintentar" para volver a enviarlo.');
      }
    },
    [requestId],
  );

  const send = (draft: OutgoingDraft) => {
    const clientId = createId('local');
    if (draft.image) previewUrlsRef.current.add(draft.image.previewUrl);
    dispatch({ type: 'send', clientId, draft });
    void deliver(clientId, draft);
  };

  const retry = (clientId: string) => {
    const failed = messages.find((message) => message.clientId === clientId);
    if (!failed?.draft) return;
    dispatch({ type: 'retry', clientId });
    void deliver(clientId, failed.draft);
  };

  const notifyTyping = () => {
    // "Escribiendo…" es un extra: si falla, no se molesta a nadie.
    setTyping(requestId).catch(() => {});
  };

  const lastOwnSentIndex = messages.findLastIndex((message) => message.isMine && message.status === 'sent');

  return (
    <div className="flex flex-col gap-6">
      {messages.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-400">
          Todavía no hay mensajes. Escribe para empezar la conversación.
        </p>
      ) : null}

      <ol role="log" aria-label={`Conversación con ${counterpartName}`} className="flex flex-col gap-2">
        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const showDay = !previous || formatShortDate(previous.createdAt) !== formatShortDate(message.createdAt);
          return (
            <li key={message.clientId ?? message.id} className="flex flex-col">
              {showDay ? (
                <p className="my-3 text-center text-xs font-medium text-ink-400">{formatShortDate(message.createdAt)}</p>
              ) : null}
              <MessageBubble
                message={message}
                counterpartName={counterpartName}
                showReceiptLabel={index === lastOwnSentIndex}
                onRetry={retry}
              />
            </li>
          );
        })}
      </ol>

      <TypingIndicator isTyping={isCounterpartTyping} name={counterpartName} />
      <div ref={listEndRef} />

      <AnimatePresence>
        {hasNewBelow ? (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={() => {
              setHasNewBelow(false);
              listEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
            }}
            className="sticky bottom-28 z-10 mx-auto flex items-center gap-1.5 rounded-pill bg-ink-900/90 px-4 py-2 text-sm font-semibold text-white shadow-lift backdrop-blur-xl"
          >
            Mensajes nuevos
            <ChevronDownIcon size={16} strokeWidth={2.2} />
          </motion.button>
        ) : null}
      </AnimatePresence>

      {canWrite ? (
        <ChatComposer onSend={send} onTyping={notifyTyping} status={STATUS_COPY[streamStatus] ?? null} />
      ) : null}
    </div>
  );
}
