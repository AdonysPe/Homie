'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useOptimistic, useRef, useState, useTransition, type KeyboardEvent } from 'react';

import { LockIcon, SendIcon, ShieldIcon, WhatsAppIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { formatMessageTime, formatShortDate } from '@/lib/format';
import { markConversationRead, sendReply, shareContact } from '@/server/actions/messages';
import type { Thread, ThreadMessage } from '@/server/messages';
import { MESSAGE_MAX } from '../lib/message-schema';

type OptimisticMessage = ThreadMessage & { pending?: boolean };

export function ThreadView({ thread, hasUnread }: { thread: Thread; hasUnread: boolean }) {
  const router = useRouter();
  const listEndRef = useRef<HTMLDivElement>(null);
  const [messages, addOptimistic] = useOptimistic<OptimisticMessage[], OptimisticMessage>(
    thread.messages,
    (current, message) => [...current, message],
  );

  // Al abrir el hilo, lo recibido se marca como leído (y se actualiza el contador del header).
  useEffect(() => {
    if (!hasUnread) return;
    void markConversationRead(thread.id).then(() => router.refresh());
  }, [hasUnread, router, thread.id]);

  // Siempre mostrar lo último, como en cualquier app de mensajes.
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  return (
    <div className="flex flex-col gap-6">
      <PrivacyBanner thread={thread} />

      <ol className="flex flex-col gap-2" aria-label={`Conversación con ${thread.counterpart}`}>
        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const showDay =
            !previous || formatShortDate(previous.createdAt) !== formatShortDate(message.createdAt);
          return (
            <li key={message.id} className="flex flex-col">
              {showDay ? (
                <p className="my-3 text-center text-xs font-medium text-ink-400">{formatShortDate(message.createdAt)}</p>
              ) : null}
              <div className={cn('flex flex-col gap-1', message.isMine ? 'items-end' : 'items-start')}>
                <p className="sr-only">{message.isMine ? 'Vos' : thread.counterpart}:</p>
                <div
                  className={cn(
                    'max-w-[85%] whitespace-pre-wrap break-words rounded-[1.25rem] px-4 py-2.5 text-[0.95rem] leading-relaxed sm:max-w-[75%]',
                    message.isMine
                      ? 'rounded-br-md bg-clay-500 text-white'
                      : 'rounded-bl-md border border-cream-300 bg-white text-ink-900',
                    message.pending && 'opacity-60',
                  )}
                >
                  {message.content}
                </div>
                <span className="px-1 text-[0.7rem] text-ink-400">
                  {message.pending ? 'Enviando…' : formatMessageTime(message.createdAt)}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      <div ref={listEndRef} />

      <Composer
        conversationId={thread.id}
        onOptimisticSend={(content) =>
          addOptimistic({
            id: `pending-${Date.now()}`,
            content,
            createdAt: new Date().toISOString(),
            isMine: true,
            pending: true,
          })
        }
      />
    </div>
  );
}

function PrivacyBanner({ thread }: { thread: Thread }) {
  if (thread.role === 'owner') {
    return thread.contactSharedAt ? (
      <p className="flex items-start gap-2 rounded-card bg-sage-50 p-3.5 text-sm text-sage-800">
        <ShieldIcon size={18} className="mt-px shrink-0 text-sage-600" />
        Compartiste tu contacto con {thread.counterpart} el {formatShortDate(thread.contactSharedAt)}.
      </p>
    ) : (
      <ShareContactCard thread={thread} />
    );
  }

  if (!thread.sharedContact) {
    return (
      <p className="flex items-start gap-2 rounded-card bg-cream-200/70 p-3.5 text-sm text-ink-500">
        <LockIcon size={17} className="mt-px shrink-0 text-sage-600" />
        La familia ve solo el nombre que elegiste. Cuando lo decida, va a compartir su contacto acá.
      </p>
    );
  }

  const { ownerName, method, value, microchipNumber } = thread.sharedContact;
  const href = method === 'whatsapp' ? `https://wa.me/${value.replace(/\D/g, '')}` : `mailto:${value}`;

  return (
    <div className="flex flex-col gap-3 rounded-panel border border-sage-200 bg-sage-50 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-sage-800">
        <ShieldIcon size={18} className="text-sage-600" />
        {ownerName} compartió su contacto con vos
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-11 items-center justify-center gap-2 rounded-pill bg-white font-semibold text-ink-900 shadow-soft transition-colors hover:bg-cream-50"
      >
        {method === 'whatsapp' ? <WhatsAppIcon size={19} className="text-[#25D366]" /> : null}
        {value}
      </a>
      {microchipNumber ? (
        <p className="text-xs text-sage-800">Número de microchip: {microchipNumber}</p>
      ) : null}
    </div>
  );
}

/** Revelar el contacto es una decisión consciente e irreversible: se confirma aparte. */
function ShareContactCard({ thread }: { thread: Thread }) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      const result = await shareContact(thread.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setIsConfirmOpen(false);
      toast.success(`Compartiste tu contacto con ${thread.counterpart}`);
      router.refresh();
    });

  return (
    <div className="flex flex-col gap-3 rounded-panel border border-cream-300 bg-cream-50 p-4 sm:flex-row sm:items-center">
      <p className="flex flex-1 items-start gap-2 text-sm text-ink-500">
        <LockIcon size={17} className="mt-px shrink-0 text-sage-600" />
        {thread.counterpart} no ve tu teléfono ni tu email. Compartilo solo cuando te sientas seguro.
      </p>
      <Button variant="secondary" size="sm" onClick={() => setIsConfirmOpen(true)}>
        Compartir mi contacto
      </Button>

      <Sheet
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={`¿Compartir tu contacto con ${thread.counterpart}?`}
        description="Va a ver tu nombre y el WhatsApp o email que cargaste al publicar (y el número de microchip, si lo cargaste). Solo esta persona, y no se puede deshacer."
      >
        <div className="flex flex-col gap-2 pt-2">
          <Button size="lg" fullWidth onClick={confirm} isLoading={isPending}>
            Sí, compartir
          </Button>
          <Button variant="ghost" size="lg" fullWidth onClick={() => setIsConfirmOpen(false)} disabled={isPending}>
            Todavía no
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function Composer({
  conversationId,
  onOptimisticSend,
}: {
  conversationId: string;
  onOptimisticSend: (content: string) => void;
}) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const trimmed = content.trim();

  const send = () => {
    if (!trimmed || isPending) return;
    const draft = content;
    setContent('');
    startTransition(async () => {
      onOptimisticSend(trimmed);
      const result = await sendReply({ conversationId, content: trimmed });
      if (!result.ok) {
        setContent(draft);
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  };

  // ⌘/Ctrl + Enter envía; Enter solo agrega una línea (en móvil no hay otra forma de hacerlo).
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      send();
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
      className="sticky bottom-0 -mx-1 flex items-end gap-2 rounded-t-[1.5rem] bg-cream-100/90 px-1 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl"
    >
      <label htmlFor="reply" className="sr-only">
        Escribí tu respuesta
      </label>
      <textarea
        id="reply"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        maxLength={MESSAGE_MAX}
        placeholder="Escribí un mensaje"
        className="max-h-40 min-h-[2.875rem] flex-1 resize-none rounded-[1.4rem] border border-cream-400 bg-white px-4 py-3 text-[0.95rem] leading-snug [field-sizing:content] placeholder:text-ink-300"
      />
      <button
        type="submit"
        disabled={!trimmed || isPending}
        aria-label="Enviar"
        className="flex h-[2.875rem] w-[2.875rem] shrink-0 items-center justify-center rounded-full bg-clay-500 text-white transition-all hover:bg-clay-600 disabled:bg-cream-400"
      >
        {isPending ? <Spinner size={18} /> : <SendIcon size={20} strokeWidth={2.2} />}
      </button>
    </form>
  );
}
