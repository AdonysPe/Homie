'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { CheckIcon, HomeHeartIcon, LockIcon, MailIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Sheet } from '@/components/ui/Sheet';
import { TextArea } from '@/components/ui/TextArea';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/Toast';
import { ResendVerificationButton } from '@/features/auth/components/ResendVerificationButton';
import { cn } from '@/lib/cn';
import { SITE } from '@/lib/site';
import { submitAdoptionRequest } from '@/server/actions/adoption';
import { HOME_TYPE_OPTIONS } from '../lib/adoption-options';
import {
  ADOPTION_MESSAGE_MAX,
  ADOPTION_MESSAGE_MIN,
  adoptionRequestSchema,
  type AdoptionRequestInput,
} from '../lib/adoption-schema';

/** Qué puede hacer quien mira la ficha. Lo decide el servidor. */
export type AdoptionCtaState =
  | { kind: 'anonymous'; signInHref: string }
  | { kind: 'unverified' }
  | { kind: 'owner' }
  | { kind: 'requested'; requestId: string }
  | { kind: 'closed'; reason: string }
  | { kind: 'ready'; suggestedName: string };

interface AdoptionRequestButtonProps {
  petId: string;
  petName: string;
  state: AdoptionCtaState;
  /** `bar`: barra inferior móvil (etiqueta más corta). */
  variant?: 'panel' | 'bar';
}

const base =
  'flex h-12 w-full items-center justify-center gap-2 rounded-pill px-5 text-[0.95rem] font-semibold transition-colors duration-200';
const primary = cn(base, 'bg-clay-500 text-white shadow-soft hover:bg-clay-600');
const secondary = cn(base, 'border border-cream-400 bg-white text-ink-900 hover:border-clay-300 hover:bg-clay-50');

export function AdoptionRequestButton({ petId, petName, state, variant = 'panel' }: AdoptionRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const label = variant === 'bar' ? 'Postularme' : 'Postularme para adoptar';

  switch (state.kind) {
    case 'anonymous':
      return (
        <Link href={state.signInHref} className={primary}>
          <HomeHeartIcon size={19} />
          {label}
        </Link>
      );
    case 'owner':
      return (
        <Link href="/dashboard?tab=mensajes" className={secondary}>
          Ver solicitudes recibidas
        </Link>
      );
    case 'requested':
      return (
        <Link href={`/dashboard/mensajes/${state.requestId}`} className={secondary}>
          <CheckIcon size={18} />
          Ver mi solicitud
        </Link>
      );
    case 'closed':
      return (
        <p className="flex h-12 items-center justify-center rounded-pill bg-cream-200 px-4 text-center text-sm font-medium text-ink-500">
          {state.reason}
        </p>
      );
    case 'unverified':
      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)} className={primary}>
            <HomeHeartIcon size={19} />
            {label}
          </button>
          <Sheet open={isOpen} onClose={() => setIsOpen(false)} title="Confirmá tu email primero">
            <div className="flex flex-col items-center gap-4 pb-2 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-clay-100 text-clay-600">
                <MailIcon size={26} />
              </span>
              <p className="text-[0.95rem] leading-relaxed text-ink-500">
                Para cuidar a las familias, solo las cuentas con email confirmado pueden postularse.
                Buscá el email que te enviamos y tocá el enlace.
              </p>
              <ResendVerificationButton className="text-sm" />
            </div>
          </Sheet>
        </>
      );
    case 'ready':
      return <ReadyButton petId={petId} petName={petName} suggestedName={state.suggestedName} label={label} />;
  }
}

function ReadyButton({
  petId,
  petName,
  suggestedName,
  label,
}: {
  petId: string;
  petName: string;
  suggestedName: string;
  label: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [sentRequestId, setSentRequestId] = useState<string | null>(null);

  const close = () => {
    setIsOpen(false);
    // Tras enviar, el botón de la ficha pasa a "Ver mi solicitud".
    if (sentRequestId) router.refresh();
  };

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={primary}>
        <HomeHeartIcon size={19} />
        {label}
      </button>

      <Sheet
        open={isOpen}
        onClose={close}
        title={sentRequestId ? '¡Solicitud enviada!' : `Postulate para adoptar a ${petName}`}
        description={
          sentRequestId ? undefined : (
            <span className="flex items-start gap-1.5">
              <LockIcon size={15} className="mt-0.5 shrink-0 text-sage-600" />
              La familia ve tu presentación, nunca tu email. Sus datos también quedan protegidos.
            </span>
          )
        }
      >
        {sentRequestId ? (
          <RequestSent requestId={sentRequestId} onClose={close} />
        ) : isOpen ? (
          // Solo se monta abierto: cada apertura arranca limpia.
          <AdoptionRequestForm
            petId={petId}
            petName={petName}
            suggestedName={suggestedName}
            onSent={setSentRequestId}
          />
        ) : null}
      </Sheet>
    </>
  );
}

function AdoptionRequestForm({
  petId,
  petName,
  suggestedName,
  onSent,
}: {
  petId: string;
  petName: string;
  suggestedName: string;
  onSent: (requestId: string) => void;
}) {
  const form = useForm<AdoptionRequestInput>({
    resolver: zodResolver(adoptionRequestSchema),
    defaultValues: {
      petId,
      adopterName: suggestedName,
      adopterCity: '',
      homeType: 'departamento',
      message: '',
    },
    mode: 'onTouched',
  });
  const { register, formState, control } = form;
  const messageLength = useWatch({ control, name: 'message' })?.length ?? 0;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await submitAdoptionRequest(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onSent(result.data.requestId);
    } catch {
      toast.error('Se cortó la conexión. Tu mensaje sigue acá: probá de nuevo.');
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Nombre"
          autoComplete="name"
          hint="Tu nombre completo o de pila."
          error={formState.errors.adopterName?.message}
          {...register('adopterName')}
        />
        <TextField
          label="Ciudad o zona"
          autoComplete="address-level2"
          placeholder="Nueva Córdoba"
          error={formState.errors.adopterCity?.message}
          {...register('adopterCity')}
        />
      </div>

      <Select
        label="Tipo de hogar"
        options={HOME_TYPE_OPTIONS}
        error={formState.errors.homeType?.message}
        {...register('homeType')}
      />

      <TextArea
        label={`¿Por qué querés adoptar a ${petName}?`}
        placeholder={`Contanos quién vive con vos, tu experiencia con mascotas y cómo sería el día a día de ${petName} en tu casa.`}
        rows={6}
        maxLength={ADOPTION_MESSAGE_MAX}
        currentLength={messageLength}
        className="min-h-[9.5rem]"
        error={formState.errors.message?.message}
        {...register('message')}
      />
      {messageLength < ADOPTION_MESSAGE_MIN && !formState.errors.message ? (
        <p className="-mt-3 text-xs text-ink-400">
          Mínimo {ADOPTION_MESSAGE_MIN} caracteres. Una buena presentación multiplica las respuestas.
        </p>
      ) : null}

      <Button type="submit" size="lg" fullWidth isLoading={formState.isSubmitting}>
        {formState.isSubmitting ? 'Enviando…' : 'Enviar solicitud'}
      </Button>
    </form>
  );
}

function RequestSent({ requestId, onClose }: { requestId: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-5 pb-2 text-center"
      role="status"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-500 text-white">
        <CheckIcon size={30} strokeWidth={2.2} />
      </span>
      <p className="max-w-sm text-[0.95rem] leading-relaxed text-ink-500">
        La familia revisará tu perfil y te contactará por el buzón de {SITE.name}. Te avisamos
        apenas responda.
      </p>
      <div className="flex w-full flex-col gap-2">
        <Link
          href={`/dashboard/mensajes/${requestId}`}
          className="flex h-12 items-center justify-center rounded-pill bg-clay-500 font-semibold text-white shadow-soft transition-colors hover:bg-clay-600"
        >
          Ver mi solicitud
        </Link>
        <Button variant="ghost" size="lg" fullWidth onClick={onClose}>
          Seguir mirando
        </Button>
      </div>
    </motion.div>
  );
}
