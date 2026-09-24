import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import {
  CheckIcon,
  ChipIcon,
  HeartPulseIcon,
  HomeHeartIcon,
  InfoIcon,
  LockIcon,
  MinusIcon,
  PillIcon,
  ShieldIcon,
  SpeciesIcon,
  SyringeIcon,
} from '@/components/icons';
import { ScrollZoomImage } from '@/components/motion/ScrollZoomImage';
import { Badge } from '@/components/ui/Badge';
import { VerifiedBadge } from '@/features/auth/components/VerifiedBadge';
import {
  AdoptionRequestButton,
  type AdoptionCtaState,
} from '@/features/adoption/components/AdoptionRequestButton';
import { statusPresentation } from '@/features/pets/lib/listing-status';
import { ReportButton } from '@/features/reports/components/ReportButton';
import { cn } from '@/lib/cn';
import { idealHomeLabel, sexLabel, sizeLabel, speciesLabel } from '@/lib/pet-catalog';
import { absoluteUrl, SITE } from '@/lib/site';
import type { PetListing, PetStatus } from '@/types/pet';
import { petPath } from '../lib/pet-seo';
import { ShareBar, SharePanel } from './ShareActions';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink-900">{title}</h2>
      {children}
    </section>
  );
}

function HealthRow({ label, ok, icon }: { label: string; ok: boolean; icon: ReactNode }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span
        aria-hidden
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.6rem]',
          ok ? 'bg-sage-100 text-sage-700' : 'bg-cream-200 text-ink-400',
        )}
      >
        {icon}
      </span>
      <span className="flex-1 text-[0.95rem] text-ink-900">{label}</span>
      <span className={cn('flex items-center gap-1 text-sm font-medium', ok ? 'text-sage-700' : 'text-ink-400')}>
        {ok ? <CheckIcon size={16} strokeWidth={2.2} /> : <MinusIcon size={16} />}
        {ok ? 'Sí' : 'No'}
      </span>
    </li>
  );
}

interface PetDetailProps {
  pet: PetListing;
  /** Estado real en la base (el de `pet.status` es el de presentación). */
  status: PetStatus;
  isOwner: boolean;
  adoptionCta: AdoptionCtaState;
}

const STATUS_NOTICES: Partial<Record<PetStatus, { title: string; body: string }>> = {
  'en-revision': {
    title: 'Publicación en revisión',
    body: 'Recibimos reportes sobre esta publicación y la estamos revisando. Mientras tanto no recibe mensajes nuevos.',
  },
  pausada: {
    title: 'Publicación pausada',
    body: 'Solo tú la ves. Reanúdala desde tu panel cuando quieras volver a recibir mensajes.',
  },
};

export function PetDetail({ pet, status: petStatus, isOwner, adoptionCta }: PetDetailProps) {
  const status = statusPresentation(pet.status);
  const isAdopted = petStatus === 'adoptada';
  const isActive = petStatus === 'publicada';
  const notice = STATUS_NOTICES[petStatus];
  const size = sizeLabel(pet.species, pet.size);
  const canonicalUrl = absoluteUrl(petPath(pet));

  const facts = [
    { label: 'Edad', value: pet.ageLabel },
    { label: 'Género', value: sexLabel(pet.sex) },
    { label: 'Tamaño', value: size ?? 'No aplica' },
    { label: 'Distrito', value: pet.city },
  ];

  const sharePet = {
    name: pet.name,
    species: pet.species,
    sex: pet.sex,
    ageLabel: pet.ageLabel,
    city: pet.city,
  };

  return (
    <>
      <main id="contenido" className="shell pb-40 pt-6 sm:pt-10 lg:pb-section">
        <nav aria-label="Ruta de navegación" className="mb-5 text-sm text-ink-400">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/#mascotas" className="transition-colors hover:text-clay-600">
                Mascotas
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="font-medium text-ink-700">
              {pet.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <article className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              {pet.photoUrl ? (
                <ScrollZoomImage
                  src={pet.photoUrl}
                  alt={pet.photoAlt}
                  priority
                  unoptimized={pet.photoUrl.startsWith('/api/fotos/')}
                  sizes="(max-width: 1024px) 100vw, 46rem"
                  className="aspect-[4/3] rounded-panel shadow-soft sm:aspect-[16/10]"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-panel bg-cream-200 text-cream-400 sm:aspect-[16/10]">
                  <SpeciesIcon species={pet.species} size={72} />
                </div>
              )}

              {pet.gallery && pet.gallery.length > 0 ? (
                <ul className="grid grid-cols-4 gap-2" aria-label={`Más fotos de ${pet.name}`}>
                  {pet.gallery.map((photo) => (
                    <li key={photo.url} className="relative aspect-square overflow-hidden rounded-card bg-cream-200">
                      <Image
                        src={photo.url}
                        alt={photo.alt}
                        fill
                        sizes="12rem"
                        unoptimized={photo.url.startsWith('/api/fotos/')}
                        className="object-cover"
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <header className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={status.tone}>{status.label}</Badge>
                <span className="flex items-center gap-1.5 text-sm text-ink-500">
                  <SpeciesIcon species={pet.species} size={16} />
                  {speciesLabel(pet.species)}
                </span>
              </div>
              <h1 className="text-display-md font-display text-balance">{pet.name}</h1>
              <p className="text-lede text-ink-500">{pet.highlight}</p>
              {pet.ownerVerified ? (
                <VerifiedBadge verified label="Publicado por una familia verificada" className="self-start" />
              ) : null}
            </header>

            {notice ? (
              <div role="status" className="flex items-start gap-3 rounded-card bg-honey-200/60 p-4 text-ink-700">
                <InfoIcon size={20} className="mt-0.5 shrink-0 text-honey-600" />
                <p className="leading-snug">
                  <strong className="font-semibold">{notice.title}.</strong> {notice.body}
                </p>
              </div>
            ) : null}

            {isAdopted ? (
              <div className="flex items-start gap-3 rounded-card bg-sage-50 p-4 text-sage-800">
                <HomeHeartIcon size={22} className="mt-0.5 shrink-0 text-sage-600" />
                <p className="leading-snug">
                  <strong className="font-semibold">{pet.name} ya encontró su hogar.</strong> Gracias a
                  todos los que compartieron su historia.
                </p>
              </div>
            ) : null}

            {/* Ficha técnica: lectura de un vistazo, como una hoja de especificaciones. */}
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-cream-300 bg-cream-300 sm:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-1 bg-white p-4">
                  <dt className="text-xs font-medium uppercase tracking-[0.08em] text-ink-400">{fact.label}</dt>
                  <dd className="text-lg font-semibold tracking-[-0.01em] text-ink-900">{fact.value}</dd>
                </div>
              ))}
            </dl>

            {pet.description ? (
              <Section title={`Sobre ${pet.name}`}>
                <p className="max-w-prose text-[1.0625rem] leading-relaxed text-ink-700">{pet.description}</p>
              </Section>
            ) : null}

            <Section title="Salud">
              <ul className="divide-y divide-cream-300 overflow-hidden rounded-card border border-cream-300 bg-white">
                <HealthRow label="Castrado / esterilizado" ok={pet.health.sterilized} icon={<HeartPulseIcon size={18} />} />
                <HealthRow label="Vacunado al día" ok={pet.health.vaccinated} icon={<SyringeIcon size={18} />} />
                <HealthRow label="Desparasitado" ok={pet.health.dewormed} icon={<PillIcon size={18} />} />
                <HealthRow label="Microchip" ok={pet.health.microchip} icon={<ChipIcon size={18} />} />
              </ul>
            </Section>

            {pet.specialNeeds ? (
              <Section title="Necesidades especiales">
                <div className="flex items-start gap-3 rounded-card bg-honey-200/50 p-4 text-ink-700">
                  <InfoIcon size={20} className="mt-0.5 shrink-0 text-honey-600" />
                  <p className="leading-snug">{pet.specialNeeds}</p>
                </div>
              </Section>
            ) : null}

            <Section title="Hogar ideal">
              <div className="flex flex-wrap gap-2">
                <Badge tone="clay" className="px-3 py-1.5 text-sm">
                  <HomeHeartIcon size={16} />
                  {idealHomeLabel(pet.idealHome)}
                </Badge>
                <Badge tone={pet.goodWithKids ? 'sage' : 'neutral'} className="px-3 py-1.5 text-sm">
                  {pet.goodWithKids ? 'Se lleva bien con niños' : 'Mejor sin niños pequeños'}
                </Badge>
                <Badge tone={pet.goodWithPets ? 'sage' : 'neutral'} className="px-3 py-1.5 text-sm">
                  {pet.goodWithPets ? 'Convive con otras mascotas' : 'Mejor como única mascota'}
                </Badge>
              </div>
            </Section>

            <div className="flex items-start gap-3 rounded-card border border-cream-300 bg-cream-50 p-4 text-sm text-ink-500">
              <ShieldIcon size={20} className="mt-0.5 shrink-0 text-sage-600" />
              <p className="leading-snug">
                Publicación directa de su familia, sin intermediarios. En {SITE.name} el teléfono y el
                email de la familia están ocultos: tú te presentas con una carta, ella decide si responde
                y cuándo compartir su WhatsApp.
              </p>
            </div>

            {!isOwner ? (
              <div>
                <ReportButton petId={pet.id} petName={pet.name} />
              </div>
            ) : null}
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-4">
              {!isAdopted || adoptionCta.kind === 'requested' ? (
                <div className="surface flex flex-col gap-4 p-5">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">¿Te interesa {pet.name}?</p>
                    <p className="mt-1 flex items-start gap-1.5 text-sm leading-snug text-ink-500">
                      <LockIcon size={15} className="mt-0.5 shrink-0 text-sage-600" />
                      Preséntate con una carta: la familia la lee y te responde por el chat de {SITE.name}.
                    </p>
                  </div>
                  <AdoptionRequestButton petId={pet.id} petName={pet.name} state={adoptionCta} />
                </div>
              ) : null}
              {isActive ? <SharePanel pet={sharePet} canonicalUrl={canonicalUrl} /> : null}
            </div>
          </aside>
        </div>
      </main>

      {isActive ? (
        <ShareBar
          pet={sharePet}
          canonicalUrl={canonicalUrl}
          primaryAction={
            <AdoptionRequestButton petId={pet.id} petName={pet.name} state={adoptionCta} variant="bar" />
          }
        />
      ) : !isAdopted || adoptionCta.kind === 'requested' ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-300 bg-cream-50/85 px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
          <AdoptionRequestButton petId={pet.id} petName={pet.name} state={adoptionCta} variant="bar" />
        </div>
      ) : null}
    </>
  );
}
