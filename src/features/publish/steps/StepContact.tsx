'use client';

import Link from 'next/link';
import { Controller } from 'react-hook-form';

import { Checkbox } from '@/components/ui/Checkbox';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { TextField } from '@/components/ui/TextField';
import { ShieldIcon } from '@/components/icons';
import { SITE } from '@/lib/site';
import type { PublishStepProps } from './types';

export function StepContact({ form }: PublishStepProps) {
  const { control, register, formState, watch } = form;
  const contactMethod = watch('contactMethod');

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Tu nombre"
          placeholder="Ana"
          autoComplete="given-name"
          error={formState.errors.ownerName?.message}
          {...register('ownerName')}
        />
        <TextField
          label="Distrito"
          placeholder="Miraflores"
          autoComplete="address-level2"
          error={formState.errors.city?.message}
          {...register('city')}
        />
      </div>

      <Controller
        control={control}
        name="contactMethod"
        render={({ field }) => (
          <OptionGroup<'whatsapp' | 'email'>
            legend="¿Cómo prefieres que te escriban?"
            name="contactMethod"
            size="chip"
            options={[
              { value: 'whatsapp', label: 'WhatsApp' },
              { value: 'email', label: 'Email' },
            ]}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <TextField
        key={contactMethod}
        label={contactMethod === 'whatsapp' ? 'Tu WhatsApp' : 'Tu email'}
        type={contactMethod === 'whatsapp' ? 'tel' : 'email'}
        inputMode={contactMethod === 'whatsapp' ? 'tel' : 'email'}
        autoComplete={contactMethod === 'whatsapp' ? 'tel' : 'email'}
        placeholder={contactMethod === 'whatsapp' ? '+51 987 654 321' : 'ana@correo.com'}
        error={formState.errors.contactValue?.message}
        {...register('contactValue')}
      />

      <div className="flex items-start gap-3 rounded-card bg-sage-50 p-4 text-sm text-sage-800">
        <ShieldIcon size={20} className="mt-0.5 shrink-0 text-sage-600" />
        <p className="leading-snug">
          Tu teléfono y tu email nunca aparecen en la publicación. Los interesados se presentan con una
          carta, te escriben por el chat de la app y tú decides si compartes tu WhatsApp.
        </p>
      </div>

      <Controller
        control={control}
        name="acceptsFollowUp"
        render={({ field }) => (
          <Checkbox
            label="Acepto que Homie me avise de cada interesado y me acompañe en la adopción."
            checked={field.value}
            onChange={field.onChange}
            error={formState.errors.acceptsFollowUp?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="acceptsTerms"
        render={({ field }) => (
          <Checkbox
            label={
              <>
                He leído y acepto los{' '}
                <Link href="/terminos" target="_blank" className="legal-link">
                  Términos<span className="sr-only"> (se abre en otra pestaña)</span>
                </Link>{' '}
                y la{' '}
                <Link href="/privacidad" target="_blank" className="legal-link">
                  Política de Privacidad<span className="sr-only"> (se abre en otra pestaña)</span>
                </Link>{' '}
                de {SITE.name}.
              </>
            }
            checked={field.value}
            onChange={field.onChange}
            error={formState.errors.acceptsTerms?.message}
          />
        )}
      />
    </div>
  );
}
