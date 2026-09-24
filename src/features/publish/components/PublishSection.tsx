'use client';

import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PublishWizard } from './PublishWizard';

export function PublishSection() {
  return (
    <section
      id="publicar"
      className="flex min-h-[100svh] scroll-mt-20 flex-col justify-center bg-cream-200/70 py-16 sm:py-20"
      aria-labelledby="publicar-titulo"
    >
      <div className="shell flex flex-col gap-8">
        <Reveal>
          <SectionHeading
            eyebrow="Publicación"
            title={<span id="publicar-titulo">Contanos de tu mascota</span>}
            description="Cinco pasos cortos. Podés volver atrás cuando quieras."
          />
        </Reveal>

        <Reveal delay={0.08}>
          <PublishWizard />
        </Reveal>
      </div>
    </section>
  );
}
