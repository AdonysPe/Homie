'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';

import { ChatIcon, HomeHeartIcon } from '@/components/icons';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/cn';
import { VerifiedBadge } from './VerifiedBadge';

export interface AccountSummary {
  name: string;
  emailVerified: boolean;
  unreadCount: number;
}

/** Acceso a la cuenta en el header: "Ingresar" o avatar con menú. */
export function AccountMenu({ account, className }: { account: AccountSummary | null; className?: string }) {
  if (!account) {
    return (
      <Link
        href="/ingresar"
        className={cn(
          'rounded-pill px-3.5 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-cream-200 hover:text-ink-900',
          className,
        )}
      >
        Ingresar
      </Link>
    );
  }

  return <SignedInMenu account={account} className={className} />;
}

function SignedInMenu({ account, className }: { account: AccountSummary; className?: string }) {
  const router = useRouter();
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const initial = account.name.trim().charAt(0).toUpperCase() || '?';

  // Cierra al tocar afuera o con Esc (devolviendo el foco al botón).
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      containerRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const signOut = async () => {
    setIsSigningOut(true);
    const { error } = await authClient.signOut();
    setIsSigningOut(false);
    if (error) {
      toast.error('No pudimos cerrar la sesión. Prueba de nuevo.');
      return;
    }
    setIsOpen(false);
    toast.info('Cerraste sesión');
    router.push('/');
    router.refresh();
  };

  const itemClass =
    'flex w-full items-center gap-3 rounded-[0.8rem] px-3 py-2.5 text-left text-[0.95rem] text-ink-900 transition-colors hover:bg-cream-200';

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={`Tu cuenta${
          account.unreadCount === 1
            ? ', 1 mensaje sin leer'
            : account.unreadCount > 1
              ? `, ${account.unreadCount} mensajes sin leer`
              : ''
        }`}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white transition-transform active:scale-95"
      >
        {initial}
        {account.unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-cream-100 bg-clay-500" />
        ) : null}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-panel border border-cream-300 bg-cream-50/95 p-2 shadow-lift backdrop-blur-xl"
          >
            <div className="flex flex-col gap-1.5 px-3 pb-3 pt-2">
              <p className="truncate text-[0.95rem] font-semibold text-ink-900">{account.name}</p>
              <VerifiedBadge verified={account.emailVerified} className="self-start" />
            </div>
            <div className="h-px bg-cream-300" />
            <nav className="flex flex-col py-1.5" aria-label="Tu cuenta">
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className={itemClass}>
                <HomeHeartIcon size={19} className="text-ink-400" />
                Mis publicaciones
              </Link>
              <Link href="/dashboard?tab=mensajes" onClick={() => setIsOpen(false)} className={itemClass}>
                <ChatIcon size={19} className="text-ink-400" />
                <span className="flex-1">Mensajes</span>
                {account.unreadCount > 0 ? (
                  <span className="min-w-5 rounded-pill bg-clay-500 px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums text-white">
                    {account.unreadCount}
                  </span>
                ) : null}
              </Link>
            </nav>
            <div className="h-px bg-cream-300" />
            <button
              type="button"
              onClick={() => void signOut()}
              disabled={isSigningOut}
              className={cn(itemClass, 'mt-1.5 text-clay-600')}
            >
              {isSigningOut ? <Spinner size={16} /> : null}
              Cerrar sesión
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
