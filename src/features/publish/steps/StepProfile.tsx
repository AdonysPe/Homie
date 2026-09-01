'use client';

import { Controller } from 'react-hook-form';

import { OptionGroup } from '@/components/ui/OptionGroup';
import { TextField } from '@/components/ui/TextField';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { SEX_OPTIONS, SIZE_OPTIONS } from '@/lib/pet-catalog';
import type { PetSex, PetSize } from '@/types/pet';
import type { PublishStepProps } from './types';

export function StepProfile({ form }: PublishStepProps) {
  const { control, register, formState, watch } = form;
  const petName = watch('name') || 'tu mascota';

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
        <TextField
          label="Edad aproximada"
          type="number"
          min={0}
          max={40}
          step={0.5}
          inputMode="decimal"
          error={formState.errors.ageValue?.message}
          hint="Si no la sabés con exactitud, estimá."
          {...register('ageValue', { valueAsNumber: true })}
        />
        <Controller
          control={control}
          name="ageUnit"
          render={({ field }) => (
            <div className="sm:pt-[1.85rem]">
              <OptionGroup<'meses' | 'anos'>
                legend="Unidad de edad"
                hideLegend
                name="ageUnit"
                size="chip"
                options={[
                  { value: 'meses', label: 'Meses' },
                  { value: 'anos', label: 'Años' },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            </div>
          )}
        />
      </div>

      <Controller
        control={control}
        name="size"
        render={({ field }) => (
          <OptionGroup<PetSize>
            legend="Tamaño"
            name="size"
            columns={3}
            options={SIZE_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={formState.errors.size?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="sex"
        render={({ field }) => (
          <OptionGroup<PetSex>
            legend="Sexo"
            name="sex"
            columns={3}
            options={SEX_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={formState.errors.sex?.message}
          />
        )}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2.5 text-sm font-semibold text-ink-700">
          Sobre la convivencia de {petName}
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <Controller
            control={control}
            name="isVaccinated"
            render={({ field }) => (
              <ToggleRow label="Vacunas al día" checked={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="isSterilized"
            render={({ field }) => (
              <ToggleRow label="Castrado / esterilizado" checked={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="goodWithKids"
            render={({ field }) => (
              <ToggleRow label="Se lleva bien con chicos" checked={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="goodWithPets"
            render={({ field }) => (
              <ToggleRow label="Convive con otras mascotas" checked={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </fieldset>
    </div>
  );
}
