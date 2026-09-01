'use client';

import { Controller } from 'react-hook-form';

import { SpeciesIcon } from '@/components/icons';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { TextField } from '@/components/ui/TextField';
import { SPECIES_OPTIONS } from '@/lib/pet-catalog';
import type { PetSpecies } from '@/types/pet';
import type { PublishStepProps } from './types';

export function StepPet({ form }: PublishStepProps) {
  const { control, register, formState, watch } = form;
  const species = watch('species');

  return (
    <div className="flex flex-col gap-6">
      <Controller
        control={control}
        name="species"
        render={({ field }) => (
          <OptionGroup<PetSpecies>
            legend="Tipo de mascota"
            name="species"
            columns={4}
            options={SPECIES_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
              icon: <SpeciesIcon species={option.value} size={26} />,
            }))}
            value={field.value}
            onChange={field.onChange}
            error={formState.errors.species?.message}
          />
        )}
      />

      <TextField
        label="¿Cómo se llama?"
        placeholder="Rocky"
        autoComplete="off"
        enterKeyHint="next"
        error={formState.errors.name?.message}
        hint={species ? 'Su nombre encabeza la publicación.' : undefined}
        {...register('name')}
      />
    </div>
  );
}
