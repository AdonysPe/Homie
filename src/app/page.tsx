import { FaqSection } from '@/features/home/components/FaqSection';
import { HeroSection } from '@/features/home/components/HeroSection';
import { HowItWorksSection } from '@/features/home/components/HowItWorksSection';
import { RecentlyPublishedSection } from '@/features/home/components/RecentlyPublishedSection';
import { SiteFooter } from '@/features/home/components/SiteFooter';
import { SiteHeader } from '@/features/home/components/SiteHeader';
import { StickyPublishCta } from '@/features/home/components/StickyPublishCta';
import { PetsSection } from '@/features/pets/components/PetsSection';
import { PublishSection, type PublishAccess } from '@/features/publish/components/PublishSection';
import { listPublicPets } from '@/server/pets';
import { getAccountSummary } from '@/server/session';

export default async function HomePage() {
  const [listings, account] = await Promise.all([listPublicPets(), getAccountSummary()]);
  const publishAccess: PublishAccess = !account ? 'anonymous' : account.emailVerified ? 'ready' : 'unverified';

  return (
    <>
      <SiteHeader account={account} />

      <main id="contenido">
        <HeroSection />
        <RecentlyPublishedSection />
        <HowItWorksSection />
        <PublishSection access={publishAccess} />
        <PetsSection listings={listings} />
        <FaqSection />
      </main>

      <SiteFooter />
      <StickyPublishCta />
    </>
  );
}
