import Link from 'next/link';

import { MapPinIcon } from '@/components/icons';
import { SITE } from '@/lib/site';
import { BrandMark } from './BrandMark';

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'TikTok', href: 'https://tiktok.com' },
  { label: 'WhatsApp', href: 'https://wa.me/51900000000' },
];

const SECTION_LINKS = [
  { label: 'Cómo funciona', href: '/#como-funciona' },
  { label: 'Publicar', href: '/#publicar' },
  { label: 'Mascotas', href: '/#mascotas' },
  { label: 'Preguntas', href: '/#preguntas' },
];

const LEGAL_LINKS = [
  { label: 'Términos y condiciones', href: '/terminos' },
  { label: 'Política de privacidad', href: '/privacidad' },
];

export function SiteFooter() {
  return (
    // pb extra en mobile: la barra flotante de publicación no debe tapar el cierre.
    <footer className="border-t border-ink-900/10 bg-cream-100 pb-28 pt-10 sm:pb-10">
      <div className="shell grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-3">
          <BrandMark />
          <p className="max-w-[22rem] text-xs leading-relaxed text-ink-500">
            Ayudamos a que cada mascota llegue a un buen hogar, sin juzgar a quien la entrega.
          </p>
        </div>

        <nav aria-label="Secciones del sitio" className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-ink-900">Secciones</h2>
          {SECTION_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-ink-500 transition-colors hover:text-ink-900 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Legales" className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-ink-900">Legales</h2>
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-ink-500 transition-colors hover:text-ink-900 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Redes sociales" className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-ink-900">Síguenos</h2>
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs text-ink-500 transition-colors hover:text-ink-900 hover:underline"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-ink-900">Contacto</h2>
          <a
            href={`mailto:${SITE.contactEmail}`}
            className="text-xs text-ink-500 transition-colors hover:text-ink-900 hover:underline"
          >
            {SITE.contactEmail}
          </a>
          <p className="flex items-start gap-1.5 text-xs text-ink-500">
            <MapPinIcon size={16} className="mt-0.5 shrink-0 text-sage-600" />
            Perú · Lima Metropolitana y Callao
          </p>
        </div>
      </div>

      <div className="shell mt-8 flex flex-col gap-2 border-t border-ink-900/10 pt-5 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {SITE.name}. Hecho con cuidado.</p>
        <p>Publicar es gratis y siempre lo va a ser.</p>
      </div>
    </footer>
  );
}
