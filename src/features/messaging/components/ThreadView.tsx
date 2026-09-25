'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { LockIcon, ShieldIcon, WhatsAppIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { toast } from '@/components/ui/Toast';
import { formatShortDate } from '@/lib/format';
import { homeTypeLabel, REQUEST_STATUS_LABELS } from '@/features/adoption/lib/adoption-options';
import { ChatWindow } from '@/features/chat/components/ChatWindow';
import { shareContact } from '@/server/actions/messages';
import type { Thread } from '@/server/messages';

/**
 * Hilo de una solicitud: aviso de privacidad, la carta de presentación fija arriba
 * y debajo el chat en tiempo real.
 */
export function ThreadView({ thread, canWrite }: { thread: Thread; canWrite: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      <PrivacyBanner thread={thread} />

      <RequestCard thread={thread} />

      <ChatWindow
        requestId={thread.id}
        counterpartName={thread.counterpart}
        initialMessages={thread.messages}
        serverNow={thread.serverNow}
        hasUnread={thread.hasUnread}
        canWrite={canWrite}
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
        La familia está leyendo tu carta. Cuando lo decida, va a compartir su contacto aquí.
      </p>
    );
  }

  const { ownerName, method, value, microchipNumber } = thread.sharedContact;
  const href = method === 'whatsapp' ? `https://wa.me/${value.replace(/\D/g, '')}` : `mailto:${value}`;

  return (
    <div className="flex flex-col gap-3 rounded-panel border border-sage-200 bg-sage-50 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-sage-800">
        <ShieldIcon size={18} className="text-sage-600" />
        {ownerName} compartió su contacto contigo
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

/** La carta de presentación: el punto de partida de toda la conversación. */
function RequestCard({ thread }: { thread: Thread }) {
  const { request } = thread;
  const isOwner = thread.role === 'owner';

  return (
    <article className="flex flex-col gap-3 rounded-panel border border-cream-300 bg-white p-5 shadow-soft">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-400">
          {isOwner ? 'Carta de presentación' : 'Tu carta de presentación'}
        </p>
        <span className="text-xs text-ink-400">
          {formatShortDate(request.createdAt)} · {REQUEST_STATUS_LABELS[request.status]}
        </span>
      </header>
      <div>
        <p className="text-lg font-semibold tracking-[-0.01em] text-ink-900">{request.adopterName}</p>
        <p className="text-sm text-ink-500">
          {request.adopterCity} · {homeTypeLabel(request.homeType)}
        </p>
      </div>
      <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed text-ink-700">{request.message}</p>
    </article>
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
        {thread.counterpart} no ve tu teléfono ni tu email. Compártelo solo cuando te sientas seguro.
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
