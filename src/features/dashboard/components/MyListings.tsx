import Image from 'next/image';
import Link from 'next/link';

import { ChatIcon, InfoIcon, SpeciesIcon } from '@/components/icons';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { formatShortDate } from '@/lib/format';
import type { OwnerPet } from '@/server/pets';
import type { PetStatus } from '@/types/pet';
import { PetStatusActions } from './PetStatusActions';

/** En el panel, los estados se nombran desde la mirada de quien publica. */
const OWNER_STATUS: Record<PetStatus, { label: string; tone: 'clay' | 'sage' | 'honey' | 'neutral' }> = {
  publicada: { label: 'Activa', tone: 'sage' },
  'en-revision': { label: 'En revisión', tone: 'honey' },
  pausada: { label: 'Pausada', tone: 'neutral' },
  adoptada: { label: 'Adoptada', tone: 'clay' },
};

export function MyListings({ pets }: { pets: OwnerPet[] }) {
  if (pets.length === 0) {
    return (
      <EmptyState
        title="Todavía no publicaste"
        body="Cuando publiques a tu mascota, vas a verla acá con sus mensajes."
        action={{ href: '/#publicar', label: 'Publicar a mi mascota' }}
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {pets.map(({ listing, status, conversationCount, unreadCount, pendingReports }) => {
        const presentation = OWNER_STATUS[status];
        return (
          <li key={listing.id} className="surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-card bg-cream-200">
                {listing.photoUrl ? (
                  <Image
                    src={listing.photoUrl}
                    alt={listing.photoAlt}
                    fill
                    sizes="80px"
                    unoptimized={listing.photoUrl.startsWith('/api/fotos/')}
                    className={cn('object-cover', status !== 'publicada' && 'opacity-70 grayscale-[35%]')}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-cream-400">
                    <SpeciesIcon species={listing.species} size={32} />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/mascota/${listing.slug}`}
                    className="truncate text-lg font-semibold tracking-[-0.01em] text-ink-900 hover:text-clay-600"
                  >
                    {listing.name}
                  </Link>
                  <Badge tone={presentation.tone}>{presentation.label}</Badge>
                </div>
                <p className="text-sm text-ink-500">
                  {listing.ageLabel} · {listing.city} · desde el {formatShortDate(listing.publishedAt)}
                </p>
                <Link
                  href="/dashboard?tab=mensajes"
                  className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-clay-600"
                >
                  <ChatIcon size={15} />
                  {conversationCount === 0
                    ? 'Sin mensajes todavía'
                    : `${conversationCount} ${conversationCount === 1 ? 'interesado' : 'interesados'}`}
                  {unreadCount > 0 ? (
                    <span className="rounded-pill bg-clay-500 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-white">
                      {unreadCount} {unreadCount === 1 ? 'nuevo' : 'nuevos'}
                    </span>
                  ) : null}
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <PetStatusActions petId={listing.id} petName={listing.name} status={status} />
              {status === 'en-revision' ? (
                <p className="flex items-start gap-1.5 text-xs text-ink-400 sm:max-w-[16rem] sm:text-right">
                  <InfoIcon size={14} className="mt-px shrink-0" />
                  Recibió {pendingReports} {pendingReports === 1 ? 'reporte' : 'reportes'}. La estamos
                  revisando y te avisamos.
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-panel border border-dashed border-cream-400 px-6 py-14 text-center">
      <p className="text-lg font-semibold text-ink-900">{title}</p>
      <p className="max-w-sm text-[0.95rem] leading-relaxed text-ink-500">{body}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-2 inline-flex h-11 items-center rounded-pill bg-clay-500 px-5 font-semibold text-white hover:bg-clay-600"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
