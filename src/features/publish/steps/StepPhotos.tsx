'use client';

import { Controller } from 'react-hook-form';

import { OptionGroup } from '@/components/ui/OptionGroup';
import { TextArea } from '@/components/ui/TextArea';
import { REASON_OPTIONS } from '@/lib/pet-catalog';
import type { RehomingReason } from '@/types/pet';
import { PhotoUploader } from '../components/PhotoUploader';
import type { PublishStepProps } from './types';

export function StepPhotos({ form }: PublishStepProps) {
  const { control, register, formState, watch } = form;
  const petName = watch('name') || 'tu mascota';
  const description = watch('description') ?? '';

  return (
    <div className="flex flex-col gap-6">
      <Controller
        control={control}
        name="photos"
        render={({ field }) => (
          <PhotoUploader
            photos={field.value}
            onChange={field.onChange}
            error={formState.errors.photos?.message}
            petName={petName}
          />
        )}
      />

      <TextArea
        label="Algo que quieras contar (opcional)"
        placeholder={`${petName} duerme toda la noche y adora las caminatas largas.`}
        maxLength={280}
        currentLength={description.length}
        error={formState.errors.description?.message}
        {...register('description')}
      />

      <Controller
        control={control}
        name="reason"
        render={({ field }) => (
          <OptionGroup<RehomingReason>
            legend="Motivo (esto no se publica)"
            name="reason"
            size="chip"
            options={REASON_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={formState.errors.reason?.message}
          />
        )}
      />
    </div>
  );
}
