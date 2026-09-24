'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { toast } from '@/components/ui/Toast';
import { publishPet } from '@/server/actions/publish';
import { PUBLISH_DEFAULT_VALUES } from '../lib/publish-defaults';
import { publishSchema } from '../lib/publish-schema';
import { PUBLISH_STEPS, TOTAL_PUBLISH_STEPS } from '../lib/publish-steps';
import { resizeImage } from '../lib/resize-image';
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
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

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

  const submit = form.handleSubmit(async ({ photos, ...fields }) => {
    setStatus('sending');

    const formData = new FormData();
    formData.set('payload', JSON.stringify(fields));
    try {
      const resized = await Promise.all(photos.map((photo) => resizeImage(photo.file)));
      resized.forEach((blob, index) => formData.append('photos', blob, `foto-${index + 1}.jpg`));
    } catch {
      setStatus('editing');
      toast.error('No pudimos procesar una de las fotos. Probá con otra (JPG o PNG).');
      return;
    }

    try {
      const result = await publishPet(formData);
      if (!result.ok) {
        setStatus('editing');
        toast.error(result.error);
        return;
      }
      setPublishedSlug(result.data.slug);
      setStatus('published');
    } catch {
      setStatus('editing');
      toast.error('Se cortó la conexión. Tus datos siguen acá: probá de nuevo.');
    }
  });

  const startAnother = useCallback(() => {
    // Las fotos ya se subieron: las previews locales se pueden liberar.
    form.getValues('photos').forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    form.reset(PUBLISH_DEFAULT_VALUES);
    setPublishedSlug(null);
    setStepIndex(0);
    setDirection(1);
    setStatus('editing');
  }, [form]);

  return {
    form,
    stepIndex,
    direction,
    status,
    publishedSlug,
    currentStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    submit,
    startAnother,
  };
}
