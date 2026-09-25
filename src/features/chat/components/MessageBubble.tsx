'use client';

import { motion } from 'framer-motion';

import { CheckCheckIcon, CheckIcon, InfoIcon } from '@/components/icons';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';
import type { LocalMessage } from '../lib/chat-state';
import { RelativeTime } from './RelativeTime';

interface MessageBubbleProps {
  message: LocalMessage;
  counterpartName: string;
  /** Solo el último mensaje propio muestra el texto "Visto"/"Enviado", como en Mensajes. */
  showReceiptLabel: boolean;
  onRetry: (clientId: string) => void;
}

export function MessageBubble({ message, counterpartName, showReceiptLabel, onRetry }: MessageBubbleProps) {
  const { isMine, image, content, status } = message;

  return (
    <motion.div
      // Solo los mensajes nuevos entran animados; el historial aparece quieto.
      initial={message.clientId || status !== 'sent' ? { opacity: 0, y: 8, scale: 0.98 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 520, damping: 34 }}
      className={cn('flex flex-col gap-1', isMine ? 'items-end' : 'items-start')}
    >
      <p className="sr-only">{isMine ? 'Tú' : counterpartName}:</p>

      {image ? (
        <a
          href={image.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir la foto en tamaño completo"
          className={cn(
            'block max-w-[70%] overflow-hidden rounded-[1.25rem] bg-cream-200 sm:max-w-[16rem]',
            isMine ? 'rounded-br-md' : 'rounded-bl-md',
            status === 'pending' && 'opacity-70',
          )}
          style={{ aspectRatio: `${image.width} / ${image.height}`, width: image.width >= image.height ? '16rem' : '12rem' }}
        >
          {/* Foto privada del chat: se sirve con la sesión (no pasa por el optimizador público). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={isMine ? 'Foto que enviaste' : `Foto de ${counterpartName}`} className="h-full w-full object-cover" />
        </a>
      ) : null}

      {content ? (
        <div
          className={cn(
            'max-w-[85%] whitespace-pre-wrap break-words rounded-[1.25rem] px-4 py-2.5 text-[0.95rem] leading-relaxed sm:max-w-[75%]',
            isMine ? 'rounded-br-md bg-clay-500 text-white' : 'rounded-bl-md border border-cream-300 bg-white text-ink-900',
            status === 'pending' && 'opacity-70',
            status === 'failed' && 'bg-clay-300',
          )}
        >
          {content}
        </div>
      ) : null}

      <MessageMeta message={message} showReceiptLabel={showReceiptLabel} onRetry={onRetry} />
    </motion.div>
  );
}

function MessageMeta({
  message,
  showReceiptLabel,
  onRetry,
}: {
  message: LocalMessage;
  showReceiptLabel: boolean;
  onRetry: (clientId: string) => void;
}) {
  const base = 'flex items-center gap-1 px-1 text-[0.7rem] text-ink-400';

  if (message.status === 'pending') {
    return (
      <span className={base}>
        <Spinner size={11} />
        Enviando…
      </span>
    );
  }

  if (message.status === 'failed' && message.clientId) {
    const clientId = message.clientId;
    return (
      <span className={cn(base, 'text-clay-600')}>
        <InfoIcon size={12} />
        No se envió ·
        <button type="button" onClick={() => onRetry(clientId)} className="font-semibold underline underline-offset-2">
          Reintentar
        </button>
      </span>
    );
  }

  if (!message.isMine) {
    return <RelativeTime iso={message.createdAt} className={base} />;
  }

  const isRead = Boolean(message.readAt);
  return (
    <span className={base}>
      <RelativeTime iso={message.createdAt} />
      <span aria-hidden className={cn('flex', isRead ? 'text-sage-500' : 'text-ink-300')}>
        {isRead ? <CheckCheckIcon size={14} strokeWidth={2} /> : <CheckIcon size={13} strokeWidth={2} />}
      </span>
      {showReceiptLabel ? (
        <span className={isRead ? 'font-medium text-sage-600' : undefined}>{isRead ? 'Visto' : 'Enviado'}</span>
      ) : (
        <span className="sr-only">{isRead ? 'Visto' : 'Enviado'}</span>
      )}
    </span>
  );
}
