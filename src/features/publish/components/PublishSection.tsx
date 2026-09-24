'use client';

import Link from 'next/link';

import { LockIcon, MailIcon, ShieldIcon } from '@/components/icons';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ResendVerificationButton } from '@/features/auth/components/ResendVerificationButton';
import { PublishWizard } from './PublishWizard';

/** Quién mira la sección. La autorización real está en la Server Action `publishPet`. */
export type PublishAccess = 'anonymous' | 'unverified' | 'ready';

const RETURN = encodeURIComponent('/#publicar');

export function PublishSection({ access }: { access: PublishAccess }) {
  return (
    <section
      id="publicar"
      className="flex min-h-[100svh] scroll-mt-14 flex-col justify-center bg-cream-100 py-section"
      aria-labelledby="publicar-titulo"
    >
      <div className="shell flex flex-col gap-8">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Publicación"
            title={<span id="publicar-titulo">Contanos de tu mascota.</span>}
            description="Cinco pasos cortos. Podés volver atrás cuando quieras."
          />
        </Reveal>

        <Reveal delay={0.08}>
          {access === 'ready' ? <PublishWizard /> : <PublishGate access={access} />}
        </Reveal>
      </div>
    </section>
  );
}

function PublishGate({ access }: { access: Exclude<PublishAccess, 'ready'> }) {
  const isUnverified = access === 'unverified';

  return (
    <div className="surface mx-auto flex max-w-xl flex-col items-center gap-5 p-7 text-center sm:p-10">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-clay-100 text-clay-600">
        {isUnverified ? <MailIcon size={26} /> : <LockIcon size={26} />}
      </span>

      <div>
        <h3 className="text-display-sm font-display">
          {isUnverified ? 'Confirmá tu email para publicar' : 'Creá tu cuenta para publicar'}
        </h3>
        <p className="mx-auto mt-2 max-w-prose leading-relaxed text-ink-500">
          {isUnverified
            ? 'Te enviamos un enlace al registrarte. Tocalo y volvé: el formulario te va a estar esperando.'
            : 'Lleva 30 segundos. Así cada publicación tiene una persona real detrás, y los interesados te escriben sin ver nunca tu teléfono ni tu email.'}
        </p>
      </div>

      {isUnverified ? (
        <ResendVerificationButton />
      ) : (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            href={`/registro?volver=${RETURN}`}
            className="flex h-12 items-center justify-center rounded-pill bg-clay-500 px-6 font-semibold text-white shadow-soft transition-colors hover:bg-clay-600"
          >
            Crear cuenta gratis
          </Link>
          <Link
            href={`/ingresar?volver=${RETURN}`}
            className="flex h-12 items-center justify-center rounded-pill border border-cream-400 bg-white px-6 font-semibold text-ink-900 transition-colors hover:border-clay-300 hover:bg-clay-50"
          >
            Ya tengo cuenta
          </Link>
        </div>
      )}

      <p className="flex items-center gap-1.5 text-xs text-ink-400">
        <ShieldIcon size={14} className="text-sage-600" />
        Tus datos, privados. Siempre.
      </p>
    </div>
  );
}
