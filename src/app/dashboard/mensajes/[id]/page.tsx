import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { ResendVerificationButton } from '@/features/auth/components/ResendVerificationButton';
import { ThreadView } from '@/features/messaging/components/ThreadView';
import { getThread } from '@/server/messages';
import { requireUserOrRedirect } from '@/server/session';

export const metadata: Metadata = { title: 'Conversación', robots: { index: false } };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUserOrRedirect(`/dashboard/mensajes/${id}`);

  // Si no participa, se responde igual que si no existiera: no se filtra información.
  const thread = await getThread(id, user.id);
  if (!thread) notFound();

  return (
    <>
      <PageHeader backHref="/dashboard?tab=mensajes" backLabel="Mensajes" />
      <main id="contenido" className="shell flex max-w-2xl flex-col gap-6 pt-6 sm:pt-10">
        <header className="flex items-center gap-3">
          <Link
            href={`/mascota/${thread.pet.slug}`}
            className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-cream-200"
            aria-label={`Ver la publicación de ${thread.pet.name}`}
          >
            {thread.pet.photoUrl ? (
              <Image
                src={thread.pet.photoUrl}
                alt=""
                fill
                sizes="48px"
                unoptimized={thread.pet.photoUrl.startsWith('/api/fotos/')}
                className="object-cover"
              />
            ) : null}
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-[-0.02em] text-ink-900">{thread.counterpart}</h1>
            <p className="text-sm text-ink-500">
              {thread.role === 'owner' ? `Interesado en ${thread.pet.name}` : `Tu consulta por ${thread.pet.name}`}
            </p>
          </div>
        </header>

        {!user.emailVerified ? (
          <div className="rounded-card bg-honey-200/50 p-4 text-sm text-ink-700">
            Confirma tu email para poder responder. <ResendVerificationButton />
          </div>
        ) : null}

        <ThreadView thread={thread} canWrite={user.emailVerified} />
      </main>
    </>
  );
}
