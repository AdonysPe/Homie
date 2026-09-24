'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

import { cn } from '@/lib/cn';

interface ScrollZoomImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  unoptimized?: boolean;
  /** Desplazamiento del paralaje, en % de la altura (0 lo desactiva). */
  parallax?: number;
}

/**
 * Imagen con el movimiento de las páginas de producto de Apple:
 * - al entrar en pantalla, el marco crece de 94 % a 100 % y la foto se asienta
 *   desde un zoom leve (1,12 → 1);
 * - mientras se hace scroll, la foto se desliza apenas dentro del marco (paralaje).
 *
 * Solo anima `transform` y `opacity` (compositor, 60 fps). Si el sistema pide
 * menos movimiento, se muestra quieta.
 */
export function ScrollZoomImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
  unoptimized = false,
  parallax = 6,
}: ScrollZoomImageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: frameRef, offset: ['start end', 'end start'] });
  const frameScale = useTransform(scrollYProgress, [0, 0.35], [0.94, 1]);
  const photoScale = useTransform(scrollYProgress, [0, 0.45], [1.12, 1.02]);
  const photoY = useTransform(scrollYProgress, [0, 1], [`-${parallax}%`, `${parallax}%`]);

  const isStatic = prefersReducedMotion;

  return (
    <motion.div
      ref={frameRef}
      style={isStatic ? undefined : { scale: frameScale }}
      className={cn('relative overflow-hidden bg-cream-200', className)}
    >
      <motion.div
        style={isStatic ? undefined : { scale: photoScale, y: photoY }}
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          unoptimized={unoptimized}
          sizes={sizes}
          className="object-cover"
        />
      </motion.div>
    </motion.div>
  );
}
