import { FaqSection } from '@/features/home/components/FaqSection';
import { HeroSection } from '@/features/home/components/HeroSection';
import { HowItWorksSection } from '@/features/home/components/HowItWorksSection';
import { PrivacyShowcase } from '@/features/home/components/PrivacyShowcase';
import { RecentlyPublishedSection } from '@/features/home/components/RecentlyPublishedSection';
import { SiteFooter } from '@/features/home/components/SiteFooter';
import { SiteHeader } from '@/features/home/components/SiteHeader';
import { StickyPublishCta } from '@/features/home/components/StickyPublishCta';
import { PetsSection } from '@/features/pets/components/PetsSection';
import { PublishSection, type PublishAccess } from '@/features/publish/components/PublishSection';
import { listPublicPets } from '@/server/pets';
import { getNotificationSummary } from '@/server/notifications';
import { getAccountSummary, getCurrentUser } from '@/server/session';

export default async function HomePage() {
  const user = await getCurrentUser();
  const [listings, account, notificationSummary] = await Promise.all([
    listPublicPets(),
    getAccountSummary(),
    user ? getNotificationSummary(user.id) : Promise.resolve(null),
  ]);
  const publishAccess: PublishAccess = !account ? 'anonymous' : account.emailVerified ? 'ready' : 'unverified';

  return (
    <>
      <SiteHeader account={account} notifications={notificationSummary} />

      <main id="contenido">
        <HeroSection />
        <RecentlyPublishedSection />
        <HowItWorksSection />
        <PrivacyShowcase />
        <PublishSection access={publishAccess} />
        <PetsSection listings={listings} />
        <FaqSection />
      </main>

      <SiteFooter />
      <StickyPublishCta />
    </>
  );
}
