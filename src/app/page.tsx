import { FaqSection } from '@/features/home/components/FaqSection';
import { HeroSection } from '@/features/home/components/HeroSection';
import { HowItWorksSection } from '@/features/home/components/HowItWorksSection';
import { RecentlyPublishedSection } from '@/features/home/components/RecentlyPublishedSection';
import { SiteFooter } from '@/features/home/components/SiteFooter';
import { SiteHeader } from '@/features/home/components/SiteHeader';
import { StickyPublishCta } from '@/features/home/components/StickyPublishCta';
import { PetsSection } from '@/features/pets/components/PetsSection';
import { PublishSection } from '@/features/publish/components/PublishSection';

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main id="contenido">
        <HeroSection />
        <RecentlyPublishedSection />
        <HowItWorksSection />
        <PublishSection />
        <PetsSection />
        <FaqSection />
      </main>

      <SiteFooter />
      <StickyPublishCta />
    </>
  );
}
