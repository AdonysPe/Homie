import type { Metadata } from 'next';

import { PageHeader } from '@/components/layout/PageHeader';
import { SiteFooter } from '@/features/home/components/SiteFooter';
import { LegalDocument } from '@/features/legal/components/LegalDocument';
import { PRIVACY } from '@/features/legal/lib/privacy';

export const metadata: Metadata = {
  title: PRIVACY.title,
  description: PRIVACY.description,
  alternates: { canonical: '/privacidad' },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader />
      <LegalDocument doc={PRIVACY} />
      <SiteFooter />
    </>
  );
}
