import type { Metadata } from 'next';

import { PageHeader } from '@/components/layout/PageHeader';
import { SiteFooter } from '@/features/home/components/SiteFooter';
import { LegalDocument } from '@/features/legal/components/LegalDocument';
import { TERMS } from '@/features/legal/lib/terms';

export const metadata: Metadata = {
  title: TERMS.title,
  description: TERMS.description,
  alternates: { canonical: '/terminos' },
};

export default function TermsPage() {
  return (
    <>
      <PageHeader />
      <LegalDocument doc={TERMS} />
      <SiteFooter />
    </>
  );
}
