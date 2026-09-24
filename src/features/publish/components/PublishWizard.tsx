'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, type KeyboardEvent } from 'react';

import { ArrowLeftIcon, ArrowRightIcon, ClockIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { StepProgress } from '@/components/ui/StepProgress';
import { usePublishForm } from '../hooks/usePublishForm';
import { PUBLISH_STEPS, TOTAL_PUBLISH_STEPS } from '../lib/publish-steps';
import { StepContact } from '../steps/StepContact';
import { StepHealth } from '../steps/StepHealth';
import { StepPet } from '../steps/StepPet';
import { StepPhotos } from '../steps/StepPhotos';
import { StepProfile } from '../steps/StepProfile';
import { ListingPreview } from './ListingPreview';
import { PublishSuccess } from './PublishSuccess';

const STEP_COMPONENTS = [StepPet, StepProfile, StepHealth, StepPhotos, StepContact];

export function PublishWizard() {
  const {
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
  } = usePublishForm();

  const StepComponent = STEP_COMPONENTS[stepIndex];
  const petName = form.watch('name') || 'tu mascota';

  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasChangedStep = useRef(false);

  // Al cambiar de paso movemos el foco al título: quien navega con teclado
  // o lector de pantalla escucha dónde quedó parado. Nunca en el primer render.
  useEffect(() => {
    if (!hasChangedStep.current) {
      hasChangedStep.current = true;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [stepIndex]);

  // Enter avanza de paso en lugar de enviar a medio completar.
  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter') return;
    const target = event.target as HTMLElement;
    if (target.tagName === 'TEXTAREA') return;

    if (!isLastStep) {
      event.preventDefault();
      void goToNextStep();
    }
  };

  if (status === 'published') {
    return (
      <div className="surface p-6 sm:p-8">
        <PublishSuccess petName={petName} onPublishAnother={startAnother} />
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
      <form
        onSubmit={submit}
        onKeyDown={handleKeyDown}
        noValidate
        className="surface flex flex-col gap-6 p-5 sm:p-7"
      >
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
              Paso {stepIndex + 1} de {TOTAL_PUBLISH_STEPS}
            </p>
            <p className="flex items-center gap-1.5 text-xs font-medium text-sage-600">
              <ClockIcon size={14} />
              menos de 3 minutos
            </p>
          </div>

          <StepProgress
            steps={PUBLISH_STEPS.map((step) => ({ id: step.id, title: step.label }))}
            currentIndex={stepIndex}
            onStepSelect={goToStep}
          />

          <div>
            <h3 ref={headingRef} tabIndex={-1} className="text-display-sm font-display outline-none">
              {currentStep.title}
            </h3>
            <p className="mt-1 text-sm text-ink-500">{currentStep.helper}</p>
          </div>
        </header>

        <div className="relative">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={currentStep.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <StepComponent form={form} />
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-cream-300 pt-5">
          <Button
            variant="ghost"
            size="md"
            onClick={goToPreviousStep}
            disabled={stepIndex === 0}
            className={stepIndex === 0 ? 'invisible' : undefined}
          >
            <ArrowLeftIcon size={18} />
            Atrás
          </Button>

          {isLastStep ? (
            <Button type="submit" size="lg" disabled={status === 'sending'}>
              {status === 'sending' ? 'Publicando…' : `Publicar a ${petName}`}
            </Button>
          ) : (
            <Button size="lg" onClick={() => void goToNextStep()}>
              Continuar
              <ArrowRightIcon size={18} />
            </Button>
          )}
        </footer>
      </form>

      <ListingPreview form={form} />
    </div>
  );
}
