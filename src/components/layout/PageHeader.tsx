import Link from 'next/link';

import { ArrowLeftIcon } from '@/components/icons';
import { AccountMenu } from '@/features/auth/components/AccountMenu';
import { BrandMark } from '@/features/home/components/BrandMark';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { SITE } from '@/lib/site';
import { getNotificationSummary } from '@/server/notifications';
import { getAccountSummary, getCurrentUser } from '@/server/session';

/**
 * Header de páginas internas: sin animaciones de scroll ni anclas de la home.
 * Siempre ofrece el camino de vuelta, el CTA principal y el acceso a la cuenta.
 */
export async function PageHeader({
  backHref = '/',
  backLabel = 'Inicio',
}: {
  backHref?: string;
  backLabel?: string;
}) {
  const user = await getCurrentUser();
  const [account, notificationSummary] = await Promise.all([
    getAccountSummary(),
    user ? getNotificationSummary(user.id) : Promise.resolve(null),
  ]);

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

        <Link
          href="/"
          aria-label={`${SITE.name}, inicio`}
          className="absolute left-1/2 hidden -translate-x-1/2 min-[440px]:block"
        >
          <BrandMark />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/#publicar"
            className="hidden rounded-pill bg-clay-500 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-clay-600 sm:block"
          >
            Publicar
          </Link>
          {notificationSummary ? <NotificationBell initial={notificationSummary} /> : null}
          <AccountMenu account={account} />
        </div>
      </div>
    </header>
  );
}
