import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CheckIcon } from '@/components/icons';
import { PageHeader } from '@/components/layout/PageHeader';
import { SiteFooter } from '@/features/home/components/SiteFooter';
import { PetCard } from '@/features/pets/components/PetCard';
import { StarRating } from '@/features/reviews/components/StarRating';
import { TrustedBadge } from '@/features/reviews/components/TrustedBadge';
import { formatShortDate } from '@/lib/format';
import { SITE } from '@/lib/site';
import { listPublicPetsByOwner } from '@/server/pets';
import { getPublicProfile } from '@/server/reviews';

export const metadata: Metadata = {
  title: 'Perfil de confianza',
  // No indexado: es una página de reputación, no un destino de búsqueda.
  robots: { index: false, follow: true },
};

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getPublicProfile(id);
  if (!profile) notFound();

  const pets = await listPublicPetsByOwner(id);
  const { rating, reviews } = profile;

  return (
    <>
      <PageHeader />
      <main id="contenido" className="shell flex max-w-2xl flex-col gap-10 pb-section pt-8 sm:pt-12">
        <header className="flex flex-col items-center gap-3 rounded-panel border border-cream-300 bg-white p-8 text-center shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-400">Perfil de confianza</p>
          <StarRating value={rating.average ?? 0} size={28} />
          <p className="text-2xl font-semibold tracking-[-0.01em] text-ink-900">
            {rating.average ? rating.average.toFixed(1) : '—'}
            <span className="text-base font-normal text-ink-400"> / 5</span>
          </p>
          <p className="text-sm text-ink-500">
            {rating.count === 0
              ? 'Todavía no tiene reseñas'
              : rating.count === 1
                ? '1 reseña'
                : `${rating.count} reseñas`}
          </p>
          {rating.isTrusted ? <TrustedBadge /> : null}
          <p className="max-w-sm text-xs leading-relaxed text-ink-400">
            Las reseñas quedan sin nombre: en {SITE.name} protegemos la identidad de todas las familias,
            incluso al calificarse.
          </p>
        </header>

        {reviews.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink-900">Reseñas</h2>
            <ul className="flex flex-col gap-3">
              {reviews.map((review) => (
                <li key={review.id} className="rounded-card border border-cream-300 bg-white p-4">
                  <div className="flex items-center justify-between gap-2">
                    <StarRating value={review.rating} size={15} />
                    <span className="flex items-center gap-1 text-xs text-ink-400">
                      <CheckIcon size={13} className="text-sage-500" />
                      Adopción verificada · {formatShortDate(review.createdAt)}
                    </span>
                  </div>
                  {review.comment ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">{review.comment}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {pets.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink-900">Publicaciones en Homie</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {pets.map((pet) => (
                <PetCard key={pet.id} listing={pet} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
