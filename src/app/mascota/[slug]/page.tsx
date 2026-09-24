import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { SiteFooter } from '@/features/home/components/SiteFooter';
import { PetDetail } from '@/features/pet-detail/components/PetDetail';
import { buildPetMetadata } from '@/features/pet-detail/lib/pet-seo';
import { findListingBySlug, SEED_LISTINGS } from '@/features/pets/lib/pets-data';

interface PetPageProps {
  params: Promise<{ slug: string }>;
}

// Cada ficha se genera estática en el build: carga instantánea y SEO completo.
export const dynamicParams = false;

export function generateStaticParams() {
  return SEED_LISTINGS.filter((listing) => listing.slug).map((listing) => ({ slug: listing.slug! }));
}

export async function generateMetadata({ params }: PetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pet = findListingBySlug(slug);
  return pet ? buildPetMetadata(pet) : {};
}

export default async function PetPage({ params }: PetPageProps) {
  const { slug } = await params;
  const pet = findListingBySlug(slug);
  if (!pet) notFound();

  return (
    <>
      <PageHeader backHref="/#mascotas" backLabel="Mascotas" />
      <PetDetail pet={pet} />
      <SiteFooter />
    </>
  );
}
