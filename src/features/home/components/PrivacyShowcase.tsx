'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

import { LockIcon } from '@/components/icons';
import { SEED_LISTINGS } from '@/features/pets/lib/pets-data';

const PHOTO = SEED_LISTINGS.find((listing) => listing.id === 'seed-tomas')!;
/** Versión grande de la foto: ocupa todo el ancho de la pantalla. */
const PHOTO_URL = PHOTO.photoUrl!.replace(/w=\d+/, 'w=2000');

/**
 * Dos recortes de la misma foto (dirección de arte, como en apple.com):
 * el marco cambia de vertical (móvil) a panorámico (escritorio), así que
 * un solo recorte centrado no sirve para los dos — en panorámico, un
 * recorte centrado corta los ojos del perro.
 *
 * - Móvil/tablet: el encuadre casi original (retrato), el que ya se ve bien.
 * - Escritorio: recorte panorámico con `crop=faces` (detección de rostro de
 *   Unsplash/imgix), que vuelve a calcular el recorte para mantener la cara
 *   centrada en vez de cortarla.
 */
const MOBILE_PHOTO_URL = PHOTO.photoUrl!.replace(/w=\d+/, 'w=1200');
const DESKTOP_PHOTO_URL = PHOTO.photoUrl!.replace(
  /\?.*$/,
  '?auto=format&fit=crop&crop=faces&w=2400&h=1250&q=75',
);

/**
 * La escena clásica de apple.com: una foto enmarcada que, al hacer scroll,
 * crece hasta ocupar toda la pantalla mientras el mensaje aparece encima.
 *
 * El "anclaje" es `position: sticky` (CSS puro): la sección mide 220 svh y el
 * escenario queda fijo mientras dura la animación. Sin movimiento reducido,
 * todo es scroll normal con la foto a ancho completo.
 */
export function PrivacyShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const frameScale = useTransform(scrollYProgress, [0, 0.55], [0.62, 1]);
  const frameRadius = useTransform(scrollYProgress, [0, 0.55], [48, 0]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);
  const veilOpacity = useTransform(scrollYProgress, [0.35, 0.65], [0, 1]);
  const copyOpacity = useTransform(scrollYProgress, [0.45, 0.7], [0, 1]);
  const copyY = useTransform(scrollYProgress, [0.45, 0.7], [40, 0]);

  if (prefersReducedMotion) {
    return (
      <section
        ref={sectionRef}
        className="relative h-[80svh] overflow-hidden bg-ink-900"
        aria-labelledby="privacidad-titulo"
      >
        <Image src={PHOTO_URL} alt={PHOTO.photoAlt} fill sizes="100vw" className="object-cover opacity-60" />
        <ShowcaseCopy />
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[220svh] bg-white" aria-labelledby="privacidad-titulo">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <motion.div
          style={{ scale: frameScale, borderRadius: frameRadius }}
          className="relative h-full w-full overflow-hidden bg-ink-900 will-change-transform"
        >
          <motion.div style={{ scale: photoScale }} className="absolute inset-0 will-change-transform">
            <ShowcasePhoto />
          </motion.div>
          <motion.div
            style={{ opacity: veilOpacity }}
            className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/45 to-ink-900/20"
          />
          <motion.div style={{ opacity: copyOpacity, y: copyY }} className="absolute inset-0">
            <ShowcaseCopy />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/** Dos <Image> superpuestas, una por punto de quiebre: solo se descarga la que se muestra. */
function ShowcasePhoto() {
  return (
    <>
      <Image
        src={MOBILE_PHOTO_URL}
        alt={PHOTO.photoAlt}
        fill
        sizes="100vw"
        className="object-cover lg:hidden"
      />
      <Image
        src={DESKTOP_PHOTO_URL}
        alt={PHOTO.photoAlt}
        fill
        sizes="100vw"
        className="hidden object-cover lg:block"
      />
    </>
  );
}

function ShowcaseCopy() {
  return (
    <div className="relative flex h-full flex-col items-center justify-end gap-4 px-6 pb-[14svh] text-center text-white">
      <LockIcon size={34} strokeWidth={1.6} className="text-white/90" />
      <h2 id="privacidad-titulo" className="max-w-3xl text-display-lg font-display text-balance">
        Tus datos, privados. Siempre.
      </h2>
      <p className="max-w-xl text-lede text-white/80 text-balance">
        Tu teléfono y tu email nunca aparecen en la publicación. Quien quiere adoptar se presenta
        primero; tú decides si compartes tu WhatsApp.
      </p>
    </div>
  );
}
