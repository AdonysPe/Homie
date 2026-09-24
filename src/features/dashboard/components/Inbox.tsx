import Image from 'next/image';
import Link from 'next/link';

import { ChevronDownIcon, LockIcon } from '@/components/icons';
import { homeTypeLabel, REQUEST_STATUS_LABELS } from '@/features/adoption/lib/adoption-options';
import { cn } from '@/lib/cn';
import { formatInboxDate } from '@/lib/format';
import type { InboxGroup } from '@/server/messages';
import { EmptyState } from './MyListings';

/**
 * Bandeja estilo Mail: agrupada por mascota, con un punto para lo no leído.
 * Cada fila abre el hilo de la conversación.
 */
export function Inbox({ groups }: { groups: InboxGroup[] }) {
  if (groups.length === 0) {
    return (
      <EmptyState
        title="No hay solicitudes todavía"
        body="Cuando alguien se postule para adoptar a tu mascota, su carta de presentación va a aparecer aquí. Tu email y tu teléfono siguen ocultos."
      />
    );
  }

  const received = groups.filter((group) => group.role === 'owner');
  const sent = groups.filter((group) => group.role === 'adopter');

  return (
    <div className="flex flex-col gap-10">
      {received.length > 0 ? (
        <InboxSection title="Solicitudes recibidas" groups={received} />
      ) : null}
      {sent.length > 0 ? <InboxSection title="Tus postulaciones" groups={sent} /> : null}

      <p className="flex items-center justify-center gap-1.5 text-xs text-ink-400">
        <LockIcon size={13} />
        Tu email nunca se muestra. Tu teléfono se comparte solo si tú lo decides en cada solicitud.
      </p>
    </div>
  );
}

function InboxSection({ title, groups }: { title: string; groups: InboxGroup[] }) {
  return (
    <section className="flex flex-col gap-4" aria-label={title}>
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-ink-400">{title}</h2>
      {groups.map((group) => (
        <div key={`${group.role}-${group.pet.id}`} className="overflow-hidden rounded-panel border border-cream-300 bg-white">
          <div className="flex items-center gap-3 border-b border-cream-300 bg-cream-50 px-4 py-3">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-cream-200">
              {group.pet.photoUrl ? (
                <Image
                  src={group.pet.photoUrl}
                  alt=""
                  fill
                  sizes="36px"
                  unoptimized={group.pet.photoUrl.startsWith('/api/fotos/')}
                  className="object-cover"
                />
              ) : null}
            </div>
            <h3 className="flex-1 font-semibold text-ink-900">{group.pet.name}</h3>
            {group.unreadCount > 0 ? (
              <span className="text-xs font-semibold text-clay-600">
                {group.unreadCount} sin leer
              </span>
            ) : null}
          </div>

          <ul className="divide-y divide-cream-300">
            {group.requests.map((request) => {
              const isUnread = request.unread;
              return (
                <li key={request.id}>
                  <Link
                    href={`/dashboard/mensajes/${request.id}`}
                    className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-cream-50 focus-visible:ring-inset focus-visible:ring-offset-0"
                  >
                    <span
                      aria-hidden
                      className={cn('mt-2 h-2.5 w-2.5 shrink-0 rounded-full', isUnread ? 'bg-clay-500' : 'bg-transparent')}
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className={cn('truncate text-[0.95rem] text-ink-900', isUnread ? 'font-semibold' : 'font-medium')}>
                          {request.counterpart}
                          {isUnread ? <span className="sr-only"> (no leído)</span> : null}
                        </span>
                        <time dateTime={request.lastActivityAt} className="shrink-0 text-xs text-ink-400">
                          {formatInboxDate(request.lastActivityAt)}
                        </time>
                      </span>
                      <span className="text-xs text-ink-400">
                        {request.role === 'owner'
                          ? `${request.adopterCity} · ${homeTypeLabel(request.homeType)} · `
                          : ''}
                        {REQUEST_STATUS_LABELS[request.status]}
                      </span>
                      <span className={cn('line-clamp-2 text-sm leading-snug', isUnread ? 'text-ink-700' : 'text-ink-400')}>
                        {request.previewIsMine ? 'Tú: ' : ''}
                        {request.preview}
                      </span>
                    </span>
                    <ChevronDownIcon
                      size={16}
                      className="mt-1.5 shrink-0 -rotate-90 text-ink-300 transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
