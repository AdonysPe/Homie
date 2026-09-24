'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Controller } from 'react-hook-form';

import { OptionGroup } from '@/components/ui/OptionGroup';
import { TextField } from '@/components/ui/TextField';
import { SEX_OPTIONS, sizeOptionsFor } from '@/lib/pet-catalog';
import type { PetSex, PetSize } from '@/types/pet';
import type { PublishStepProps } from './types';

export function StepProfile({ form }: PublishStepProps) {
  const { control, register, formState, watch } = form;
  const species = watch('species');
  const sizeOptions = sizeOptionsFor(species);

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
        name="sex"
        render={({ field }) => (
          <OptionGroup<PetSex>
            legend="Género"
            name="sex"
            columns={2}
            options={SEX_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={formState.errors.sex?.message}
          />
        )}
      />

      {/* El tamaño solo aparece para especies donde significa algo concreto. */}
      <AnimatePresence initial={false}>
        {sizeOptions ? (
          <motion.div
            key={species}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="-m-1 overflow-hidden p-1"
          >
            <Controller
              control={control}
              name="size"
              render={({ field }) => (
                <OptionGroup<PetSize>
                  legend="Tamaño de adulto"
                  name="size"
                  columns={3}
                  options={sizeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={formState.errors.size?.message}
                />
              )}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
