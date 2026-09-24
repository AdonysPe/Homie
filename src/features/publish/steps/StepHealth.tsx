'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Controller } from 'react-hook-form';

import { ChipIcon, HeartPulseIcon, PillIcon, SyringeIcon } from '@/components/icons';
import { CheckList, CheckListItem } from '@/components/ui/CheckList';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { TextField } from '@/components/ui/TextField';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { IDEAL_HOME_OPTIONS } from '@/lib/pet-catalog';
import { SPECIAL_NEEDS_MAX } from '../lib/publish-schema';
import type { PublishStepProps } from './types';

const HEALTH_ITEMS = [
  { name: 'isSterilized', label: 'Castrado / esterilizado', icon: HeartPulseIcon },
  { name: 'isVaccinated', label: 'Vacunado al día', icon: SyringeIcon },
  { name: 'isDewormed', label: 'Desparasitado', icon: PillIcon },
] as const;

export function StepHealth({ form }: PublishStepProps) {
  const { control, register, formState, watch } = form;
  const petName = watch('name') || 'tu mascota';
  const hasMicrochip = watch('hasMicrochip');
  const idealHome = watch('idealHome');
  const specialNeeds = watch('specialNeeds') ?? '';

  const idealHomeHint = IDEAL_HOME_OPTIONS.find((option) => option.value === idealHome)?.hint;

  return (
    <div className="flex flex-col gap-6">
      <CheckList legend="Estado de salud">
        {HEALTH_ITEMS.map(({ name, label, icon: Icon }) => (
          <Controller
            key={name}
            control={control}
            name={name}
            render={({ field }) => (
              <CheckListItem
                label={label}
                icon={<Icon size={18} />}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        ))}
      </CheckList>

      <div className="flex flex-col gap-3">
        <Controller
          control={control}
          name="hasMicrochip"
          render={({ field }) => (
            <OptionGroup<'si' | 'no'>
              legend="¿Tiene microchip?"
              name="hasMicrochip"
              size="chip"
              options={[
                { value: 'si', label: 'Sí', icon: <ChipIcon size={16} /> },
                { value: 'no', label: 'No' },
              ]}
              value={field.value ? 'si' : 'no'}
              onChange={(value) => field.onChange(value === 'si')}
            />
          )}
        />

        <AnimatePresence initial={false}>
          {hasMicrochip ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="-m-1 overflow-hidden p-1"
            >
              <TextField
                label="Número de microchip (opcional)"
                inputMode="numeric"
                autoComplete="off"
                placeholder="15 dígitos"
                hint="No se publica. Solo lo recibe la familia que adopte."
                error={formState.errors.microchipNumber?.message}
                {...register('microchipNumber')}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <Select
        label="Entorno ideal"
        options={IDEAL_HOME_OPTIONS}
        hint={idealHomeHint}
        error={formState.errors.idealHome?.message}
        {...register('idealHome')}
      />

      <TextArea
        label="Necesidades especiales (opcional)"
        placeholder="Medicación diaria, dieta especial, miedo a los ruidos fuertes…"
        maxLength={SPECIAL_NEEDS_MAX}
        currentLength={specialNeeds.length}
        rows={3}
        className="min-h-[5.5rem]"
        error={formState.errors.specialNeeds?.message}
        {...register('specialNeeds')}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2.5 text-sm font-semibold text-ink-700">
          Sobre la convivencia de {petName}
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
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
