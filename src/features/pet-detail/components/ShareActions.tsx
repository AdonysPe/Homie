'use client';

import { motion } from 'framer-motion';
import { useSyncExternalStore, type ReactNode } from 'react';

import { LinkIcon, ShareIcon, WhatsAppIcon } from '@/components/icons';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import type { PetListing } from '@/types/pet';
import { buildShareText, buildWhatsAppUrl, copyToClipboard } from '../lib/share';

type SharePet = Pick<PetListing, 'name' | 'species' | 'sex' | 'ageLabel' | 'city'>;

interface ShareActionsProps {
  pet: SharePet;
  /** URL canónica: se usa en el HTML del servidor y se reemplaza por la real al hidratar. */
  canonicalUrl: string;
}

const press = { whileTap: { scale: 0.97 }, transition: { type: 'spring', stiffness: 500, damping: 30 } } as const;

const noopSubscribe = () => () => {};

/**
 * Resuelve la URL que ve el usuario (preview de Vercel, dominio propio…).
 * En el servidor devuelve la canónica; al hidratar, la real, sin desajustes.
 */
function useCurrentUrl(fallback: string) {
  const url = useSyncExternalStore(
    noopSubscribe,
    () => `${window.location.origin}${window.location.pathname}`,
    () => fallback,
  );
  const canNativeShare = useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator.share === 'function',
    () => false,
  );

  return { url, canNativeShare };
}

function useShareActions({ pet, canonicalUrl }: ShareActionsProps) {
  const { url, canNativeShare } = useCurrentUrl(canonicalUrl);

  const copyLink = async () => {
    const ok = await copyToClipboard(url);
    if (ok) toast.success('Enlace copiado');
    else toast.error('No pudimos copiar el enlace');
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: `Adoptá a ${pet.name}`, text: buildShareText(pet), url });
    } catch {
      // El usuario cerró la hoja de compartir: no es un error que haya que mostrar.
    }
  };

  return { canNativeShare, copyLink, nativeShare, whatsappUrl: buildWhatsAppUrl(pet, url) };
}

/** Desktop: tarjeta lateral para difundir la publicación. */
export function SharePanel(props: ShareActionsProps) {
  const { copyLink, whatsappUrl } = useShareActions(props);

  return (
    <div className="surface flex flex-col gap-4 p-5">
      <div>
        <p className="text-sm font-semibold text-ink-900">Compartí su historia</p>
        <p className="mt-1 text-sm leading-snug text-ink-500">
          Cada vez que alguien comparte, {props.pet.name} está más cerca de un hogar.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <motion.a
          {...press}
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center justify-center gap-2.5 rounded-pill bg-[#25D366] text-[0.95rem] font-semibold text-[#0B3B1E] transition-colors hover:bg-[#20c05c]"
        >
          <WhatsAppIcon size={19} />
          Compartir en WhatsApp
          <span className="sr-only">(se abre en otra pestaña)</span>
        </motion.a>
        <motion.button
          {...press}
          type="button"
          onClick={() => void copyLink()}
          className="flex h-11 items-center justify-center gap-2.5 rounded-pill border border-cream-400 bg-white text-[0.95rem] font-semibold text-ink-900 transition-colors hover:border-clay-300 hover:bg-clay-50"
        >
          <LinkIcon size={18} />
          Copiar enlace
        </motion.button>
      </div>
    </div>
  );
}

const iconButton =
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cream-400 bg-white text-ink-700';

/**
 * Mobile: barra inferior tipo bottom sheet, al alcance del pulgar y respetando
 * el área segura del iPhone. La acción principal (escribir a la familia) va primero;
 * compartir queda como íconos.
 */
export function ShareBar({ primaryAction, ...props }: ShareActionsProps & { primaryAction?: ReactNode }) {
  const { copyLink, nativeShare, canNativeShare, whatsappUrl } = useShareActions(props);

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 lg:hidden',
        'rounded-t-[1.75rem] border-t border-cream-300 bg-cream-50/85 shadow-[0_-12px_32px_-18px_rgba(42,37,33,0.35)] backdrop-blur-xl',
        'px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-2.5',
      )}
    >
      <span aria-hidden className="mx-auto mb-2.5 block h-1 w-9 rounded-pill bg-cream-400" />

      <div className="flex items-center gap-2">
        {primaryAction ? <div className="min-w-0 flex-1">{primaryAction}</div> : null}

        <motion.a
          {...press}
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir en WhatsApp (se abre en otra pestaña)"
          className={cn(iconButton, 'border-transparent bg-[#25D366] text-[#0B3B1E]')}
        >
          <WhatsAppIcon size={21} />
        </motion.a>
        <motion.button {...press} type="button" onClick={() => void copyLink()} aria-label="Copiar enlace" className={iconButton}>
          <LinkIcon size={20} />
        </motion.button>
        {canNativeShare ? (
          <motion.button
            {...press}
            type="button"
            onClick={() => void nativeShare()}
            aria-label="Más opciones para compartir"
            className={iconButton}
          >
            <ShareIcon size={20} />
          </motion.button>
        ) : null}
      </div>
    </div>
  );
}
