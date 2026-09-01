'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useListingsStore } from '@/features/pets/store/listings-store';
import { buildListingFromForm } from '../lib/build-listing';
import { PUBLISH_DEFAULT_VALUES } from '../lib/publish-defaults';
import { publishSchema } from '../lib/publish-schema';
import { PUBLISH_STEPS, TOTAL_PUBLISH_STEPS } from '../lib/publish-steps';
import type { PublishFormValues } from '../types';

export type PublishStatus = 'editing' | 'sending' | 'published';

/**
 * Toda la lógica del wizard vive acá: los componentes solo pintan.
 * Cada paso valida únicamente sus campos, así el usuario nunca ve
 * errores de campos que todavía no vio.
 */
export function usePublishForm() {
  const form = useForm<PublishFormValues>({
    resolver: zodResolver(publishSchema),
    defaultValues: PUBLISH_DEFAULT_VALUES,
    mode: 'onTouched',
  });

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [status, setStatus] = useState<PublishStatus>('editing');
  const addListing = useListingsStore((state) => state.addListing);

  const currentStep = PUBLISH_STEPS[stepIndex];
  const isLastStep = stepIndex === TOTAL_PUBLISH_STEPS - 1;

  const goToNextStep = useCallback(async () => {
    const isStepValid = await form.trigger(currentStep.fields, { shouldFocus: true });
    if (!isStepValid) return false;

    setDirection(1);
    setStepIndex((index) => Math.min(index + 1, TOTAL_PUBLISH_STEPS - 1));
    return true;
  }, [currentStep.fields, form]);

  const goToPreviousStep = useCallback(() => {
    setDirection(-1);
    setStepIndex((index) => Math.max(index - 1, 0));
  }, []);

  const goToStep = useCallback(
    (index: number) => {
      setDirection(index > stepIndex ? 1 : -1);
      setStepIndex(index);
    },
    [stepIndex],
  );

  const submit = form.handleSubmit(async (values) => {
    setStatus('sending');
    // Simula el envío al backend: mantiene el feedback visual honesto.
    await new Promise((resolve) => setTimeout(resolve, 900));
    addListing(buildListingFromForm(values));
    setStatus('published');
  });

  const startAnother = useCallback(() => {
    form.reset(PUBLISH_DEFAULT_VALUES);
    setStepIndex(0);
    setDirection(1);
    setStatus('editing');
  }, [form]);

  return {
    form,
    stepIndex,
    direction,
    status,
    currentStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    submit,
    startAnother,
  };
}
