import Link from 'next/link';

import { ArrowLeftIcon } from '@/components/icons';
import { BrandMark } from '@/features/home/components/BrandMark';
import { SITE } from '@/lib/site';

/**
 * Header de páginas internas: sin animaciones de scroll ni anclas de la home.
 * Siempre ofrece el camino de vuelta y el CTA principal.
 */
export function PageHeader({
  backHref = '/',
  backLabel = 'Inicio',
}: {
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-300/80 bg-cream-100/80 backdrop-blur-xl">
      <div className="shell flex h-14 items-center justify-between gap-4">
        <Link
          href={backHref}
          className="-ml-2 flex items-center gap-1 rounded-pill px-2 py-1.5 text-[0.95rem] font-medium text-clay-600 transition-colors hover:bg-cream-200"
        >
          <ArrowLeftIcon size={18} />
          {backLabel}
        </Link>

        <Link href="/" aria-label={`${SITE.name}, inicio`} className="absolute left-1/2 hidden -translate-x-1/2 min-[400px]:block">
          <BrandMark />
        </Link>

        <Link
          href="/#publicar"
          className="rounded-pill bg-clay-500 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-clay-600"
        >
          Publicar
        </Link>
      </div>
    </header>
  );
}
