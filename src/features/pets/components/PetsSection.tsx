'use client';

import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { scrollToSection } from '@/lib/scroll';
import type { PetListing } from '@/types/pet';
import { ChevronLink } from '@/features/home/components/ChevronLink';
import { PetGallery } from './PetGallery';

export function PetsSection({ listings }: { listings: PetListing[] }) {
  return (
    <section id="mascotas" className="scroll-mt-14 bg-white py-section">
      <div className="shell flex flex-col gap-8">
        <Reveal>
          <SectionHeading
            eyebrow="Publicadas esta semana"
            title="Ellos ya están buscando."
            description="Cada tarjeta es una familia que dio el primer paso."
            action={
              <ChevronLink onClick={() => scrollToSection('publicar')}>Sumar a mi mascota</ChevronLink>
            }
          />
        </Reveal>

        <Reveal delay={0.06}>
          <PetGallery listings={listings} />
        </Reveal>
      </div>
    </section>
  );
}
