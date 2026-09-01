'use client';

import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { scrollToSection } from '@/lib/scroll';
import { PetGallery } from './PetGallery';

export function PetsSection() {
  return (
    <section id="mascotas" className="scroll-mt-20 py-section">
      <div className="shell flex flex-col gap-8">
        <Reveal>
          <SectionHeading
            eyebrow="Publicadas esta semana"
            title="Ellos ya están buscando"
            description="Cada tarjeta es una familia que dio el primer paso."
            action={
              <Button variant="secondary" onClick={() => scrollToSection('publicar')}>
                Sumar a mi mascota
              </Button>
            }
          />
        </Reveal>

        <Reveal delay={0.06}>
          <PetGallery />
        </Reveal>
      </div>
    </section>
  );
}
