import type { Metadata } from 'next';
import Link from 'next/link';

import { PageHeader } from '@/components/layout/PageHeader';
import { ResendVerificationButton } from '@/features/auth/components/ResendVerificationButton';
import { VerifiedBadge } from '@/features/auth/components/VerifiedBadge';
import { Inbox } from '@/features/dashboard/components/Inbox';
import { MyListings } from '@/features/dashboard/components/MyListings';
import { cn } from '@/lib/cn';
import { listInbox } from '@/server/messages';
import { listOwnerPets } from '@/server/pets';
import { requireUserOrRedirect } from '@/server/session';

export const metadata: Metadata = { title: 'Mi panel', robots: { index: false } };

type Tab = 'publicaciones' | 'mensajes';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab: Tab = tabParam === 'mensajes' ? 'mensajes' : 'publicaciones';
  const user = await requireUserOrRedirect(`/dashboard${tab === 'mensajes' ? '?tab=mensajes' : ''}`);

  const [pets, inbox] = await Promise.all([listOwnerPets(user.id), listInbox(user.id)]);
  const unread = inbox.reduce((total, group) => total + group.unreadCount, 0);

  const tabs: { id: Tab; label: string; badge?: number; href: string }[] = [
    { id: 'publicaciones', label: 'Mis publicaciones', href: '/dashboard' },
    { id: 'mensajes', label: 'Mensajes', badge: unread, href: '/dashboard?tab=mensajes' },
  ];

  return (
    <>
      <PageHeader />
      <main id="contenido" className="shell max-w-3xl pb-section pt-8 sm:pt-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-display-md font-display">Hola, {user.name.split(' ')[0]}</h1>
          <VerifiedBadge verified={user.emailVerified} className="self-start" />
        </header>

        {!user.emailVerified ? (
          <div className="mt-6 rounded-card border border-honey-400/50 bg-honey-200/40 p-4 text-sm text-ink-700">
            <p className="leading-snug">
              <strong className="font-semibold">Confirma tu email</strong> para publicar y responder
              mensajes. Busca el enlace que te enviamos.
            </p>
            <ResendVerificationButton className="mt-2" />
          </div>
        ) : null}

        {/* Control segmentado estilo iOS. Son enlaces: cada pestaña tiene URL propia. */}
        <nav aria-label="Secciones del panel" className="mt-8 inline-flex w-full rounded-pill bg-cream-200 p-1 sm:w-auto">
          {tabs.map((item) => {
            const isActive = item.id === tab;
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-pill px-5 py-2 text-sm font-semibold transition-all duration-200 sm:flex-none',
                  isActive ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-900',
                )}
              >
                {item.label}
                {item.badge ? (
                  <span className="min-w-5 rounded-pill bg-clay-500 px-1.5 text-center text-xs tabular-nums leading-5 text-white">
                    {item.badge}
                    <span className="sr-only"> sin leer</span>
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6">{tab === 'publicaciones' ? <MyListings pets={pets} /> : <Inbox groups={inbox} />}</div>
      </main>
    </>
  );
}
