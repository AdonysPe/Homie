'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { ChatIcon, LockIcon, MailIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { TextArea } from '@/components/ui/TextArea';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/Toast';
import { ResendVerificationButton } from '@/features/auth/components/ResendVerificationButton';
import { cn } from '@/lib/cn';
import { sendFirstMessage } from '@/server/actions/messages';
import {
  FIRST_MESSAGE_MIN,
  MESSAGE_MAX,
  firstMessageSchema,
  type FirstMessageInput,
} from '../lib/message-schema';

/** Lo que puede hacer quien mira la ficha. Lo decide el servidor. */
export type ContactState =
  | { kind: 'anonymous'; signInHref: string }
  | { kind: 'unverified' }
  | { kind: 'owner' }
  | { kind: 'existing'; conversationId: string }
  | { kind: 'closed'; reason: string }
  | { kind: 'ready'; suggestedName: string };

interface ContactFamilyButtonProps {
  petId: string;
  petName: string;
  state: ContactState;
  /** `bar`: barra inferior móvil (más compacto). */
  variant?: 'panel' | 'bar';
}

const base =
  'flex h-12 w-full items-center justify-center gap-2 rounded-pill px-5 text-[0.95rem] font-semibold transition-colors duration-200';
const primary = cn(base, 'bg-clay-500 text-white shadow-soft hover:bg-clay-600');
const secondary = cn(base, 'border border-cream-400 bg-white text-ink-900 hover:border-clay-300 hover:bg-clay-50');

export function ContactFamilyButton({ petId, petName, state, variant = 'panel' }: ContactFamilyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const label = variant === 'bar' ? 'Enviar mensaje' : 'Enviar mensaje a la familia';

  switch (state.kind) {
    case 'anonymous':
      return (
        <Link href={state.signInHref} className={primary}>
          <ChatIcon size={19} />
          {label}
        </Link>
      );
    case 'owner':
      return (
        <Link href="/dashboard?tab=mensajes" className={secondary}>
          Ver mensajes recibidos
        </Link>
      );
    case 'existing':
      return (
        <Link href={`/dashboard/mensajes/${state.conversationId}`} className={secondary}>
          <ChatIcon size={19} />
          Ver conversación
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
            <ChatIcon size={19} />
            {label}
          </button>
          <Sheet open={isOpen} onClose={() => setIsOpen(false)} title="Confirmá tu email primero">
            <div className="flex flex-col items-center gap-4 pb-2 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-clay-100 text-clay-600">
                <MailIcon size={26} />
              </span>
              <p className="text-[0.95rem] leading-relaxed text-ink-500">
                Para cuidar a las familias, solo las cuentas con email confirmado pueden escribir.
                Buscá el email que te enviamos y tocá el enlace.
              </p>
              <ResendVerificationButton className="text-sm" />
            </div>
          </Sheet>
        </>
      );
    case 'ready':
      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)} className={primary}>
            <ChatIcon size={19} />
            {label}
          </button>
          <Sheet
            open={isOpen}
            onClose={() => setIsOpen(false)}
            title={`Escribile a la familia de ${petName}`}
            description={
              <span className="flex items-start gap-1.5">
                <LockIcon size={15} className="mt-0.5 shrink-0 text-sage-600" />
                Tu email queda oculto. La familia solo ve el nombre que elijas acá.
              </span>
            }
          >
            {/* El formulario solo se monta abierto: cada apertura arranca limpia. */}
            {isOpen ? (
              <FirstMessageForm
                petId={petId}
                petName={petName}
                suggestedName={state.suggestedName}
                onSent={() => setIsOpen(false)}
              />
            ) : null}
          </Sheet>
        </>
      );
  }
}

function FirstMessageForm({
  petId,
  petName,
  suggestedName,
  onSent,
}: {
  petId: string;
  petName: string;
  suggestedName: string;
  onSent: () => void;
}) {
  const router = useRouter();
  const form = useForm<FirstMessageInput>({
    resolver: zodResolver(firstMessageSchema),
    defaultValues: { petId, alias: suggestedName, content: '' },
    mode: 'onTouched',
  });
  const { register, formState, control } = form;
  const contentLength = useWatch({ control, name: 'content' })?.length ?? 0;

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await sendFirstMessage(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('Mensaje enviado. Te avisamos cuando respondan.');
    onSent();
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <TextField
        label="Nombre"
        autoComplete="given-name"
        hint="Puede ser solo tu nombre de pila."
        error={formState.errors.alias?.message}
        {...register('alias')}
      />
      <TextArea
        label="Contanos sobre vos y tu hogar"
        placeholder={`Vivo en una casa con patio, trabajo desde casa y ya tuve perros. Me encantaría conocer a ${petName}…`}
        rows={5}
        maxLength={MESSAGE_MAX}
        currentLength={contentLength}
        className="min-h-[8.5rem]"
        error={formState.errors.content?.message}
        {...register('content')}
      />
      <p className="-mt-2 text-xs text-ink-400">
        Mínimo {FIRST_MESSAGE_MIN} caracteres. Contá quién vive con vos, cómo es tu casa y por qué querés adoptar.
      </p>
      <Button type="submit" size="lg" fullWidth isLoading={formState.isSubmitting}>
        {formState.isSubmitting ? 'Enviando…' : 'Enviar mensaje'}
      </Button>
    </form>
  );
}
