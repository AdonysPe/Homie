'use client';

import { Accordion } from '@/components/ui/Accordion';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FAQ_ITEMS } from '../lib/faq';

const ACCORDION_ITEMS = FAQ_ITEMS.map((item) => ({
  id: item.id,
  title: item.question,
  content: (
    <div className="flex flex-col gap-2.5">
      {item.answer.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  ),
}));

export function FaqSection() {
  return (
    <section id="preguntas" className="scroll-mt-14 bg-cream-100 py-section">
      <div className="shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <Reveal>
          <SectionHeading
            eyebrow="Tranquilidad"
            title="Lo que casi todos preguntan."
            description="Tomar esta decisión ya es difícil. El resto lo hacemos simple."
          />
        </Reveal>

        <Reveal delay={0.06}>
          <Accordion items={ACCORDION_ITEMS} defaultOpen={[FAQ_ITEMS[0].id]} />
        </Reveal>
      </div>
    </section>
  );
}
