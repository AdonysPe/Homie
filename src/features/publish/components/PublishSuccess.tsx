'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import { ChatIcon, CheckIcon, HomeHeartIcon, ShieldIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';

const NEXT_STEPS = [
  { icon: ChatIcon, text: 'Los interesados te escriben por el buzón anónimo.' },
  { icon: ShieldIcon, text: 'Tu teléfono y tu email siguen ocultos.' },
  { icon: HomeHeartIcon, text: 'Vos elegís con quién sigue su historia.' },
];

const linkButton =
  'inline-flex h-11 items-center justify-center rounded-pill px-5 text-[0.95rem] font-semibold transition-colors duration-200';

export function PublishSuccess({
  petName,
  slug,
  onPublishAnother,
}: {
  petName: string;
  slug: string | null;
  onPublishAnother: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-6 py-6 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <span className="absolute inset-0 rounded-full bg-sage-300/40 animate-pulse-ring" aria-hidden />
        <motion.span
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-sage-500 text-white"
        >
          <CheckIcon size={30} />
        </motion.span>
      </div>

      <div className="max-w-prose">
        <h3 className="text-display-sm font-display">Listo. {petName} ya está publicado.</h3>
        <p className="mt-2 text-ink-500">Compartí su ficha para que llegue a más personas.</p>
      </div>

      <ul className="flex w-full max-w-md flex-col gap-2 text-left">
        {NEXT_STEPS.map(({ icon: Icon, text }, index) => (
          <motion.li
            key={text}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + index * 0.09, duration: 0.35 }}
            className="flex items-center gap-3 rounded-card border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-ink-700"
          >
            <Icon size={20} className="shrink-0 text-clay-500" />
            {text}
          </motion.li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 sm:flex-row">
        {slug ? (
          <Link href={`/mascota/${slug}`} className={`${linkButton} bg-clay-500 text-white shadow-soft hover:bg-clay-600`}>
            Ver su publicación
          </Link>
        ) : null}
        <Link
          href="/dashboard"
          className={`${linkButton} border border-cream-400 bg-white text-ink-900 hover:border-clay-300 hover:bg-clay-50`}
        >
          Ir a mi panel
        </Link>
        <Button variant="ghost" onClick={onPublishAnother}>
          Publicar otra mascota
        </Button>
      </div>
    </motion.div>
  );
}
