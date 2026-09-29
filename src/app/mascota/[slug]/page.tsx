import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { SiteFooter } from '@/features/home/components/SiteFooter';
import type { AdoptionCtaState } from '@/features/adoption/components/AdoptionRequestButton';
import { PetDetail } from '@/features/pet-detail/components/PetDetail';
import { buildPetMetadata } from '@/features/pet-detail/lib/pet-seo';
import { findRequestId } from '@/server/messages';
import { getPetBySlug, type PetPageData } from '@/server/pets';
import { getRatingSummary } from '@/server/reviews';
import { getCurrentUser, type CurrentUser } from '@/server/session';

interface PetPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pet = await getPetBySlug(slug);
  if (!pet) return {};

  const metadata = buildPetMetadata(pet.listing);
  // Solo las publicaciones activas compiten en buscadores.
  return pet.status === 'publicada' ? metadata : { ...metadata, robots: { index: false, follow: true } };
}

const CLOSED_REASONS: Partial<Record<PetPageData['status'], string>> = {
  adoptada: 'Ya encontró su hogar',
  pausada: 'La familia pausó la publicación',
  'en-revision': 'Publicación en revisión',
};

async function resolveAdoptionCta(pet: PetPageData, user: CurrentUser | null): Promise<AdoptionCtaState> {
  if (user?.id === pet.ownerId) return { kind: 'owner' };

  const closedReason = CLOSED_REASONS[pet.status];
  if (!user) {
    return closedReason
      ? { kind: 'closed', reason: closedReason }
      : { kind: 'anonymous', signInHref: `/ingresar?volver=${encodeURIComponent(`/mascota/${pet.listing.slug}`)}` };
  }

  // Quien ya se postuló siempre puede volver a su solicitud, aunque la publicación cierre.
  const requestId = await findRequestId(pet.listing.id, user.id);
  if (requestId) return { kind: 'requested', requestId };
  if (closedReason) return { kind: 'closed', reason: closedReason };
  if (!user.emailVerified) return { kind: 'unverified' };
  return { kind: 'ready', suggestedName: user.name };
}

export default async function PetPage({ params }: PetPageProps) {
  const { slug } = await params;
  const [pet, user] = await Promise.all([getPetBySlug(slug), getCurrentUser()]);
  if (!pet) notFound();

  const isOwner = user?.id === pet.ownerId;
  // Una publicación pausada desaparece para todos menos para su familia.
  if (pet.status === 'pausada' && !isOwner) notFound();

  const [adoptionCta, ownerRating] = await Promise.all([
    resolveAdoptionCta(pet, user),
    getRatingSummary(pet.ownerId),
  ]);

  return (
    <>
      <PageHeader backHref="/#mascotas" backLabel="Mascotas" />
      <PetDetail
        pet={pet.listing}
        status={pet.status}
        isOwner={isOwner}
        adoptionCta={adoptionCta}
        ownerId={pet.ownerId}
        ownerRating={ownerRating}
      />
      <SiteFooter />
    </>
  );
}
